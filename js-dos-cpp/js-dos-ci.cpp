// CommandInterface
// =================================
#include <js-dos-ci.h>
#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

CommandInterface::CommandInterface(): m_events(new Events()) {
}

// When CommandInterface is destroyed, it means
// that client wants to stop dosbox, so we stop
// whole environment. Any other calls to any API
// is no safe
CommandInterface::~CommandInterface() {
#ifdef EMSCRIPTEN
  emscripten_force_exit(0);
#endif
}

Events *CommandInterface::events() { return m_events.get(); }

// Singleton of CommandInterface
CommandInterface *ci() {
  static CommandInterface *commandInterface = new CommandInterface();
  return commandInterface;
}
