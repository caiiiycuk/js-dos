import { badRequest, error, success } from "../../responses-lambda";
import { getToken } from "../token";

export const testIpx = async (event: any) => {
    const { token, arn } = event.query;

    if (!token || !arn) {
        return badRequest();
    }

    try {
        const info = await getToken(token);
        const alive = info.endTime >= new Date().getTime() &&
            info.ipxArn === arn;
        return success({ alive });
    } catch (e) {
        return error(e.message);
    }
};
