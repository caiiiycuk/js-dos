





  

```
#ifndef _JSDOS_EVENTS_H_
#define _JSDOS_EVENTS_H_

#include <string>
#include <vector>

union SDL_Event;


```







Events
======








Is abstraction for communcation between C++ and JS


  

```
class Events {
private:
    friend class CommandInterface;

    enum Browser {
        Firefox = 0,
        Other = 1
    };

    Browser browser;

    Events();

    void fixEventKeyCode(SDL_Event* event);


```







C++ --> JS
----------








**ready** - triggered when runtime is ready


  

```
    void ready();

public:

```







**frame** - triggered when frame is rendered


  

```
    void frame();


```







when dos shell is running  we can provide shell commands using this


  

```
    void shell_input(char *input_line, int length);


```







**write_stdout* - triggered when emulated program writes to stdout


  

```
    void write_stdout(const char * data, size_t count);


```







JS --> C++
----------
















**sdl_event** - wrapper over SDL_PollEvent allows injecting custom events
available events:
* sdl_key_event - to send key press


  

```
private:
    void registerPushSDLEvent();
public:
    int pollSDLEvent(SDL_Event *event);

private:

```







**exit** - if tirggered then runtime will be stopped


  

```
    void registerExit();


```







**screenshot** - if triggered then callback will receive screenshot image


  

```
    void registerScreenshot();

    void supplyScreenshotIfNeeded();
};

#endif // _JSDOS_EVENTS_H_

```




