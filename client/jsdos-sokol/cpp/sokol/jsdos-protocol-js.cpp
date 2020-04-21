#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include "jsdos-protocol-js.h"

extern int frameWidth;
extern int frameHeight;
extern uint32_t* frameRgba;
extern const MessagingType messagingType;

extern "C" void wc_addKey(KBD_KEYS key, bool pressed);
extern "C" void wc_packFsToBundle();

#ifdef EMSCRIPTEN
// clang-format off
EM_JS(void, emscExitRuntime, (), {
    if (!Module.exit) {
      var message = "ERR! exitRuntime called without request" +
                    ", asyncify state: " + Asyncify.state;
      Module.err(message);
      return;
    }
    Module.exit();
  });

EM_JS(void, emscExtractBundleToFs, (), {
    Module.FS.chdir("/home/web_user");

    const bytes = Module.bundle;
    delete Module.bundle;

    const buffer = Module._malloc(bytes.length);
    Module.HEAPU8.set(bytes, buffer);
    const retcode = Module._zip_to_fs(buffer, bytes.length);
    Module._free(buffer);

    if (retcode !== 0) {
      Module.err("Unable to extract bundle archive\n");
      return;
    }

    try {
      Module.FS.readFile("/home/web_user/.jsdos/dosbox.conf");
    } catch (e) {
      Module.err("Broken bundle, .jsdos/dosbox.conf not found");
      return;
    }
  });

EM_JS(void, emscPackFsToBundle, (), {
    Module.FS.chdir("/home/web_user");

    const ptr = Module._zip_from_fs();
    if (ptr === 0) {
      Module.err("Can't create zip, see more info in logs");
      Module._abort();
      return;
    }

    const length = Module.HEAPU32[ptr / 4];
    const memory = Module.HEAPU8;
    const archive = memory.slice(ptr + 4, ptr + 4 + length);
    Module._free(ptr);

    Module.persist(archive);
  });
// clang-format on
#endif

extern "C" void EMSCRIPTEN_KEEPALIVE extractBundleToFs() {
#ifdef EMSCRIPTEN
  emscExtractBundleToFs();
#endif
}

extern "C" void EMSCRIPTEN_KEEPALIVE packFsToBundle() {
  if (messagingType == WORKER_CLIENT) {
    wc_packFsToBundle();
    return;
  }

#ifdef EMSCRIPTEN
  emscPackFsToBundle();
#endif
}

extern "C" void EMSCRIPTEN_KEEPALIVE addKey(KBD_KEYS key, bool pressed) {
  switch (messagingType) {
    case DIRECT:
    case WORKER: {
      server_add_key(key, pressed);
    } break;
    case WORKER_CLIENT: {
      wc_addKey(key, pressed);
    } break;
  }
}

extern "C" void EMSCRIPTEN_KEEPALIVE exitRuntime() {
#ifdef EMSCRIPTEN
  emscExitRuntime();
  emscripten_force_exit(0);
#endif
}

extern "C" void EMSCRIPTEN_KEEPALIVE requestExit() { client_exit(); }

extern "C" int EMSCRIPTEN_KEEPALIVE getFrameWidth() { return frameWidth; }

extern "C" int EMSCRIPTEN_KEEPALIVE getFrameHeight() { return frameHeight; }

extern "C" void* EMSCRIPTEN_KEEPALIVE getFrameRgba() { return frameRgba; }
