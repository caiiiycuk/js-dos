export function downloadUrlToFs(fileName: string, url: string, targetBlank = true) {
    const a = document.createElement("a");
    a.href = url;
    a.target = targetBlank ? "_blank" : "_self";
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);

    a.click();
    a.remove();
}

export function downloadArrayToFs(fileName: string, data: Uint8Array, type = "application/zip") {
    const blob = new Blob([data], {
        type,
    });
    downloadUrlToFs(fileName, URL.createObjectURL(blob));
}
