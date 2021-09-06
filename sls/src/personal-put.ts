import { Handler } from "aws-lambda";

import { badRequest, noSession, success } from "./responses";
import { validateUser } from "./user";

import * as AWS from "aws-sdk";
import { getPersonalBundleUrl } from "./personal";

const PutCurlLambda = process.env.PUT_CURL as string;
const lambda = new AWS.Lambda();

export const personalPut: Handler = async (event: any) => {
    const namespace = event.queryStringParameters.namespace;
    const id = event.queryStringParameters.id;
    const bundleUrl = event.queryStringParameters.bundleUrl;

    if (!bundleUrl || bundleUrl.length === 0) {
        return badRequest();
    }

    if (!validateUser(namespace, id)) {
        return noSession();
    }

    const personalUrl = getPersonalBundleUrl(namespace, id, bundleUrl);

    const result = await lambda.invoke({
        FunctionName: PutCurlLambda,
        Payload: JSON.stringify({
            bundleUrl: personalUrl,
        }),
    }).promise();

    return success({ payload: result.Payload });
}
