//
// Created by caiiiycuk on 27.02.2020.
//

#ifndef JS_DOS_JS_DOS_PROTOCOL_H
#define JS_DOS_JS_DOS_PROTOCOL_H

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include <stdint.h>
#include <keyboard.h>

extern "C" void EMSCRIPTEN_KEEPALIVE client_ping(const char* message);
extern "C" void EMSCRIPTEN_KEEPALIVE client_frame_set_size(int width, int height);
extern "C" void EMSCRIPTEN_KEEPALIVE client_frame_update_lines(uint32_t *lines, uint32_t count, void *rgba);
extern "C" void EMSCRIPTEN_KEEPALIVE client_sound_push(const float* samples, int num_samples);
extern "C" void EMSCRIPTEN_KEEPALIVE client_exit();

extern int server_run(int argc, char** argv);
extern void server_add_key(KBD_KEYS key, bool pressed);
extern void server_exit();

#endif //JS_DOS_JS_DOS_PROTOCOL_H
