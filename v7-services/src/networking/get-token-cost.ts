import { error, badRequest, success } from "../responses";
import { getDayOrigin } from "./day";
import { freeTierSoftLimit, freeTierSec, freeTierHardLimit } from "./limits";
import { getFreeTierHardCount, getFreeTierSoftCount } from "./token";

export const getTokenCost = async (event: any) => {
    const namespace = event.queryStringParameters?.namespace;
    const id = event.queryStringParameters?.id;
    const durationSec = Number.parseInt(event.queryStringParameters?.durationSec);
    const day = getDayOrigin();

    if (!namespace || !id || !durationSec || isNaN(durationSec)) {
        return badRequest();
    }

    if (freeTierSec !== durationSec) {
        return error("30-min-required");
    }

    if (await getFreeTierSoftCount(namespace, id, day) >= freeTierSoftLimit) {
        return error("free-soft-limit");
    }

    if (await getFreeTierHardCount(day) >= freeTierHardLimit) {
        return error("free-hard-limit");
    }

    return success({
        cost: 0,
    });
};
