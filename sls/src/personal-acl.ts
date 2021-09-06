import { Handler } from "aws-lambda";

import { badRequest, noSession, success } from "./responses";

import * as AWS from "aws-sdk";
import { validateUser } from "./user";
import { getPersonalBundleKey, uploadsS3Bucket } from "./personal";

const s3 = new AWS.S3();

export const personalAcl: Handler = async (event: any) => {
    const namespace = event.queryStringParameters.namespace;
    const id = event.queryStringParameters.id;
    const bundleUrl = event.queryStringParameters.bundleUrl;

    if (!bundleUrl || bundleUrl.length === 0) {
        return badRequest();
    }

    if (!validateUser(namespace, id)) {
        return noSession();
    }

    const personalKey = getPersonalBundleKey(namespace, id, bundleUrl);

    await s3.putObjectAcl({
        Bucket: uploadsS3Bucket,
        Key: personalKey,
        ACL: "public-read",
    }).promise();

    return success({});
}
