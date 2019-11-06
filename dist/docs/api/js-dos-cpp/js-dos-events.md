





  

```
#include <js-dos-ci.h>
#include <js-dos-events.h>
#include <js-dos-json.h>
#include <unordered_map>

#include <SDL/SDL_events.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif


```







send
----








Send is low level api to communicate with CommandInterface, it is used by
javascript. Javascript can use this method to send information into c++
layer, like this:
```
  Module['send']('event', msg, funciton callback(msg) {
    // ...
  });
```
callback will be called only if 'event' is know for c++ layer, and only when
c++ layer call callback so IT IS ASYNC!








Types:
* **send_callback_fn** - function that C++ code should call, to trigger
javascript callback function (that passed to send method)


  

```
typedef void (*send_callback_fn)(const std::string &callback_name,
                                 const jsonstream &);

```







* **send_handler_fn** - handler for javascript callbacks


  

```
typedef void (*send_handler_fn)(const std::string &callback_name,
                                const char *data, send_callback_fn callback_fn);

std::unordered_map<std::string, send_handler_fn> &getSendHandlers() {
  static std::unordered_map<std::string, send_handler_fn> sendHandlers;
  return sendHandlers;
}


```







**_send** - is actual implemenation of Module['__send']


  

```
extern "C" void EMSCRIPTEN_KEEPALIVE _send(const char *ckey, const char *data,
                                           const char *ccallback) {
  jsonstream emptystream;
  static void (*fn)(const std::string &, const jsonstream &) =
      [](const std::string &callback, const jsonstream &stream) -> void {
#ifdef EMSCRIPTEN
    EM_ASM_ARGS(
        {
          var clfield = UTF8ToString($0);
          var innerobj = UTF8ToString($1);
          if (innerobj.length > 0) {
            innerobj = innerobj.slice(0, -1);
          }
          var object = JSON.parse('{' + innerobj + '}');
          if (clfield in Module) {
            Module[clfield](object);
            delete Module[clfield];
          }
        },
        callback.c_str(), stream.c_str());
#endif
  };

  std::string key(ckey);
  std::string callback(ccallback);

  auto sendHandlers = getSendHandlers();
  auto found = sendHandlers.find(key);
  if (found != sendHandlers.end()) {
    found->second(callback, data, fn);
    return;
  }

  printf("WARN! Can't find handler for key '%s'\n", ckey);
}


```







**registerSendFn** - add send function to Module object


  

```
void registerSendFn() {
#ifdef EMSCRIPTEN
  EM_ASM(({
    Module['send'] = function(key, data, callback) {
      if (!callback) {
        callback = function(){};
      }

      if (!data) {
        data = "";
      }

      var clfield = key + '_callback_' + Math.random();

      var keyLength = Module['lengthBytesUTF8'](key) + 1;
      var clfieldLength = Module['lengthBytesUTF8'](clfield) + 1;
      var dataLength = Module['lengthBytesUTF8'](data) + 1;

      var clfieldBuffer = Module['_malloc'](clfieldLength);
      var keyBuffer = Module['_malloc'](keyLength);
      var dataBuffer = Module['_malloc'](dataLength);

      Module['stringToUTF8'](key, keyBuffer, keyLength);
      Module['stringToUTF8'](clfield, clfieldBuffer, clfieldLength);
      Module['stringToUTF8'](data, dataBuffer, dataLength);

      Module[clfield] = callback;
      Module['__send'](keyBuffer, dataBuffer, clfieldBuffer);
      Module['_free'](keyBuffer);
      Module['_free'](clfieldBuffer);
      Module['_free'](dataBuffer);
    };
  }));
#endif
}


```







Ping
----








Ping is opposite to send, it called by c++ to trigger something in javascript


  

```
void ping(const char *event) {
#ifdef EMSCRIPTEN
  EM_ASM(({
           const event = UTF8ToString($0);
           Module['ping'](event);
         }),
         event);
#else
#endif
}

Events::Events(): browser(Browser::Other) {
  registerSendFn();
  registerExit();
  registerScreenshot();
  registerPushSDLEvent();
#ifdef EMSCRIPTEN
  browser = (Events::Browser) EM_ASM_INT((
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      return 0; // firefox
    }
    return 1; // othters
  ));
#endif
  
}

void Events::ready() { ping("ready"); }

void Events::frame() {
  static long frameCount = 0;

  if (frameCount == 0) {

```







do nothing


  

```
  } else if (frameCount == 1) {
    ready();
  } else {
    supplyScreenshotIfNeeded();
  }

  frameCount++;
  ping("frame");
}

void Events::registerExit() {
  getSendHandlers().insert(std::make_pair<>(
      "exit", [](const std::string &callback_name, const char *data,
                 send_callback_fn callback_fn) {
        delete ci();
        callback_fn(callback_name, jsonstream());
      }));
}

void Events::registerScreenshot() {
  getSendHandlers().insert(std::make_pair<>(
      "screenshot", [](const std::string &callback_name, const char *data,
                       send_callback_fn callback_fn) {
#ifdef EMSCRIPTEN
        EM_ASM((const callbackName = UTF8ToString($0);
                Module['screenshot_callback_name'] = callbackName;),
               callback_name.c_str());
#endif
      }));
}

void Events::supplyScreenshotIfNeeded() {
#ifdef EMSCRIPTEN
  EM_ASM(({
    if (!Module['screenshot_callback_name']) {
      return;
    }

    const callbackName = Module['screenshot_callback_name'];
    const imgData = Module['canvas'].toDataURL("image/png");
    const callback = Module[callbackName];
    delete Module[callbackName];
    delete Module['screenshot_callback_name'];
    callback(imgData);
  }));
#endif
}

void Events::fixEventKeyCode(SDL_Event* event) {

```







event->key.keysum.sym is used to map keys
You can find correct key by logging CreateKeyBind








printf("event-in  %d %d \n", event->key.keysym.sym, event->key.keysym.scancode);


  

```
#ifdef EMSCRIPTEN
  if (browser != Browser::Firefox) {
    switch ((int)event->key.keysym.sym) {
      case 186: { // ':'
        event->key.keysym.sym = 59;
      } break;
      case 187: { // '='
        event->key.keysym.sym = 61;
      } break;
      case 189: { // '-'
        event->key.keysym.sym = 45;
      } break;
      default:;
    }
  }

  switch ((int)event->key.keysym.sym) {
    case 39: { // '\''
      event->key.keysym.sym = 222;
    } break;
    default:;
  }


```







printf("event-out  %d %d \n", event->key.keysym.sym, event->key.keysym.scancode);


  

```
#endif
}

std::vector<SDL_Event> sdlEvents;
int Events::pollSDLEvent(SDL_Event *event) {
  auto result = SDL_PollEvent(event);
  if (result == 0) {
    if (!sdlEvents.empty()) {
      *event = sdlEvents.back();
      sdlEvents.pop_back();
      result = 1;
    }
  }
  if (result > 0 && (event->type == SDL_KEYDOWN || event->type == SDL_KEYUP)) {
    fixEventKeyCode(event);
  }
  return result;
}

void Events::registerPushSDLEvent() {
#ifdef EMSCRIPTEN
  getSendHandlers().insert(std::make_pair<>(
          "sdl_key_event", [](const std::string &callback_name, const char *data,
                              send_callback_fn callback_fn) {

```







typedef struct SDL_KeyboardEvent
{
 Uint32 type;        /**< ::SDL_KEYDOWN or ::SDL_KEYUP */
 Uint32 windowID;    /**< The window with keyboard focus, if any */
 Uint8 state;        /**< ::SDL_PRESSED or ::SDL_RELEASED */
 Uint8 repeat;       /**< Non-zero if this is a key repeat */
 Uint8 padding2;
 Uint8 padding3;
 SDL_Keysym keysym;  /**< The key that was pressed or released */
} SDL_KeyboardEvent;

typedef struct SDL_Keysym
{
   SDL_Scancode scancode;      /**< SDL physical key code - see ::SDL_Scancode for details */
   SDL_Keycode sym;            /**< SDL virtual key code - see ::SDL_Keycode for details */
   Uint16 mod;                 /**< current key modifiers */
   Uint32 unicode;             /**< \deprecated use SDL_TextInputEvent instead */
} SDL_Keysym;


  

```
              auto code = atoi(data);

              SDL_Keysym keysym;
              keysym.scancode = (SDL_Scancode) code;
              keysym.sym = (SDL_Keycode) code;
              keysym.mod = KMOD_NONE;
              keysym.unicode = 0;

              SDL_Event event;
              event.key.type = SDL_KEYDOWN;
              event.key.windowID = 0;
              event.key.state = SDL_PRESSED;
              event.key.repeat = 0;
              event.key.keysym = keysym;
              sdlEvents.insert(sdlEvents.begin(), event);

              event.key.type = SDL_KEYUP;
              event.key.state = SDL_RELEASED;
              sdlEvents.insert(sdlEvents.begin(), event);
              callback_fn(callback_name, jsonstream());
          }));
#endif
}

void Events::shell_input(char *input_line, int length) {
#ifdef EMSCRIPTEN
    EM_ASM_(({
        Module['ping']('shell_input', $0, $1);
    }), input_line, length);
#endif
}

void Events::write_stdout(const char* data, size_t amount) {
#ifdef EMSCRIPTEN
    EM_ASM_ARGS((
        const data = UTF8ToString($0, $1);
        Module['ping']('write_stdout', data);
    ), data, amount);
#else
    printf("%s", data);
#endif
}


```




