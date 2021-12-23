import { error, badRequest, success } from "../responses";
import { tokenNewTask } from "./token";

export const getNewIpx = async (event: any) => {
    const token = event.queryStringParameters?.token;
    if (!token) {
        return badRequest();
    }

    try {
        await tokenNewTask(token, "ipx-server");
        return success({});
    } catch (e) {
        console.error("Can't start ipx-server", e);
        return error(e.message);
    }
};
