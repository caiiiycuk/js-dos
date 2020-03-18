





  

```
#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

#include <zip.h>

#ifdef __cplusplus
extern "C" {
#endif

int EMSCRIPTEN_KEEPALIVE extract_zip(const void *data, zip_uint64_t length);

#ifdef __cplusplus
}
#endif

```




