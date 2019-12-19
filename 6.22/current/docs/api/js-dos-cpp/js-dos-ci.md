



CommandInterface
=================================










  

```
#include <js-dos-ci.h>
#ifdef EMSCRIPTEN
#include <emscripten.h>
extern "C" void destroySyncSleep();
#endif

CommandInterface::CommandInterface(): m_events(new Events()) {
#ifdef EMSCRIPTEN
  EM_ASM(({

```







export whole SDL


  

```
    Module['SDL'] = SDL;

```







ios.iframe.fix


  

```
    Module['canvas'].addEventListener('touchstart', function(event) {}, true);

```







ios.swipe.fix


  

```
    Module['canvas'].addEventListener('touchmove', function(event) { event.preventDefault() }, true);

    var fixSounds = function(event) {
      if (SDL && SDL.audioContext && SDL.audioContext.state) {
          if (SDL.audioContext.state !== 'running') {
              SDL.audioContext.resume();
          }
      }
    };
    window.addEventListener("touchstart", fixSounds, true);
    window.addEventListener("mousedown", fixSounds, true);    
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
    emscripten_force_exit(0);
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




