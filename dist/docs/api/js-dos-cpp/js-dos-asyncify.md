




Created by caiiiycuk on 13.11.2019.



  

```

#ifdef EMSCRIPTEN
#import <emscripten.h>
#endif

extern "C" void asyncify_sleep_with_yield(unsigned int ms) {
#ifdef EMSCRIPTEN

```







replacement for emscripten_sleep_with_yield in asyncify environment


  

```
    EM_ASM(({
        if (SDL && SDL.audio && SDL.audio.queueNewAudioData) {
            SDL.audio.queueNewAudioData();
        }
    }));
    emscripten_sleep(ms);
#endif
}


```




