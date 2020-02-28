//
// Created by caiiiycuk on 26.02.2020.
//
#include <config.h>
#include <vector>
#include <string>

class SDL_Surface;

void GFX_SetTitle(Bit32s cycles, Bits frameskip, bool paused) {
}

void restart_program(std::vector<std::string> & parameters) {
    abort();
}

// TODO: need to drop mapper
bool mouselocked; //Global variable for mapper
SDL_Surface *SDL_SetVideoMode_Wrap(int width, int height, int bpp, Bit32u flags) {
    return 0;
}

// TODO: need to implement
void Mouse_AutoLock(bool enable) {
}

void GFX_CaptureMouse(void) {
}

void GFX_Events() {
}

void GFX_LosingFocus(void) {
}
