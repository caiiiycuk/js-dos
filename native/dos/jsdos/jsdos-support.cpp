#include <jsdos-support.h>

namespace {
    bool _exit = false;
}


bool jsdos::isExitRequested() {
    return _exit;
}

void jsdos::requestExit() {
    _exit = true;
}
