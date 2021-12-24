import { error, badRequest, success } from "../../responses";
import { putIp } from "../token";

export const putIpxIp = async (event: any) => {
    const token = event.queryStringParameters?.token;
    const arn = event.queryStringParameters?.arn;
    const ip = event.queryStringParameters.ip;

    if (!token || !arn || !ip) {
        return badRequest();
    }

    try {
        await putIp(token, arn, ip, "ipx");
        return success({});
    } catch (e) {
        console.error("Can't update ipx ip", e);
        return error(e.message);
    }
};
