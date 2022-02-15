import { error, badRequest, success } from "../../responses-proxy";
import { stopTask } from "../token";

export const stopIpx = async (event: any) => {
    const token = event.queryStringParameters?.token;
    const arn = event.queryStringParameters?.arn;

    if (!token || !arn) {
        return badRequest();
    }

    try {
        await stopTask(token, arn, "ipx");
        return success({});
    } catch (e) {
        console.error("Can't update ipx address", e);
        return error(e.message);
    }
};
