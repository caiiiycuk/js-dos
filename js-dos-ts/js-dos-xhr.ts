interface XhrOptions {
    method?: string;
    success?: (response: any) => void;
    progress?: (total: number, loaded: number) => void;
    fail?: (url: string, status: number, message: string) => void;
    data?: string;
    responseType?: string;
}

export class Xhr {
    public bytesReceived: number;

    private resource: string;
    private options: XhrOptions;
    private xhr: XMLHttpRequest;

    constructor(url: string, options: XhrOptions) {
        this.resource = url;
        this.options = options;
        this.options.method = options.method || "GET";
        this.bytesReceived = 0;
        this.xhr = new XMLHttpRequest();
        this.xhr.open(this.options.method, url, true);
        if (this.options.method === "POST") {
            this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        this.xhr.overrideMimeType("text/plain; charset=x-user-defined");

        let progressListner;
        if (typeof (progressListner = this.xhr).addEventListener === "function") {
            progressListner.addEventListener("progress", (evt) => {
                this.bytesReceived = evt.loaded;
                if (this.options.progress) {
                    return this.options.progress(evt.total, evt.loaded);
                }
            });
        }

        let errorListener;
        if (typeof (errorListener = this.xhr).addEventListener === "function") {
            errorListener.addEventListener("error", (evt) => {
                if (this.options.fail) {
                    this.options.fail(this.resource, this.xhr.status, "connection problem");
                    return delete this.options.fail;
                }
            });
        }
        this.xhr.onreadystatechange = () => {
            return this.onReadyStateChange();
        };
        if (this.options.responseType) {
            this.xhr.responseType = this.options.responseType as XMLHttpRequestResponseType;
        }
        this.xhr.send(this.options.data);
    }

    public onReadyStateChange() {
        if (this.xhr.readyState === 4) {
            if (this.xhr.status === 200) {
                if (this.options.success) {
                    return this.options.success(this.xhr.response);
                }
            } else if (this.options.fail) {
                this.options.fail(this.resource, this.xhr.status, "connection problem");
                return delete this.options.fail;
            }
        }
    }

    public arrayBufferToString(buffer: ArrayBuffer) {
        const bufView = new Uint16Array(buffer);
        const length = bufView.length;
        let result = "";
        let maxCallSize = Math.pow(2, 16) - 1;
        let i = 0;
        while (i < length) {
            if (i + maxCallSize > length) {
                maxCallSize = length - i;
            }
            result += String.fromCharCode.apply(null, bufView.subarray(i, i + maxCallSize));
            i += maxCallSize;
        }
        return result;
    }

}
