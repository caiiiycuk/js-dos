void wc_sokolInit() {
#ifdef EMSCRIPTEN
  EM_ASM(({
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
              Module._client_frame_set_size(
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
            case "ws-persist": {
              Module.persist(data.props.bundle);
            } break;
            default: {
              console.log("wc " + JSON.stringify(data));
            } break;
          }
        };
      }));
#endif
}

void wc_packFsToBundle() {
#ifdef EMSCRIPTEN
  EM_ASM((Module.sendMessage("wc-pack-fs-to-bundle");));
#endif
}

void wc_sokolCleanup() {
    sg_shutdown();
#ifdef EMSCRIPTEN
    EM_ASM((Module.sendMessage("wc-exit");));
#endif
}

void wc_addKey(KBD_KEYS key, bool pressed) {
  // clang-format off
#ifdef EMSCRIPTEN
  EM_ASM(({ Module.sendMessage("wc-add-key", {key : $0, pressed : $1}); }),
         key, pressed);
#endif
  // clang-format on
}
