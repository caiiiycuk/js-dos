//
// Created by caiiiycuk on 08.02.2021.
//

#ifndef JS_DOS_JSDOS_ASYNCIFY_H
#define JS_DOS_JSDOS_ASYNCIFY_H
namespace jsdos {
  void initAsyncify();
  void destroyAsyncify();
}

extern "C" void asyncify_sleep(unsigned int ms);

#endif  // JS_DOS_JSDOS_ASYNCIFY_H
