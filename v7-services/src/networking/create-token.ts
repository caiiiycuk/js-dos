import { error, badRequest, success } from "../responses-lambda";
import { create } from "./token";

export const createToken = async (event: any) => {
    const { namespace, id, region } = event.body;

    if (!namespace || !id || !region) {
        return badRequest();
    }

    try {
        return success({
            token: await create(namespace, id, region),
        });
    } catch (e) {
        return error(e.message);
    }
};
