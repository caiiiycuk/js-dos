import * as AWS from "aws-sdk";
import { freeTierHardLimit, freeTierSec, freeTierSoftLimit } from "./limits";
import { customAlphabet } from "nanoid/async";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const NETWORKING_TABLE = process.env.NETWORKING_TABLE as string;

const lambda = new AWS.Lambda();
const RunInstanceLambda = process.env.RUN_INSTANCE as string;

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

interface Token {
    day: number,
    region: string,
    endTime: number,
    ttlSec: number,
    ipxArn?: string,
    ipxAddress?: string,
}

export type TaskType = "ipx";

export async function getFreeTierSoftCount(token: string, day: number): Promise<number> {
    const freeTierSoftKey = getFreeTierSoftKey(token, day);
    const response = await dynamoDb.get({
        TableName: NETWORKING_TABLE,
        Key: {
            key: freeTierSoftKey,
        },
    }).promise();

    return response.Item?.count || 0;
}

export async function getFreeTierHardCount(day: number): Promise<number> {
    const freeTierHardKey = getFreeTierHardKey(day);
    const response = await dynamoDb.get({
        TableName: NETWORKING_TABLE,
        Key: {
            key: freeTierHardKey,
        },
    }).promise();

    return response.Item?.count || 0;
}

export async function addFreeTierTime(token: string, day: number) {
    const freeTierSoftKey = getFreeTierSoftKey(token, day);
    const freeTierHardKey = getFreeTierHardKey(day);

    const inc = async (key: string, inc: number) => {
        const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: NETWORKING_TABLE,
            Key: {
                key,
            },
            UpdateExpression: "ADD #count :inc",
            ExpressionAttributeNames: {
                "#count": "count",
            },
            ExpressionAttributeValues: {
                ":inc": inc,
            },
            ReturnValues: "ALL_NEW",
        };

        const response = await dynamoDb.update(updateParams).promise();
        if (typeof response.Attributes?.count !== "number") {
            console.error("Can't get updated count value for key " + key, response);
            throw new Error("Can't get updated count value for key " + key);
        }

        return response.Attributes?.count as number;
    };

    const [softCount, hardCount] = await Promise.all([inc(freeTierSoftKey, 1), inc(freeTierHardKey, 1)]);

    try {
        if (softCount > freeTierSoftLimit) {
            throw new Error("free-soft-limit");
        }

        if (hardCount > freeTierHardLimit) {
            throw new Error("free-hard-limit");
        }
    } catch (e: any) {
        // rollback
        await Promise.all([inc(freeTierSoftKey, -1), inc(freeTierHardKey, -1)]);
        throw e;
    }

    await addTime(token, freeTierSec);
}

export async function addTime(tokenId: string, durationSec: number) {
    const key = getTokenKey(tokenId);
    const token = await getToken(tokenId);
    const now = new Date().getTime();
    const restTime = Math.max(token.endTime - now, 0);
    const endTime = now + restTime + durationSec * 1000;

    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: NETWORKING_TABLE,
        Key: {
            key,
        },
        UpdateExpression: "SET #endTime = :endTime",
        ExpressionAttributeNames: {
            "#endTime": "endTime",
        },
        ExpressionAttributeValues: {
            ":endTime": endTime,
        },
    };

    try {
        await dynamoDb.update(updateParams).promise();
    } catch (e: any) {
        console.error("Unable to add time", e);
        throw new Error("unexpected-error");
    }
}

export async function getToken(token: string): Promise<Token> {
    const item = (await dynamoDb.get({
        TableName: NETWORKING_TABLE,
        Key: {
            key: getTokenKey(token),
        },
    }).promise()).Item as Token | undefined;

    if (item === undefined) {
        throw new Error("not-found");
    }

    item.ttlSec = Math.round((item.endTime - new Date().getTime()) / 1000);

    return item;
}

export async function create(namespace: string, id: string, region: string): Promise<string> {
    let token: string | null = null;
    while (token === null) {
        token = await nanoid();

        const createParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: NETWORKING_TABLE,
            Item: {
                "key": getTokenKey(token),
                namespace,
                id,
                region,
                "createdAt": new Date().getTime(),
                "endTime": new Date().getTime(),
            },
            ConditionExpression: "attribute_not_exists(#key)",
            ExpressionAttributeNames: {
                "#key": "key",
            },
        };

        try {
            await dynamoDb.put(createParams).promise();
        } catch (e) {
            console.error(e);
            token = null;
        }
    }

    return token;
}

export async function newTask(tokenId: string, task: TaskType) {
    const token = await getToken(tokenId);

    if (token.ttlSec < 60) { // 1min to start container
        throw new Error("ended");
    }

    const result = await lambda.invoke({
        FunctionName: RunInstanceLambda,
        Payload: JSON.stringify({
            token: tokenId,
            region: token.region,
            task,
        }),
    }).promise();

    if (!result.Payload) {
        throw new Error("unable-to-start-task");
    }

    const payload = JSON.parse(JSON.parse(result.Payload as string).body);

    if (payload.success === false) {
        throw new Error(payload.errorCode);
    }

    const arn = payload.arn;

    if (arn === undefined) {
        throw new Error("ARN missed in runInstanceV2 response");
    }

    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: NETWORKING_TABLE,
        Key: {
            key: getTokenKey(tokenId),
        },
        UpdateExpression: `SET ${task}Arn = :arn`,
        ExpressionAttributeValues: {
            ":arn": arn,
        },
    };

    await dynamoDb.update(updateParams).promise();

    return arn;
}

export async function putAddress(token: string, arn: string, address: string, task: TaskType) {
    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: NETWORKING_TABLE,
        Key: {
            key: getTokenKey(token),
        },
        UpdateExpression: `SET ${task}Address = :address`,
        ConditionExpression: `${task}Arn = :arn`,
        ExpressionAttributeValues: {
            ":arn": arn,
            ":address": address,
        },
    };

    await dynamoDb.update(updateParams).promise();
}

export async function stopTask(token: string, arn: string, task: TaskType) {
    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: NETWORKING_TABLE,
        Key: {
            key: getTokenKey(token),
        },
        UpdateExpression: `REMOVE ${task}Arn, ${task}Address`,
        ConditionExpression: `${task}Arn = :arn`,
        ExpressionAttributeValues: {
            ":arn": arn,
        },
    };

    await dynamoDb.update(updateParams).promise();
}


function getFreeTierSoftKey(token: string, day: number) {
    return "free-soft " + day + " " + token;
}

function getFreeTierHardKey(day: number) {
    return "free-hard " + day;
}

function getTokenKey(token: string) {
    return "token " + token;
}
