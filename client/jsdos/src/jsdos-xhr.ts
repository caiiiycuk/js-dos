import { Cache, XhrOptions } from "../../interface/jsdos-interface";
import CacheNoop from "../../jsdos-cache/jsdos-cache-noop";

// # XhrRequest
// `XhrRequest` is small wrapper over XMLHttpRequest, that provides some
// handy methods


export async function XhrRequest(url: string, options: XhrOptions): Promise<string | ArrayBuffer> {
    return await new Promise<string | ArrayBuffer>((resolve, reject) => {
        new Xhr(url, {
            ...options,
            success: resolve,
            fail: (message: string) => {
                reject(new Error(message));
            }
        });
    });
};

// private implementation
interface XhrOptionsInternal extends XhrOptions {
    success?: (response: any) => void;
    fail?: (message: string) => void;
}
// * `success` - callback when resource is downloaded
// * `fail` - fail callback


// Class Xhr does not have any public methods
class Xhr {
    private cache: Cache;
    private resource: string;
    private options: XhrOptionsInternal;
    private xhr: XMLHttpRequest | null = null;
    private total: number = 0;
    private loaded: number = 0;

    constructor(url: string, options: XhrOptionsInternal) {
        this.resource = url;
        this.options = options;
        this.options.method = options.method || "GET";
        this.cache = options.cache || new CacheNoop();

        if (this.options.method  === "GET") {
            this.cache.get(this.resource)
                .then((data: string | ArrayBuffer) => {
                    if (this.options.success !== undefined) {
                        this.options.success(data);
                    }
                })
                .catch(() => {
                    this.makeHttpRequest();
                });
        }
    }

    private makeHttpRequest() {
        this.xhr = new XMLHttpRequest();
        this.xhr.open(this.options.method || "GET", this.resource, true);
        if (this.options.method === "POST") {
            this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        this.xhr.overrideMimeType("text/plain; charset=x-user-defined");

        let progressListner;
        if (typeof (progressListner = this.xhr).addEventListener === "function") {
            progressListner.addEventListener("progress", (evt) => {
                this.total = evt.total;
                this.loaded = evt.loaded;
                if (this.options.progress) {
                    return this.options.progress(evt.total, evt.loaded);
                }
            });
        }

        let errorListener;
        if (typeof (errorListener = this.xhr).addEventListener === "function") {
            errorListener.addEventListener("error", (evt) => {
                if (this.options.fail) {
                    this.options.fail("Unalbe to download '" + this.resource + "', code: " + (this.xhr as XMLHttpRequest).status);
                    return delete this.options.fail;
                }
            });
        }
        this.xhr.onreadystatechange = () => {
            return this.onReadyStateChange();
        };
        if (this.options.responseType) {
            this.xhr.responseType = this.options.responseType;
        }
        this.xhr.send(this.options.data);
    }

    private onReadyStateChange() {
        const xhr = (this.xhr as XMLHttpRequest);
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (this.options.success) {
                    const total = Math.max(this.total, this.loaded);
                    if (this.options.progress !== undefined) {
                        this.options.progress(total, total);
                    }

                    if (this.options.method === "GET" && this.resource.indexOf("?") < 0) {
                        this.cache.put(this.resource, xhr.response);
                    }

                    return this.options.success(xhr.response);
                }
            } else if (this.options.fail) {
                this.options.fail("Unable to download '" + this.resource + "', code: " + xhr.status);
                return delete this.options.fail;
            }
        }
    }

}

