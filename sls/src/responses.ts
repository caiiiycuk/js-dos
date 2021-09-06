export function success(body: any) {
    return response200(body, true);
}

export function error(errorCode: string) {
    return response200({ errorCode }, false);
}

export function badRequest() {
    return error("error_bad_request");
}

export function noSession() {
    return error("error_no_session");
}

function response200(body: any, success: boolean) {
    body.success = success;

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(body, null, 2)
    };
}
