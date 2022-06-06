import { Handler } from "aws-lambda";

import { badRequest, noSession, success } from "./responses-proxy";
import { validateUser } from "./user";

import * as AWS from "aws-sdk";
import { getPersonalBundleUrl } from "./personal";

const PutCurlLambda = process.env.PUT_CURL as string;
const lambda = new AWS.Lambda();

export const personalPut: Handler = async (event: any) => {
    const namespace = event.queryStringParameters.namespace;
    const id = event.queryStringParameters.id;
    const bundleUrl = event.queryStringParameters.bundleUrl;
    const publishToken = event.queryStringParameters.publishToken;

    if (!bundleUrl || bundleUrl.length === 0) {
        return badRequest();
    }

    if (!validateUser(namespace, id)) {
        return noSession();
    }

    const personalUrl = getPersonalBundleUrl(namespace, id, bundleUrl, publishToken);

    const result = await lambda.invoke({
        FunctionName: PutCurlLambda,
        Payload: JSON.stringify({
            publishToken,
            bundleUrl: personalUrl,
        }),
    }).promise();

    return success({ payload: result.Payload });
};
