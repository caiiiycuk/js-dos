//
// Created by caiiiycuk on 28.02.2020.
//

#include <timer.h>
#include <sys/time.h>
#include <unistd.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#else
#include <thread>
#endif

double GetCurrentTimeMs() {
    static struct timeval tp;
    gettimeofday(&tp, 0);
    return tp.tv_sec * 1000 + tp.tv_usec / 1000;
}

mstime GetMsPassedFromStart() {
    static double startedAt = GetCurrentTimeMs();
    return GetCurrentTimeMs() - startedAt;
}

void DelayWithYield(int ms) {
#ifdef EMSCRIPTEN
    emscripten_sleep_with_yield(ms);
#else
    if (ms == 0) {
        ms = 10;
    }

    std::this_thread::sleep_for(std::chrono::milliseconds(ms));
#endif
}

void Delay(int ms) {
    DelayWithYield(ms);
}
