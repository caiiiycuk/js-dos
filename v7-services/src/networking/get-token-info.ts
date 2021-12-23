import { badRequest, error, success } from "../responses";
import { getToken } from "./token";

export const getTokenInfo = async (event: any) => {
    const token = event.queryStringParameters?.token;

    if (!token) {
        return badRequest();
    }

    try {
        return success(await getToken(token));
    } catch (e) {
        return error(e.message);
    }
};
