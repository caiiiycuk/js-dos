import { assert } from "chai";
import { CommandInterface } from "../../src/emulators";

// Compare
// =======
// Compare image from url, and screenshot from DosBox

export function compareAndExit(imageUrl: string, ci: CommandInterface, threshold: number = 0) {
    return new Promise((resolve, reject) => {
        const fn = () => {
            compare(imageUrl, ci, threshold)
                .then((wrong) => {
                    const exitPromise = ci.exit();
                    assert.ok(wrong <= threshold, "Image not same, wrong: " + wrong);
                    exitPromise.then(resolve).catch(reject);
                })
                .catch(reject);
        };

        // give chance to render all queued frames
        setTimeout(fn, 300);
    });
}

const compare = (imageUrl: string, ci: CommandInterface, threshold: number) => {
    return ci.screenshot()
        .then((imageData: ImageData) => {
            const canvas = document.createElement("canvas");
            canvas.width = imageData.width;
            canvas.height = imageData.height;

            const ctx = canvas.getContext("2d");
            ctx.putImageData(imageData, 0, 0);

            return canvas.toDataURL("image/png");
        })
        .then((actualUrl: string) => new Promise<number>((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const expected = ctx.getImageData(0, 0, img.width, img.height).data;

                const actualImage = new Image();
                actualImage.onload = () => {
                    const renderComparsion = () => {
                        document.body.appendChild(document.createElement("hr"));
                        document.body.appendChild(img); // for comparisons
                        const div = document.createElement('div');
                        div.innerHTML = '^=expected, v=actual';
                        document.body.appendChild(div);
                        document.body.appendChild(actualImage); // to grab it for creating the test reference
                    };

                    if (img.width !== actualImage.width ||
                        img.height !== actualImage.height) {
                        renderComparsion();
                        assert(img.width === actualImage.width, "Invalid width: " + actualImage.width + ", should be " + img.width);
                        assert(img.height === actualImage.height, "Invalid height: " + actualImage.height + ", should be " + img.height);
                    }

                    const actualCanvas = document.createElement("canvas");
                    actualCanvas.width = actualImage.width;
                    actualCanvas.height = actualImage.height;
                    const actualCtx = actualCanvas.getContext("2d");
                    actualCtx.drawImage(actualImage, 0, 0);
                    const actual = actualCtx.getImageData(0, 0, actualImage.width, actualImage.height).data;

                    let total = 0;
                    const width = img.width;
                    const height = img.height;
                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {
                            total += Math.abs(expected[y * width * 4 + x * 4 + 0] - actual[y * width * 4 + x * 4 + 0]);
                            total += Math.abs(expected[y * width * 4 + x * 4 + 1] - actual[y * width * 4 + x * 4 + 1]);
                            total += Math.abs(expected[y * width * 4 + x * 4 + 2] - actual[y * width * 4 + x * 4 + 2]);
                        }
                    }

                    // floor, to allow some margin of error for antialiasing
                    const wrong = Math.floor(total / (img.width * img.height * 3));
                    if (wrong > threshold) {
                        renderComparsion();
                    }
                    resolve(wrong);
                };
                actualImage.src = actualUrl;
            };
            img.src = imageUrl;
        }))
};
