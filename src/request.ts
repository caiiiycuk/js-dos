export async function request(endpoint: string, method: string = "GET", body: BodyInit | null = null): Promise<any> {
    const result = await fetch(endpoint, {
        method,
        body,
        headers: new Headers({ "content-type": "application/json" }),
    }).then((r) => r.json());

    if (result.code !== 200) {
        throw new Error(result.message ?? "code: " + result.code);
    }

    return result;
}
