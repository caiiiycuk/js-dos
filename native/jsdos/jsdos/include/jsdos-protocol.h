//
// Created by caiiiycuk on 27.02.2020.
//

#ifndef JS_DOS_JS_DOS_PROTOCOL_H
#define JS_DOS_JS_DOS_PROTOCOL_H

#include <keyboard.h>
#include <stdint.h>

void client_ping(const char* message);
void client_frame_set_size(int width, int height);
void client_frame_update_lines(uint32_t* lines, uint32_t count, void* rgba);
void client_sound_push(const float* samples, int num_samples);
void client_stdout(const char* data, uint32_t amount);
void client_exit();

extern int server_run();
extern void server_add_key(KBD_KEYS key, bool pressed);
extern void server_exit();

#endif  // JS_DOS_JS_DOS_PROTOCOL_H
