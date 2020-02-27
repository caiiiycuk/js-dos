//
// Created by caiiiycuk on 27.02.2020.
//

#ifndef JS_DOS_JS_DOS_PROTOCOL_H
#define JS_DOS_JS_DOS_PROTOCOL_H

#include <stdint.h>

extern "C" void client_run();
extern "C" void client_set_frame_size(int width, int height);
extern "C" void client_open_frame();
extern "C" void client_update_frame_lines(int star, int count, uint32_t *rgba);
extern "C" void client_close_frame();

#endif //JS_DOS_JS_DOS_PROTOCOL_H
