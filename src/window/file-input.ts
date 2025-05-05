const fileInput = document.createElement("input");
fileInput.type = "file";

export function uploadFile(callback: (el: HTMLInputElement) => void) {
    const listener = () => {
        fileInput.removeEventListener("change", listener);
        callback(fileInput);
    };
    fileInput.addEventListener("change", listener);
    fileInput.click();
}
