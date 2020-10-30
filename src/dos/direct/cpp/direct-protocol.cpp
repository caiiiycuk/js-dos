#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include <protocol.h>
#include <cstring>

#include <stdio.h>
#include <stdlib.h>

int frameId = 0;
int frameHeight = 0;
int frameWidth = 0;
char *frameRgba = 0;

#ifdef EMSCRIPTEN
// clang-format off
EM_JS(void, emsc_client_stdout, (const char* data, uint32_t amount), {
    Module.clientStdout(UTF8ToString(data, amount));
  });

EM_JS(void, emsc_client_frame_size, (int width, int height), {
    Module.onFrameSize(width, height);
  });

EM_JS(void, emsc_client_frame, (void* rgba), {
    Module.onFrame(rgba);
  })

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

EM_JS(void, emsc_client_sound_init, (int freq), {
    Module.onSoundInit(freq);
  });

EM_JS(void, emsc_client_sound_push, (const float *samples, int num_samples), {
    if (num_samples > 0) {
      Module.onSoundPush(samples, num_samples);
    }
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
// clang-fromat on
#endif

void client_frame_set_size(int width, int height) {
  if (width == frameWidth && height == frameHeight) {
    return;
  }

  if (frameRgba) {
    delete[] frameRgba;
  }

  frameWidth = width;
  frameHeight = height;
  frameRgba = new char[width * height * 4];

#ifdef EMSCRIPTEN
  emsc_client_frame_size(width, height);
#endif
}

void client_frame_update_lines(uint32_t *lines, uint32_t count, void *rgba) {
  if (!frameRgba || count == 0) {
    return;
  }

  frameId++;

  for (uint32_t i = 0; i < count; ++i) {
    uint32_t start = lines[i * 3];
    uint32_t count = lines[i * 3 + 1];
    uint32_t offset = lines[i * 3 + 2];

    memcpy(&frameRgba[start * frameWidth * 4],
           (char *)rgba + offset,
           count * frameWidth * 4);
  }

#ifdef EMSCRIPTEN
  emsc_client_frame(rgba);
#endif
}

void client_stdout(const char* data, uint32_t amount) {
#ifdef EMSCRIPTEN
  emsc_client_stdout(data, amount);
#endif
}

void client_sound_init(int freq) {
#ifdef EMSCRIPTEN
  emsc_client_sound_init(freq);
#endif
}

void client_sound_push(const float *samples, int num_samples) {
#ifdef EMSCRIPTEN
  emsc_client_sound_push(samples, num_samples);
#endif
}

extern "C" void EMSCRIPTEN_KEEPALIVE packFsToBundle() {
#ifdef EMSCRIPTEN
  emsc_pack_fs_to_bundle();
#endif
}

extern "C" void EMSCRIPTEN_KEEPALIVE addKey(KBD_KEYS key, bool pressed, uint64_t timeMs) {
  server_add_key(key, pressed, timeMs);
}

extern "C" void EMSCRIPTEN_KEEPALIVE exitRuntime() {
#ifdef EMSCRIPTEN
  emsc_exit_runtime();
  emscripten_force_exit(0);
#endif
}

extern "C" void EMSCRIPTEN_KEEPALIVE runRuntime() {
#ifdef EMSCRIPTEN
  emsc_extract_bundle_to_fs();
#endif
  server_run();
  exitRuntime();
}

extern "C" void EMSCRIPTEN_KEEPALIVE requestExit() {
  server_exit();
}

extern "C" char* EMSCRIPTEN_KEEPALIVE getConfigContent() {
  FILE *f = fopen(".jsdos/jsdos.json", "rb");
  if (!f) {
    char *content = (char *) malloc(3);
    content[0] = '{';
    content[1] = '}';
    content[2] = 0;
    return content;
  }

  fseek(f, 0, SEEK_END);
  long fsize = ftell(f);
  fseek(f, 0, SEEK_SET);

  char *content = (char *) malloc(fsize + 1);
  fread(content, 1, fsize, f);
  fclose(f);

  content[fsize] = 0;
  return content;
}


extern "C" int EMSCRIPTEN_KEEPALIVE getFrameId() {
  return frameId;
}

extern "C" int EMSCRIPTEN_KEEPALIVE getFrameWidth() {
  return frameWidth;
}

extern "C" int EMSCRIPTEN_KEEPALIVE getFrameHeight() {
  return frameHeight;
}

extern "C" void* EMSCRIPTEN_KEEPALIVE getFrameRgba() {
  return frameRgba;
}

int main(int argc, char **argv) {
#ifdef EMSCRIPTEN
  emscripten_exit_with_live_runtime();
#else
  runRuntime();
#endif
  return 0;
}
