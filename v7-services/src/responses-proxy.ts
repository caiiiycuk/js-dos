export function success(body: any) {
    return response(200, body, true);
}

export function error(errorCode: string, code: number = 200) {
    return response(code, { errorCode }, false);
}

export function badRequest(code: number = 200) {
    return error("error_bad_request", code);
}

export function noSession(code: number = 200) {
    return error("error_no_session", code);
}

function response(code: number, body: any, success: boolean) {
    body.success = success;

    return {
        statusCode: code,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(body, null, 2),
    };
}
