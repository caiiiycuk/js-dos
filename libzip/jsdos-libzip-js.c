//
// Created by caiiiycuk on 14.04.2020.
//

#ifdef EMSCRIPTEN
#include <emscripten.h>
#else
#include <jsdos-libzip.h>
#endif

int main(int argc, char** argv) {
#ifdef EMSCRIPTEN
    emscripten_exit_with_live_runtime();
#else
    ZipArchive *archive = zip_from_fs();
    if (archive) {
        printf("Archive size %.2f Mb\n", archive->length / 1024.0f / 1024);
    }
    free(archive);
#endif
    return 0;
}
