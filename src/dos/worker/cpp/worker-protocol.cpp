#include <emscripten.h>
#include <protocol.h>

int frameHeight = 0;
int frameWidth = 0;

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
    Module.print = Module.log;
    Module.printErr = Module.err;

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
            Module._requestExit();
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
      Module.sendMessage("ws-update-lines", { lines: Module.frame_update_lines });
    }
    delete Module.frame_update_lines;
  });

EM_JS(void, emsc_ws_exit_runtime, (), {
    Module.exit = function() { Module.sendMessage("ws-exit"); };
  });

EM_JS(void, ws_client_stdout, (const char* data, uint32_t amount), {
    Module.sendMessage("ws-stdout", { message: UTF8ToString(data, amount) });
  });

EM_JS(void, emsc_exit_runtime, (), {
    if (!Module.exit) {
      var message = "ERR! exitRuntime called without request" +
                    ", asyncify state: " + Asyncify.state;
      Module.err(message);
      return;
    }
    Module.exit();
  });

EM_JS(void, emsc_extract_bundle_to_fs, (), {
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

EM_JS(void, emsc_pack_fs_to_bundle, (), {
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

void client_frame_set_size(int width, int height) {
  frameHeight = height;
  frameWidth = width;
  emsc_ws_client_frame_set_size(width, height);
}

void client_frame_update_lines(uint32_t *lines, uint32_t count, void *rgba) {
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
}

void client_stdout(const char* data, uint32_t amount) {
  ws_client_stdout(data, amount);
}

void client_sound_push(const float *samples, int num_samples) {
  // TODO
}

extern "C" void EMSCRIPTEN_KEEPALIVE extractBundleToFs() {

  emsc_extract_bundle_to_fs();
}

extern "C" void EMSCRIPTEN_KEEPALIVE packFsToBundle() {
  emsc_pack_fs_to_bundle();
}

extern "C" void EMSCRIPTEN_KEEPALIVE addKey(KBD_KEYS key, bool pressed) {
  server_add_key(key, pressed);
}

extern "C" void EMSCRIPTEN_KEEPALIVE exitRuntime() {
  emsc_exit_runtime();
  emscripten_force_exit(0);
}

extern "C" void EMSCRIPTEN_KEEPALIVE runRuntime() {
  server_run();
  emsc_ws_exit_runtime();
  exitRuntime();
}

extern "C" void EMSCRIPTEN_KEEPALIVE requestExit() { server_exit(); }

int main(int argc, char **argv) {
  ws_init_runtime();
  emscripten_exit_with_live_runtime();
  return 0;
}
