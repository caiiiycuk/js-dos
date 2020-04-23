#ifndef JSDOS_PROTOCOL_SOKOL_JS_
#define JSDOS_PROTOCOL_SOKOL_JS_

#include <jsdos-protocol.h>

enum MessagingType {
  DIRECT = 1,
  WORKER_CLIENT = 2,
  WORKER = 3,
};

// this API is called from js somewhere

extern "C" void EMSCRIPTEN_KEEPALIVE runRuntime();
extern "C" void EMSCRIPTEN_KEEPALIVE exitRuntime();
extern "C" void EMSCRIPTEN_KEEPALIVE extractBundleToFs();
extern "C" void EMSCRIPTEN_KEEPALIVE packFsToBundle();
extern "C" void EMSCRIPTEN_KEEPALIVE addKey(KBD_KEYS key, bool pressed);
extern "C" void EMSCRIPTEN_KEEPALIVE requestExit();

extern "C" int EMSCRIPTEN_KEEPALIVE getFrameWidth();
extern "C" int EMSCRIPTEN_KEEPALIVE getFrameHeight();
extern "C" void* EMSCRIPTEN_KEEPALIVE getFrameRgba();

#endif
