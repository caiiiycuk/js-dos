export function send(method: "get" | "post" | "head" | "put",
                     url: string,
                     responseType: XMLHttpRequestResponseType,
                     body?: string | ArrayBuffer,
                     onprogress?: (progress: number) => void,
                     headers?: { [name: string]: string }): Promise<string | ArrayBuffer> {
    return new Promise<string>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.responseType = responseType;
        request.open(method, url, true);

        request.addEventListener("load", () => {
            if (request.status !== 200) {
                reject(new Error("Wrong status code " + request.status));
            } else if (responseType === "text") {
                resolve(request.responseText);
            } else if (responseType === "arraybuffer") {
                resolve(request.response);
            } else {
                reject(new Error("Unsupported responseType " + responseType));
            }
        }, false);
        request.addEventListener("error", () => {
            reject(new Error("HTTP GET failed for url " + url));
        }, false);
        request.addEventListener("abort", () => {
            reject(new Error("HTTP GET canceled for url " + url));
        }, false);

        if (onprogress !== undefined) {
            request.onprogress = (event) => {
                if (event.loaded && event.total && event.total > 0) {
                    const porgress = Math.round(event.loaded * 10000 / event.total) / 100;
                    onprogress(porgress);
                }
            };
        }

        if (headers !== undefined) {
            for (const key of Object.keys(headers)) {
                request.setRequestHeader(key, headers[key]);
            }
        }

        request.send(body);
    });
}

export async function postObject(url: string, data?: string | ArrayBuffer): Promise<any> {
    const response = JSON.parse(await (post(url, "text", data) as Promise<string>));

    if (response.success) {
        return response;
    }

    if (response.errorCode !== undefined) {
        throw new Error(response.errorCode);
    }

    throw new Error("POST Object request failed:\n Payload:\n" + JSON.stringify(response.body, null, 2));
}

export async function getObject(url: string): Promise<any> {
    const response = JSON.parse(await (send("get", url, "text") as Promise<string>));

    if (response.success) {
        return response;
    }

    if (response.errorCode !== undefined) {
        throw new Error(response.errorCode);
    }

    throw new Error("GET Object request failed:\n Payload:\n" + JSON.stringify(response, null, 2));
}

export function post(url: string,
                     responseType: XMLHttpRequestResponseType,
                     data?: string | ArrayBuffer): Promise<string | ArrayBuffer> {
    return send("post", url, responseType, data);
}
