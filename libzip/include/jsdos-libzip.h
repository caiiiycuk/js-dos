#ifdef EMSCRIPTEN
#include <emscripten.h>
#else
#ifndef EMSCRIPTEN_KEEPALIVE
#define EEMSCRIPTEN_KEEPALIVE /* EMSCRIPTE_KEEPALIVE */
#endif
#endif

#include <stdint.h>

struct zipArchive {
    uint32_t length;
    char* data;
};

typedef struct zipArchive ZipArchive;

ZipArchive* EMSCRIPTEN_KEEPALIVE zip_from_fs();

int EMSCRIPTEN_KEEPALIVE zip_to_fs(const char *data, uint32_t length);

void EMSCRIPTEN_KEEPALIVE libzip_destroy();

