#ifdef EMSCRIPTEN
#include <emscripten.h>
#else
#ifndef EMSCRIPTEN_KEEPALIVE
#define EEMSCRIPTEN_KEEPALIVE /* EMSCRIPTE_KEEPALIVE */
#endif
#endif

#include <cstdint>

struct ZipArchive {
    uint32_t length;
    char* data;
};

extern "C" ZipArchive* EMSCRIPTEN_KEEPALIVE zip_from_fs();

extern "C" int EMSCRIPTEN_KEEPALIVE zip_to_fs(const char *data, uint32_t length);

extern "C" void EMSCRIPTEN_KEEPALIVE libzip_exit();

