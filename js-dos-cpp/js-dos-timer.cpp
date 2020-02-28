//
// Created by caiiiycuk on 28.02.2020.
//

#include <timer.h>
#include <sys/time.h>
#include <unistd.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

double GetCurrentTimeMs() {
    static struct timeval tp;
    gettimeofday(&tp, 0);
    return tp.tv_sec * 1000 + tp.tv_usec / 1000;
}

void DelayWithYield(int ms) {
#ifdef EMSCRIPTEN
    emscripten_sleep_with_yield(ms);
#else
    usleep(ms * 1000);
#endif
}

void Delay(int ms) {
#ifdef EMSCRIPTEN
    emscripten_sleep_with_yield(ms);
#else
    usleep(ms * 1000);
#endif
}
