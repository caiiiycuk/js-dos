import { error, badRequest, success } from "../../responses-proxy";
import { newTask } from "../token";

export const startIpx = async (event: any) => {
    const token = event.queryStringParameters?.token;
    if (!token) {
        return badRequest();
    }

    try {
        return success({ arn: await newTask(token, "ipx") });
    } catch (e) {
        console.error("Can't start ipx-server", e);
        return error(e.message);
    }
};
