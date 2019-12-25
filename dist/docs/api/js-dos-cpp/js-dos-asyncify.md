




Created by caiiiycuk on 13.11.2019.



  

```

#ifdef EMSCRIPTEN

#import <emscripten.h>

EM_JS(void, syncSleep, (), {
  if (!Module.sync_sleep) {
     throw new Error("Async environment does not exists");
     return;
  }

  return Asyncify.handleSleep(function(wakeUp) {
      Module.sync_sleep(wakeUp);
  });
});

#ifdef PROMISE_SLEEP
bool initSyncSleep() {
    EM_ASM(({
        Module.sync_sleep = function(wakeUp) {
            Promise.resolve(1).then(wakeUp);
        }
    }));
    return true;
}
#else
bool initSyncSleep() {
    EM_ASM(({
        Module.sync_id = Date.now();
        Module.sync_sleep = function(wakeUp) {
            if (Module.sync_wakeUp) {
                throw new Error("Trying to sleep in sleeping state!");
                return; // already sleeping
            }

            Module.sync_wakeUp = wakeUp;
            window.postMessage({ type: "sync_sleep_message", id: Module.sync_id }, "*");
        };

        Module.receive = function(ev) {
            if (ev.source !== window) {
                return;
            }
            var data = ev.data;
            if (ev.data.type === "sync_sleep_message" && Module.sync_id == ev.data.id) {
                ev.stopPropagation();
                var wakeUp = Module.sync_wakeUp;
                delete Module.sync_wakeUp;

                wakeUp();
            }
        };

        window.addEventListener("message", Module.receive, true);
    }));

    return true;
}

extern "C" void destroySyncSleep() {
  EM_ASM(({
      window.removeEventListener("message", Module.receive);
      delete Module.sync_sleep;
  }));
}
#endif

bool init = initSyncSleep();
#endif

extern "C" void asyncify_sleep(unsigned int ms) {
#ifdef EMSCRIPTEN
    syncSleep();
#endif
}


```




