import { Handler } from "aws-lambda";

import { success } from "./responses-proxy";

export const ok: Handler = async (event: any) => {
    return success({});
};
