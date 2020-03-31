#ifndef JSDOS_PROTOCOL_SOKOL_H_
#define JSDOS_PROTOCOL_SOKOL_H_

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

extern "C" int EMSCRIPTEN_KEEPALIVE client_frame_width();
extern "C" int EMSCRIPTEN_KEEPALIVE client_frame_height();
extern "C" char* EMSCRIPTEN_KEEPALIVE cleint_frame_rgba();

#endif
