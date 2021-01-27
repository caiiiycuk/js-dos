#ifdef EMSCRIPTEN
#include <emscripten.h>
#else
#ifndef EMSCRIPTEN_KEEPALIVE
#define EEMSCRIPTEN_KEEPALIVE /* EMSCRIPTE_KEEPALIVE */
#endif
#endif

#include <stdint.h>

// <uint32_t:length><char*:data>
typedef void* ZipArchive;

ZipArchive EMSCRIPTEN_KEEPALIVE zip_from_fs();
ZipArchive EMSCRIPTEN_KEEPALIVE zip_changed_fs(double changedAfterMs);

int EMSCRIPTEN_KEEPALIVE zip_to_fs(const char *data, uint32_t length);

void EMSCRIPTEN_KEEPALIVE libzip_destroy();

