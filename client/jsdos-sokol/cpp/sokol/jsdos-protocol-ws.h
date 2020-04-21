#ifdef EMSCRIPTEN
// clang-format off
EM_JS(void, ws_init_runtime, (), {
    function sendMessage(name, props) {
      postMessage({
          name,
          props
        });
    };
    Module.sendMessage = sendMessage;
    Module.ping = function(msg) {
    };
    Module.log = function() {
      sendMessage("ws-log", { args: Array.prototype.slice.call(arguments) });
    };
    Module.warn = function() {
      sendMessage("ws-warn", { args: Array.prototype.slice.call(arguments) });
    };
    Module.err = function() {
      sendMessage("ws-err", { args: Array.prototype.slice.call(arguments) });
    };

    onmessage = function(e) {
      var data = e.data;
      if (data.type === "sync_sleep_message") {
        return;
      }

      switch (data.name) {
        case "wc-run": {
          Module.bundle = data.props.bundle;
          Module._extractBundleToFs();
          Module._runRuntime();
          sendMessage("ws-server-ready");
        } break;
        case "wc-exit": {
          try {
            Module._ws_exit();
          } catch (e) {
            if (e.name !== "ExitStatus") {
              throw e;
            }
          }
        } break;
        case "wc-pack-fs-to-bundle": {
          try {
            Module.persist = function(archive) {
              sendMessage("ws-persist", { bundle: archive });
            };
            Module._packFsToBundle();
            delete Module.persist;
          } catch (e) {
            Module.err(e.message);
          }
        } break;
        case "wc-add-key": {
          Module._addKey(data.props.key, data.props.pressed);
        } break;
        default: {
          console.log("ws " + JSON.stringify(data));
        } break;
      }
    };

    sendMessage("ws-ready");
  });

EM_JS(void, emsc_ws_client_frame_set_size, (int width, int height), {
    Module.sendMessage("ws-frame-set-size", {width : width, height : height});
  });

EM_JS(void, emsc_start_frame_update, (), {
    Module.frame_update_lines = [];
  });

EM_JS(void, emsc_add_frame_line, (uint32_t start, char* ptr, uint32_t len), {
    Module.frame_update_lines.push(
        {start : start, heapu8 : Module.HEAPU8.slice(ptr, ptr + len)});
  });

EM_JS(void, emsc_end_frame_update, (), {
    if (Module.frame_update_lines.length > 0) {
      Module.sendMessage("ws-update-lines", Module.frame_update_lines);
    }
    delete Module.frame_update_lines;
  });

EM_JS(void, emsc_ws_exit_runtime, (), {
    Module.exit = function() { Module.sendMessage("ws-exit"); };
  });

EM_JS(void, ws_client_stdout, (const char* data, uint32_t amount), {
    Module.sendMessage("ws-stdout", UTF8ToString(data, amount));
  });
// clang-format on
#else
void ws_init_runtime() {}
void ws_client_stdout(const char *, uint32_t) {}
#endif

void ws_client_frame_set_size(int width, int height) {
  frameHeight = height;
  frameWidth = width;
#ifdef EMSCRIPTEN
  emsc_ws_client_frame_set_size(width, height);
#endif
}

void ws_client_frame_update_lines(uint32_t *lines, uint32_t count, void *rgba) {
#ifdef EMSCRIPTEN
  emsc_start_frame_update();
  for (uint32_t i = 0; i < count; ++i) {
    uint32_t base = i * 3;
    uint32_t start = lines[base];
    uint32_t count = lines[base + 1];
    uint32_t offset = lines[base + 2];
    emsc_add_frame_line(start, (char *)rgba + offset,
                        sizeof(uint32_t) * count * frameWidth);
  }
  emsc_end_frame_update();
#endif
}

void ws_exit_runtime() {
#ifdef EMSCRIPTEN
  emsc_ws_exit_runtime();
#endif

  exitRuntime();
}

extern "C" void EMSCRIPTEN_KEEPALIVE ws_exit() { server_exit(); }
