import * as AWS from "aws-sdk";
import { error } from "../responses-lambda";

const lambda = new AWS.Lambda();
const CreateTokenLambda = process.env.CREATE_TOKEN as string;

export async function createToken(event: any) {
    try {
        const result = await lambda.invoke({
            FunctionName: CreateTokenLambda,
            Payload: JSON.stringify(event),
        }).promise();


        if (!result.Payload) {
            console.error("unparsable response", result);
            throw new Error("unable-to-create-token");
        }

        return JSON.parse(result.Payload as any);
    } catch (e: any) {
        return error(e.message);
    }
}
