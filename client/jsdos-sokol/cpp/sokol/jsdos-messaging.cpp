#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include "jsdos-protocol-sokol.h"

void initMessaging() {
#ifdef EMSCRIPTEN
    EM_ASM((
#ifndef WORKER_IMPL
            console.log("add listener (sokol)");
            window.addEventListener("message", receiveMessage, true);
            Module.postMessage = function(msg) {
                window.postMessage(msg);
            };
#else
            self.onmessage = receiveMessage;
            Module.postMessage = function(msg) {
                self.postMessage(msg);
            };
#endif
            function receiveMessage(event) {
                console.log("new message (sokol)", event);
                var data = event.data || {};
                switch (data.fn) {
                    case "workerReady": {
                        Module.workerReady = true;
                        for (var i = 0; i < Module.workerMessageQueue.length; ++i) {
                            Module.postMessage(Module.workerMessageQueue[i]);
                        }
                        delete Module.workerMessageQueue;
                    } break;
                    case "screenshot": {
                        var width = Module._getFrameWidth();
                        var height = Module._getFrameHeight();
                        var rgba = Module._getFrameRgba();
                        var buffer = Module.HEAP32.subarray(rgba, rgba + width * height);
                        Module.postMessage({
                            fn: "screenshotData",
                            width: width,
                            height: height,
                            buffer: buffer,
                            }, "*");
                    } break;
                }
            }
            ));
#endif
}
