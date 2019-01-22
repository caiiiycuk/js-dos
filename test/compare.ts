import * as assert from "assert";
import { DosCommandInterface } from "../js-dos-ts/js-dos-ci";
import { doThen } from "./do";

// Compare
// =======
// Compare image from url, and screenshot from DosBox

export function compareAndExit(imageUrl: string, ci: DosCommandInterface, done: () => void) {
    compare(imageUrl, ci, (wrong) => {
        assert.equal(0, wrong);
        ci.exit();
        done();
    });
}

const compare = (imageUrl: string, ci: DosCommandInterface, callback: (wrong: number) => void) => {
    doThen(ci.screenshot(), (actualUrl: string) => {
        const img = new Image();
        img.onload = () => {
            assert(img.width === ci.width(), "Invalid width: " + ci.width() + ", should be " + img.width);
            assert(img.height === ci.height(), "Invalid height: " + ci.height() + ", should be " + img.height);

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const expected = ctx.getImageData(0, 0, img.width, img.height).data;

            const actualImage = new Image();
            actualImage.onload = () => {
                /*
                document.body.appendChild(img); // for comparisons
                var div = document.createElement('div');
                div.innerHTML = '^=expected, v=actual';
                document.body.appendChild(div);
                document.body.appendChild(actualImage); // to grab it for creating the test reference
                */

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
                callback(wrong);
            };
            actualImage.src = actualUrl;
        };
        img.src = imageUrl;
    });
};
