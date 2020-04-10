// CommandInterface
// =================================
#include <jsdos-ci.h>
#include <jsdos-protocol.h>
#ifdef EMSCRIPTEN
#include <emscripten.h>
extern "C" void destroySyncSleep();
#endif

CommandInterface::CommandInterface(): m_events(new Events()) {
    // TODO: @caiiiycuk
// #ifdef EMSCRIPTEN
//   EM_ASM(({
//     // ios.iframe.fix
//     Module['canvas'].addEventListener('touchstart', function(event) {}, true);
//     // ios.swipe.fix
//     Module['canvas'].addEventListener('touchmove', function(event) { event.preventDefault() }, true);
//   }));
// #endif
}

// When CommandInterface is destroyed, it means
// that client wants to stop dosbox, so we stop
// whole environment. Any other calls to any API
// is no safe
CommandInterface::~CommandInterface() {
    delete m_events;
#ifdef EMSCRIPTEN
    destroySyncSleep();
    emscripten_force_exit(0);
#endif
}

Events *CommandInterface::events() { return m_events; }

// Singleton of CommandInterface
CommandInterface *ci() {
  static CommandInterface *commandInterface = new CommandInterface();
  return commandInterface;
}
