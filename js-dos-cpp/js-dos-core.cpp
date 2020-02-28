//
// Created by caiiiycuk on 15.01.2020.
//

#include <js-dos-core.h>
#include <sys/time.h>

CoreSimple* getCoreSimple() {
    static CoreSimple coreSimple;
    return &coreSimple;
}

CorePrefetch* getCorePrefetch() {
    static CorePrefetch corePrefetch;
    return &corePrefetch;
}

double getCurrentTimeInMs() {
    static struct timeval tp;
    gettimeofday(&tp, 0);
    return tp.tv_sec * 1000 + tp.tv_usec / 1000;
}
