import { badRequest, error, success } from "../responses-lambda";
import { getToken } from "./token";

export const getTokenInfo = async (event: any) => {
    const token = event.query.token;

    if (!token) {
        return badRequest();
    }

    try {
        return success(await getToken(token));
    } catch (e) {
        return error(e.message);
    }
};
