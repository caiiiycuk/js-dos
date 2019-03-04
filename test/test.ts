/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import * as assert from "assert";
import { Dos } from "../js-dos-ts/js-dos";
import { ICache } from "../js-dos-ts/js-dos-cache";
import CacheDb from "../js-dos-ts/js-dos-cache-db";
import CacheNoop from "../js-dos-ts/js-dos-cache-noop";
import { DosCommandInterface } from "../js-dos-ts/js-dos-ci";
import { Host } from "../js-dos-ts/js-dos-host";
import { DosModule } from "../js-dos-ts/js-dos-module";
import { DosOptions } from "../js-dos-ts/js-dos-options";
import { compareAndExit } from "./compare";
import { doCatch, doNext, doReady, doThen } from "./do";

suite("js-dos-host");

test("loader should notify about error if wasm is not supported", (done) => {
    const oldValue = Host.wasmSupported;
    Host.wasmSupported = false;
    Host.resolveDosBox("wrongurl.js", new CacheNoop(), {
        onerror: (message: string) => {
            Host.wasmSupported = oldValue;
            assert.equal("WebAssembly is not supported, can't resolve wdosbox", message);
            done();
        },
    } as DosModule);
});

test("loader should notify about error, if it can't download wdosbox", (done) => {
    Host.resolveDosBox("wrongurl.js", new CacheNoop(), {
        onerror: (message: string) => {
            assert.equal("Can't download wasm, code: 404, message: connection problem, url: wrongurl.wasm.js", message);
            done();
        },
    } as DosModule);
});

test("loader should show progress loading and use cache", (done) => {
    let isGET = false;
    let isPUT = false;
    class TestCache implements ICache {
        public put(key: string, data: any, onflush: () => void) {
            isPUT = isPUT || (key === "/wdosbox.wasm.js" && data instanceof ArrayBuffer && (data as ArrayBuffer).byteLength > 0);
            onflush();
        }

        public get(key: string, ondata: (data: any) => void, onerror: (msg: string) => void) {
            isGET = isGET || key === "/wdosbox.wasm.js";
            onerror("not in cache");
        }

        public forEach(each: (key: string, value: any) => void, onend: () => void) {
            onend();
        }
    }

    let lastLoaded = -1;
    Host.resolveDosBox("/wdosbox.js", new TestCache(), {
        onprogress: (stage: string, total: number, loaded: number) => {
            console.log(stage, total, loaded);
            assert.equal(true, loaded <= total, loaded + "<=" + total);
            assert.equal(true, lastLoaded <= loaded, lastLoaded + "<=" + loaded);
            lastLoaded = loaded;
        },
        ondosbox: (dosbox: any, instantiateWasm: any) => {
            assert.ok(isGET);
            assert.ok(isPUT);
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as DosModule);
});

test("loader should never load twice wdosbox", (done) => {
    Host.resolveDosBox("/wdosbox.js", new CacheNoop(), {
        onprogress: (stage: string, total: number, loaded: number) => {
            assert.fail();
        },
        ondosbox: (dosbox: any, instantiateWasm: any) => {
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as DosModule);
});

test("loader should fire event when wdosbox is loaded", (done) => {
    Host.resolveDosBox("/wdosbox.js", new CacheNoop(), {
        ondosbox: (dosbox: any, instantiateWasm: any) => {
            assert.ok(dosbox);
            assert.ok(instantiateWasm);
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as DosModule);
});

suite("js-dos");

test("js-dos can't start without canvas (listener style)", (done) => {
    Dos(null, {
        wdosboxUrl: "/wdosbox.js",
        onerror: (message: string) => {
            assert.equal("canvas field is required, but not set!", message);
            done();
        },
    } as DosOptions);
});

test("js-dos can't start without canvas (promise style)", (done) => {
    const dos = Dos(null, {
        wdosboxUrl: "/wdosbox.js",
    } as DosOptions);
    doCatch(dos, (message) => {
        assert.equal("canvas field is required, but not set!", message);
        done();
    });
    doThen(dos, () => {
        assert.fail();
    });
});

test("js-dos can't start without canvas (ready style)", (done) => {
    const dos = Dos(null, {
        wdosboxUrl: "/wdosbox.js",
    } as DosOptions);
    const promise = dos.ready((fs, main) => {
        const fn = () => assert.fail();
        setTimeout(fn, 1);
    });
    doCatch(promise, (message) => {
        assert.equal("canvas field is required, but not set!", message);
        done();
    });
});

test("js-dos should start with canvas", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
    });
    doReady(dos, (fs, main) => {
        doNext(main([]), (ci) => {
            ci.exit();
            done();
        });
    });
});

test("js-dos can take screenshot of canvas", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
    });
    doReady(dos, (fs, main) => {
        doNext(main([]), (ci) => {
            compareAndExit("init.png", ci, done);
        });
    });
});

suite("js-dos-fs");

test("js-dos-fs createFile error handling", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
        onerror: (message) => {
            assert.equal(message, "Can't create file '', because file name is empty");
            done();
        },
    });

    doReady(dos, (fs, main) => {
        fs.createFile("", "");
    });
});

test("js-dos-fs createFile error handling 2", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
        onerror: (message) => {
            assert.equal(message, "Can't create file '/home/', because file name is empty");
            done();
        },
    });

    doReady(dos, (fs, main) => {
        fs.createFile("/home/", "");
    });
});

test("js-dos-fs can create file", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
        onerror: (message) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        fs.createFile("/wiki/musk", wikiElonMusk);
        doNext(main(), (ci) => {
            doNext(ci.shell("type wiki\\musk"), () => {
                compareAndExit("elonmusk.png", ci, done);
            });
        });
    });
});

test("js-dos-fs can create file (windows path)", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
        onerror: (message) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        fs.createFile("C:\\wiki\\musk", wikiElonMusk);
        doNext(main(), (ci) => {
            doNext(ci.shell("type wiki\\musk"), () => {
                compareAndExit("elonmusk.png", ci, done);
            });
        });
    });
});

test("js-dos-fs clearing IDBFS db", (done) => {
    const request = indexedDB.deleteDatabase("/test");

    request.onerror = (event) => {
        console.error(event);
        assert.fail();
    };

    request.onsuccess = (event) => {
        done();
    };
});

test("js-dos-fs can mount archive on persistent point [empty db]", (done) => {
    let isOnProgress = false;
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
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
                    compareAndExit("pesistent-mount.png", ci, done);
                });
            });
        });
    });
});

test("js-dos-fs can mount archive on persistent point [existent db]", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
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
                    compareAndExit("pesistent-mount.png", ci, done);
                });
            });
        });
    });
});

suite("js-dos");

test("js-dos should provide user level dosbox.conf", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
        onerror: (message) => {
            assert.fail();
        },
    });

    doReady(dos, (fs, main) => {
        fs.createFile("dosbox.conf", `
        [autoexec]
        mount c .
        c:
        cd HOME
        cd WEB_USER
        cd DOSBOX~1
        type dosbox~1.con
        `);

        doNext(main(["-conf", "dosbox.conf"]), (ci) => {
            compareAndExit("jsdos-conf.png", ci, done);
        });
    });
});

test("js-dos can create and read dosbox.conf", (done) => {
    const dos = Dos(document.getElementById("canvas") as HTMLCanvasElement, {
        wdosboxUrl: "/wdosbox.js",
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
        wdosboxUrl: "/wdosbox.js",
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

const saveImage = (ci: DosCommandInterface) => {
    ci.screenshot().then((data) => {
        const w = window.open("about:blank", "image from canvas");
        w.document.write("<img src='" + data + "' alt='from canvas'/>");
    });
};

const wikiElonMusk = `
Elon Reeve Musk FRS (/ˈiːlɒn/; born June 28, 1971) is a
technology entrepreneur and engineer.[10][11][12]
He holds South African, Canadian, and U.S. citizenship
and is the founder, CEO, and lead designer of SpaceX;
[13] co-founder, CEO, and product architect of Tesla, Inc.;
[14] co-founder and CEO of Neuralink; and co-founder of PayPal.
In December 2016, he was ranked 21st on the Forbes list of
The World's Most Powerful People.[15] As of October 2018,
he has a net worth of $22.8 billion and is listed by Forbes
as the 54th-richest person in the world.[16]
Born and raised in Pretoria, South Africa, Musk moved to
Canada when he was 17 to attend Queen's University.
He transferred to the University of Pennsylvania two years
later, where he received an economics degree from
the Wharton School and a degree in physics from the College
of Arts and Sciences. He began a Ph.D.
in applied physics and material sciences at Stanford University
in 1995 but dropped out after two days to pursue
an entrepreneurial career. He subsequently co-founded Zip2, a
web software company, which was acquired by Compaq
for $340 million in 1999. Musk then founded X.com, an online bank.
It merged with Confinity in 2000 and later that
year became PayPal, which was bought by eBay for $1.5 billion
in October 2002.[17][18][19][20]
`;
