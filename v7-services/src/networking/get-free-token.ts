import { error, badRequest, success } from "../responses";
import { getDayOrigin } from "./day";
import { freeTierSoftLimit, freeTierHardLimit } from "./limits";
import { createFreeToken, getFreeTierHardCount, getFreeTierSoftCount } from "./token";

export const getFreeToken = async (event: any) => {
    const namespace = event.queryStringParameters?.namespace;
    const id = event.queryStringParameters?.id;
    const region = event.queryStringParameters?.region;
    const day = getDayOrigin();

    if (!namespace || !id || !region) {
        return badRequest();
    }

    const softCount = await getFreeTierSoftCount(namespace, id, day);
    if (softCount >= freeTierSoftLimit) {
        return error("free-soft-limit");
    }

    const hardCount = await getFreeTierHardCount(day);
    if (hardCount >= freeTierHardLimit) {
        return error("free-hard-limit");
    }

    try {
        return success({
            token: await createFreeToken(namespace, id, day, region),
        });
    } catch (e) {
        return error(e.message);
    }
};
