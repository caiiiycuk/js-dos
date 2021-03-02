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

#include <jsdos-timer.h>
#include <jsdos-asyncify.h>

void jsdos::initTimer() {
#ifdef EMSCRIPTEN
  EM_ASM(({
    Module.performance = Module.performance || performance;
  }));
#endif
}

#ifdef EMSCRIPTEN
EM_JS(double, now, (void), {
    return Module.performance.now();
});
#else
double now() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec * 1000. + ts.tv_nsec / 1000000.;
}
#endif

double GetMsPassedFromStart() {
    static double startedAt = now();
    return now() - startedAt;
}

mstime GetTicks() {
    return GetMsPassedFromStart();
}

void DelayWithYield(int ms) {
    asyncify_sleep(ms);
}

void Delay(int ms) {
    DelayWithYield(ms);
}
