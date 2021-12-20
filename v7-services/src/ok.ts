import { Handler } from "aws-lambda";

import { success } from "./responses";

export const ok: Handler = async (event: any) => {
    return success({});
};
