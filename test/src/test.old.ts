
test("js-dos can simulate key events", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extract("digger.zip"), () => {
            doNext(main(["DIGGER.COM"]), (ci) => {
                const keyPress = () => {
                    ci.simulateKeyPress(DosKeys.KBD_left);
                };


                const screenshot = () => {
                    compareAndExit("digger-end.png", ci, done);
                };

                setTimeout(keyPress, 2000);
                setTimeout(screenshot, 3000);
            });
        });
    });
});


