#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

extern "C" int EMSCRIPTEN_KEEPALIVE extract_zip(const void *data, zip_uint64_t length);
