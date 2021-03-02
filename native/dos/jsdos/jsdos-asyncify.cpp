//
// Created by caiiiycuk on 13.11.2019.
//
#include <jsdos-asyncify.h>

#ifdef EMSCRIPTEN
// clang-format off
#include <emscripten.h>

EM_JS(void, syncSleep, (), {
    if (!Module.sync_sleep) {
      throw new Error("Async environment does not exists");
      return;
    }

    return Asyncify.handleSleep(function(wakeUp) { Module.sync_sleep(wakeUp); });
  });

EM_JS(bool, initTimeoutSyncSleep, (), {
    Module.alive = true;
    Module.sync_sleep = function(wakeUp) {
      setTimeout(function() {
          if (Module.alive) {
            wakeUp();
          }
        });
    };
    return true;
  });

EM_JS(bool, initMessageSyncSleep, (bool worker), {
    Module.alive = true;
    Module.sync_id = Date.now();
    Module.sync_sleep = function(wakeUp) {
      if (Module.sync_wakeUp) {
        throw new Error("Trying to sleep in sleeping state!");
        return;  // already sleeping
      }

      Module.sync_wakeUp = wakeUp;
      if (worker) {
        postMessage({type : "sync_sleep_message", id : Module.sync_id});
      } else {
        window.postMessage({type : "sync_sleep_message", id : Module.sync_id},
                           "*");
      }
    };

    Module.receive = function(ev) {
      var data = ev.data;
      if (ev.data.type === "sync_sleep_message" &&
          Module.sync_id == ev.data.id) {
        ev.stopPropagation();
        var wakeUp = Module.sync_wakeUp;
        delete Module.sync_wakeUp;

        if (Module.alive) {
          wakeUp();
        }
      }
    };

    if (worker) {
      self.addEventListener("message", Module.receive, true);
    } else {
      window.addEventListener("message", Module.receive, true);
    }

    return true;
  });

EM_JS(void, destroyTimeoutSyncSleep, (), {
    Module.alive = true;
    delete Module.sync_sleep;
  });

EM_JS(void, destroyMessageSyncSleep, (bool worker), {
    if (worker) {
      self.removeEventListener("message", Module.receive);
    } else {
      window.removeEventListener("message", Module.receive);
    }
    Module.alive = false;
    delete Module.sync_sleep;
  });

EM_JS(bool, isWorker, (), {
    return typeof importScripts === 'function';
  });

EM_JS(bool, isNode, (), {
    return typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
  });

// clang-format on
#else
#include <thread>
#endif

void jsdos::initAsyncify() {
#ifdef EMSCRIPTEN
  if (isNode()) {
    initTimeoutSyncSleep();
  } else {
    initMessageSyncSleep(isWorker());
  }
#endif
}

void jsdos::destroyAsyncify() {
#ifdef EMSCRIPTEN
  if (isNode()) {
    destroyTimeoutSyncSleep();
  } else {
    destroyMessageSyncSleep(isWorker());
  }
#endif
}

extern "C" void asyncify_sleep(unsigned int ms) {
#ifdef EMSCRIPTEN
  syncSleep();
#else
  if (ms == 0) {
    return;
  }

  std::this_thread::sleep_for(std::chrono::milliseconds(ms));
#endif
}
