//
// Created by caiiiycuk on 11.01.19.
//

extern "C" void EMSCRIPTEN_KEEPALIVE jsdos_exit(void) {
    emscripten_force_exit(0);
}