extern "C" int dosbox_main(int argc, char** argv);

#include <emscripten.h>

int main(int i_argc, char* i_argv[]) {
    EM_ASM("SDL.defaults.copyOnLock = false; SDL.defaults.discardOnLock = true; SDL.defaults.opaqueFrontBuffer = false;");
	
    int argc = 3;
	const char *argv[3] = {
		"dosbox",
		"-conf",
		"./dosbox.conf"
	};

    return dosbox_main(argc, argv);
}