//
// Created by caiiiycuk on 27.02.2020.
//

#ifndef JS_DOS_JS_DOS_PROTOCOL_H
#define JS_DOS_JS_DOS_PROTOCOL_H

#include <stdint.h>
#include <keyboard.h>

extern "C" void client_run();

extern "C" void client_frame_set_size(int width, int height);
extern "C" void client_frame_open();
extern "C" void client_frame_update_lines(int star, int count, uint32_t *rgba);
extern "C" void client_frame_close();

extern "C" void client_sound_push(const float* samples, int num_samples);

extern "C" void server_add_key(KBD_KEYS key, bool pressed);

#endif //JS_DOS_JS_DOS_PROTOCOL_H
