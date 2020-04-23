#ifdef EMSCRIPTEN
// clang-format off
EM_JS(void, dr_sokolInit, (), {
    Module.ready();
  });

EM_JS(void, dr_client_stdout, (const char* data, uint32_t amount), {
    Module.stdout(UTF8ToString(data, amount));
  });
// clang-format on
#else
void dr_sokolInit() {}
void dr_client_stdout(const char*, uint32_t) {}
#endif

void dr_init_runtime() { extractBundleToFs(); }

void dr_sokolCleanup() {
  sg_shutdown();
  server_exit();
}

extern "C" void EMSCRIPTEN_KEEPALIVE dr_client_frame_set_size(int width,
                                                              int height) {
  if (frameRgba) {
    delete[] frameRgba;
  }
  frameWidth = width;
  frameHeight = height;
  frameRgba = new uint32_t[width * height];

#ifdef EMSCRIPTEN
  emscripten_set_canvas_size(width, height);
#endif
}

extern "C" size_t EMSCRIPTEN_KEEPALIVE
dr_client_frame_data_ptr(uint32_t start) {
  if (!frameRgba) {
    abort();
  }

  return (size_t)(&frameRgba[start * frameWidth]);
}

extern "C" void EMSCRIPTEN_KEEPALIVE dr_client_update_frame() { frameCount++; }

void dr_client_frame_update_lines(uint32_t *lines, uint32_t count, void *rgba) {
  frameCount++;
  if (!frameRgba) {
    return;
  }

  for (uint32_t i = 0; i < count; ++i) {
    uint32_t start = lines[i * 3];
    uint32_t count = lines[i * 3 + 1];
    uint32_t offset = lines[i * 3 + 2];
    memcpy(&frameRgba[start * frameWidth], (char *)rgba + offset,
           sizeof(uint32_t) * count * frameWidth);
  }
}
