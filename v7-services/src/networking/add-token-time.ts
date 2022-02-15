import { error, badRequest, success } from "../responses-lambda";
import { addTime as tokenAddTime } from "./token";

export const addTokenTime = async (event: any) => {
    const { token, durationSec } = event;

    if (!token || !durationSec || isNaN(durationSec)) {
        return badRequest();
    }

    try {
        await tokenAddTime(token, durationSec);
        return success({});
    } catch (e) {
        return error(e.message);
    }
};
