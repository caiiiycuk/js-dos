export function success(body: any) {
    return {
        code: 200,
        ...body,
    };
}

export function error(message: string, code?: number) {
    return {
        code: code ?? 500,
        message: message ?? "unknown(empty)",
    };
}

export function badRequest(message: string = "error_bad_request") {
    return error(message, 400);
}

export function forbidden() {
    return error("error_forbidden", 403);
}
