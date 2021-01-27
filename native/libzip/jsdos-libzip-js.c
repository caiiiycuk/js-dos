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
    if (!archive) {
      return -1;
    }

    auto length = ((uint32_t*) archive)[0];
    auto data = ((char*) archive + sizeof(uint32_t));

    auto* f = fopen("/tmp/archive.zip", "wb");
    fwrite(data, sizeof(char), length, f);
    fclose(f);

    free(archive);

    printf("Archive size %.2f Kb\n", length / 1024.0f);
#endif
    return 0;
}
