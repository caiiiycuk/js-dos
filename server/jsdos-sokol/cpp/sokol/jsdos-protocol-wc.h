#ifdef EMSCRIPTEN
// clang-format off
EM_JS(void, wc_sokolInit, (), {
    Module.worker = new Worker(Module.config.pathPrefix +
                               "wsokol-worker.js");

    function sendMessage(name, props) {
      Module.worker.postMessage({
          name,
          props
        });
    };

    Module.sendMessage = sendMessage;

    Module.worker.onmessage =
        function(e) {
      var data = e.data;
      if (data.type === "sync_sleep_message") {
        Module.worker.postMessage(data);
        return;
      }

      switch (data.name) {
        case "ws-ready": {
          sendMessage("wc-run", {
           bundle: Module.bundle
            });
          delete Module.bundle;
        } break;
        case "ws-server-ready": {
          Module.ready();
        } break;
        case "ws-frame-set-size": {
          Module._dr_client_frame_set_size(
              Number.parseInt(data.props.width, 10),
              Number.parseInt(data.props.height, 10)
                                           );
        } break;
        case "ws-update-lines": {
          var frame_update_lines = data.props;
          for (var line of frame_update_lines) {
            var ptr = Module._dr_client_frame_data_ptr(line.start);
            Module.HEAPU8.set(line.heapu8, ptr);
          }
          Module._dr_client_update_frame();
        } break;
        case "ws-exit": {
          Module.worker.terminate();
          try {
            Module._exitRuntime();
          } catch (e) {
            if (e.name !== "ExitStatus") {
              throw e;
            }
          }
        } break;
        case "ws-log": {
          Module.log.apply(null, data.props.args);
        } break;
        case "ws-warn": {
          Module.warn.apply(null, data.props.args);
        } break;
        case "ws-err": {
          Module.err.apply(null, data.props.args);
        } break;
        case "ws-stdout": {
          Module.stdout(data.props);
        } break;
        case "ws-persist": {
          Module.persist(data.props.bundle);
        } break;
        default: {
          console.log("wc " + JSON.stringify(data));
        } break;
      }
    };
  });

EM_JS(void, wc_packFsToBundle, (), {
    Module.sendMessage("wc-pack-fs-to-bundle");
  });

EM_JS(void, emsc_wc_sokolCleanup, (), {
    Module.sendMessage("wc-exit");
  });

EM_JS(void, wc_addKey, (KBD_KEYS key, bool pressed), {
    Module.sendMessage("wc-add-key", {key : key, pressed : pressed});
  });
// clang-format on
#else
void wc_sokolInit() {}
extern "C" void wc_packFsToBundle() {}
extern "C" void wc_addKey(KBD_KEYS key, bool pressed) {}
#endif

void wc_sokolCleanup() {
  sg_shutdown();
#ifdef EMSCRIPTEN
  emsc_wc_sokolCleanup();
#endif
}
