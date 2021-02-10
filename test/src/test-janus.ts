/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import { assert } from "chai";
import { compareAndExit } from "./compare"

import emulatorsImpl from "../../src/impl/emulators-impl";
import emulators from "../../src/impl/emulators-impl";
import { JanusMessageType } from "../../src/janus/janus-impl";
emulatorsImpl.pathPrefix = "/";

function restUrl() {
    const ip = (window as any).jip || "127.0.0.1";
    return "http://" + ip + ":8088/janus";
}

suite("janus");

test("Should reject on wrong address", async () => {
    try {
        const ci = await emulators.janus("http://127.0.0.1:8088");
        assert.fail();
    } catch (e) {
        assert.equal("Probably a network error, is the server down?: [object Object]", e);
    }
});

test("Should connect and retrun CI", async () => {
    const ci = await emulators.janus(restUrl());
    assert.ok(ci);
    await ci.exit();
});

test("Should report about connection states", async () => {
    const ci = await emulators.janus(restUrl());
    assert.ok(ci);
    const messages: {[msgType: string]: number} = {};
    await new Promise<void>((resolve, reject) => {
        ci.events().onMessage(async (msgType) => {
            messages[msgType] = (messages[msgType] || 0) + 1;
            try {
                if (msgType === "destroyed") {
                    assert.equal(messages.attached, 1);
                    assert.ok(messages.onremotestream > 0);
                    assert.equal(messages.started, 1);
                    assert.equal(messages.destroyed, 1);
                    resolve();
                } else if (msgType === "started") {
                    await ci.exit();
                }
            } catch (e) {
                reject(e);
            }
        });
    });
});

test("Should provide js-dos config", async () => {
    const ci = await emulators.janus(restUrl());
    assert.ok(ci);
    const config = await ci.config();
    assert(JSON.stringify(config).length >= "{}".length);
    await ci.exit();
});

test("should render playable video game", async() => {
    const ci = await emulators.janus(restUrl());
    assert.ok(ci);

    function getKeyCode(code: number) {
        switch (code) {
            case 13: return 257;
            case 38: return 265;
            case 39: return 262;
            case 37: return 263;
            case 40: return 264;
            case 17: return 341;
            default: return 0;
        }
    }
    window.addEventListener("keydown", (e) => {
        ci.sendKeyEvent(getKeyCode(e.keyCode), true);
    });
    window.addEventListener("keyup", (e) => {
        ci.sendKeyEvent(getKeyCode(e.keyCode), false);
    });
    const videoEl = document.getElementById("video");
    videoEl.addEventListener("mousedown", (e) => {
        ci.sendMouseButton(0, true);
    });
    videoEl.addEventListener("mousemove", (e) => {
        ci.sendMouseMotion(e.offsetX / 320,
                           e.offsetY / 240);
    });
    videoEl.addEventListener("mouseup", (e) => {
        ci.sendMouseButton(0, false);
    });

    await new Promise<void>((resolve) => {
        ci.events().onMessage((msgType: JanusMessageType, stream: MediaStream) => {
            if (msgType === "onremotestream") {
                const video = document.getElementById("video") as HTMLVideoElement;
                if (video !== null) {
								    (window as any).Janus.attachMediaStream(video, stream);
                }
            } else if (msgType === "started") {
                resolve();
            }
        });
        ci.events().onStdout(console.log);
    });
});
