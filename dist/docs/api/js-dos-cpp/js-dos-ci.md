



CommandInterface
=================================










  

```
#include <js-dos-ci.h>
#include <js-dos-protocol.h>
#ifdef EMSCRIPTEN
#include <emscripten.h>
extern "C" void destroySyncSleep();
#endif

CommandInterface::CommandInterface(): m_events(new Events()) {
#ifdef EMSCRIPTEN
  EM_ASM(({

```







ios.iframe.fix


  

```
    Module['canvas'].addEventListener('touchstart', function(event) {}, true);

```







ios.swipe.fix


  

```
    Module['canvas'].addEventListener('touchmove', function(event) { event.preventDefault() }, true);
  }));
#endif
}


```







When CommandInterface is destroyed, it means
that client wants to stop dosbox, so we stop
whole environment. Any other calls to any API
is no safe


  

```
CommandInterface::~CommandInterface() {
#ifdef EMSCRIPTEN
    destroySyncSleep();
    client_exit();
#endif
}

Events *CommandInterface::events() { return m_events.get(); }


```







Singleton of CommandInterface


  

```
CommandInterface *ci() {
  static CommandInterface *commandInterface = new CommandInterface();
  return commandInterface;
}


```




