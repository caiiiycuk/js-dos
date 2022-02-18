import { error, badRequest, success } from "../responses-lambda";
import { getDayOrigin } from "./day";
import { freeTierTtl, freeTierSoftLimit, freeTierHardLimit } from "./limits";
import { addFreeTierTime, getFreeTierHardCount, getFreeTierSoftCount, getToken } from "./token";

export const addTokenFreeTierTime = async (event: any) => {
    const { token } = event.body;
    const day = getDayOrigin();

    if (!token) {
        return badRequest();
    }

    const softCount = await getFreeTierSoftCount(token, day);
    if (softCount >= freeTierSoftLimit) {
        return error("free-soft-limit");
    }

    const hardCount = await getFreeTierHardCount(day);
    if (hardCount >= freeTierHardLimit) {
        return error("free-hard-limit");
    }

    const tokenInfo = await getToken(token);
    if (tokenInfo.ttlSec > freeTierTtl) {
        return error("too-early");
    }

    try {
        await addFreeTierTime(token, day);
        return success({});
    } catch (e) {
        return error(e.message);
    }
};
