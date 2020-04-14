//
// Created by caiiiycuk on 14.04.2020.
//
#include "jsdos-libzip.h"

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

int main(int argc, char** argv) {
#ifdef EMSCRIPTEN
    emscripten_exit_with_live_runtime();
#endif
    return 0;
}