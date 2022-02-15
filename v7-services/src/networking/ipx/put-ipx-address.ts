import { error, badRequest, success } from "../../responses-proxy";
import { putAddress } from "../token";

export const putIpxAddress = async (event: any) => {
    const token = event.queryStringParameters?.token;
    const arn = event.queryStringParameters?.arn;
    const address = event.queryStringParameters?.address;

    if (!token || !arn || !address) {
        return badRequest(400);
    }

    try {
        await putAddress(token, arn, address, "ipx");
        return success({});
    } catch (e) {
        console.error("Can't update ipx ip", e);
        return error(e.message, 500);
    }
};
