



# Xhr
`Xhr` is small wrapper over XMLHttpRequest, that provides some
handy methods








Xhr is called with url, and XhrOptions object:


  

```
interface XhrOptions {

```







`method` - "GET" | "POST"


  

```
    method?: string;

```







`success` - callback when resource is downloaded


  

```
    success?: (response: any) => void;

```







`progress` - callback for progress


  

```
    progress?: (total: number, loaded: number) => void;

```







`fail` - fail callback


  

```
    fail?: (url: string, status: number, message: string) => void;

```







`data` - data for POST request, should typeof `application/x-www-form-urlencoded`


  

```
    data?: string;

```







`responseType` - XMLHttpRequestResponseType


  

```
    responseType?: XMLHttpRequestResponseType;
}


```







Class Xhr does not have any public methods


  

```
export class Xhr {
    private resource: string;
    private options: XhrOptions;
    private xhr: XMLHttpRequest;
    private total: number = 0;
    private loaded: number = 0;

    constructor(url: string, options: XhrOptions) {
        this.resource = url;
        this.options = options;
        this.options.method = options.method || "GET";
        this.xhr = new XMLHttpRequest();
        this.xhr.open(this.options.method, url, true);
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
                    this.options.fail(this.resource, this.xhr.status, "connection problem");
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
        if (this.xhr.readyState === 4) {
            if (this.xhr.status === 200) {
                if (this.options.success) {
                    const total = Math.max(this.total, this.loaded);
                    this.options.progress(total, total);
                    return this.options.success(this.xhr.response);
                }
            } else if (this.options.fail) {
                this.options.fail(this.resource, this.xhr.status, "connection problem");
                return delete this.options.fail;
            }
        }
    }

    private arrayBufferToString(buffer: ArrayBuffer) {
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


```




