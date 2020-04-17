const jsdosUrl: string = (window as any).wdosboxUrl;


test("js-dos-fs clearing IDBFS db", (done) => {
    const errorFn = (event) => {
        console.error(event);
        assert.fail();
    };

    const deleteTest = indexedDB.deleteDatabase("/test");
    deleteTest.onerror = errorFn;
    deleteTest.onsuccess = (event) => {
        const deleteArkanoid = indexedDB.deleteDatabase("/arkanoid");
        deleteArkanoid.onerror = errorFn;
        deleteArkanoid.onsuccess = (event) => {
            done();
        };
    };
});

test("js-dos-fs can mount archive on persistent point [empty db]", (done) => {
    let isOnProgress = false;
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
        onerror: (message) => {
            assert.fail();
        },
        onprogress: (stage: string, total: number, loaded: number) => {
            isOnProgress = true;
        },
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extract("digger.zip", "/test"), () => {
            doNext(main(), (ci) => {
                doNext(ci.shell("dir test"), () => {
                    assert.ok(isOnProgress);
                    compareAndExit("persistent-mount.png", ci, done);
                });
            });
        });
    });
});

test("js-dos-fs can mount archive on persistent point [existent db]", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
        onerror: (message) => {
            assert.fail();
        },
        onprogress: (stage: string, total: number, loaded: number) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extract("digger.zip", "/test"), () => {
            doNext(main(), (ci) => {
                doNext(ci.shell("dir test"), () => {
                    compareAndExit("persistent-mount.png", ci, done);
                });
            });
        });
    });
});

test("js-dos-fs can mount ANOTHER archive on persistent point [empty db]", (done) => {
    let isOnProgress = false;
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
        onerror: (message) => {
            assert.fail();
        },
        onprogress: (stage: string, total: number, loaded: number) => {
            isOnProgress = true;
        },
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extract("arkanoid.zip", "/arkanoid"), () => {
            doNext(main(), (ci) => {
                doNext(ci.shell("dir arkanoid"), () => {
                    assert.ok(isOnProgress);
                    compareAndExit("persistent-mount-arkanoid.png", ci, done);
                });
            });
        });
    });
});

test("js-dos-fs can mount ANOTHER archive on persistent point [existent db]", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
        onerror: (message) => {
            assert.fail();
        },
        onprogress: (stage: string, total: number, loaded: number) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extract("arkanoid.zip", "/arkanoid"), () => {
            doNext(main(), (ci) => {
                doNext(ci.shell("dir arkanoid"), () => {
                    compareAndExit("persistent-mount-arkanoid.png", ci, done);
                });
            });
        });
    });
});

test("js-dos-fs can mount multiple persistent point [existent db]", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
        onerror: (message) => {
            assert.fail();
        },
        onprogress: (stage: string, total: number, loaded: number) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extractAll([
            { url: "arkanoid.zip", mountPoint: "/arkanoid" },
            { url: "digger.zip", mountPoint: "/test" },
        ]), () => {
            doNext(main(), (ci) => {
                doNext(ci.shell("dir arkanoid", "dir ..\\test"), () => {
                    compareAndExit("persistent-mount-multiple.png", ci, done);
                });
            });
        });
    });
});

suite("js-dos");


test("js-dos can create and read dosbox.conf", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
        onerror: (message) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        fs.createFile("dosbox.conf", `
            [autoexec]
            mount c .
            c:
            type dosbox~1.con
        `);
        doNext(main(["-conf", "dosbox.conf"]), (ci) => {
            compareAndExit("dosboxconf.png", ci, done);
        });
    });
});

test("js-dos can run digger.zip", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        jsdosUrl,
    });

    doReady(dos, (fs, main) => {
        doNext(fs.extract("digger.zip"), () => {
            doNext(main(["DIGGER.COM"]), (ci) => {
                const fn = () => {
                    compareAndExit("digger.png", ci, done);
                    // saveImage(ci);
                };

                setTimeout(fn, 5000);
            });
        });
    });
});

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

const saveImage = (ci: DosCommandInterface) => {
    ci.screenshot().then((data) => {
        const w = window.open("about:blank", "image from canvas");
        w.document.write("<img src='" + data + "' alt='from canvas'/>");
    });
};

