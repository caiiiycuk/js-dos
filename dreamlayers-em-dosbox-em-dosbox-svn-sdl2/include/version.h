#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

const char* getVersion() {
#ifdef EMSCRIPTEN
    static char *version = 0;
    if (version == 0) {
        version = new char[256];
        EM_ASM_ARGS(({
            const version = Module['version'];
            const versionLength = Module['lengthBytesUTF8'](version) + 1;

            if (versionLength > 256) {
                versionLength = 256;
            }

            Module['stringToUTF8'](version, $0, versionLength);
        }), version);
    }
    return version;
#else
    return "linux";
#endif
}