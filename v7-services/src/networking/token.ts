import * as AWS from "aws-sdk";
import { freeTierHardLimit, freeTierSec, freeTierSoftLimit } from "./limits";
import { customAlphabet } from "nanoid/async";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const NETWORKING_TABLE = process.env.NETWORKING_TABLE as string;
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

export async function getFreeTierSoftCount(namespace: string, id: string, day: number): Promise<number> {
    const freeTierSoftKey = getFreeTierSoftKey(namespace, id, day);
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

export async function createFreeToken(namespace: string, id: string, day: number, region: string): Promise<string> {
    const freeTierSoftKey = getFreeTierSoftKey(namespace, id, day);
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

    return createToken(namespace, id, day, region, freeTierSec);
}

export async function getToken(token: string) {
    const item = (await dynamoDb.get({
        TableName: NETWORKING_TABLE,
        Key: {
            key: "token " + token,
        },
    }).promise()).Item;

    if (item === undefined) {
        throw new Error("not-found");
    }

    item.ttlSec = Math.round((item.endTime - new Date().getTime()) / 1000);

    return item;
}

export async function createToken(namespace: string, id: string, day: number,
                                  region: string, durationSec: number): Promise<string> {
    let token: string | null = null;
    while (token === null) {
        token = await nanoid();

        const createParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: NETWORKING_TABLE,
            Item: {
                "key": "token " + token,
                namespace,
                id,
                day,
                region,
                durationSec,
                "createdAt": new Date().getTime(),
                "endTime": new Date().getTime() + durationSec * 1000,
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

function getFreeTierSoftKey(namespace: string, id: string, day: number) {
    return "free-soft " + day + " " + id + "@" + namespace;
}

function getFreeTierHardKey(day: number) {
    return "free-hard " + day;
}
