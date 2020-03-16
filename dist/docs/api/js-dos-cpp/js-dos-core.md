




Created by caiiiycuk on 15.01.2020.



  

```

#include <js-dos-core.h>
#include <sys/time.h>

CoreSimple* getCoreSimple() {
    static CoreSimple coreSimple;
    return &coreSimple;
}

CorePrefetch* getCorePrefetch() {
    static CorePrefetch corePrefetch;
    return &corePrefetch;
}



```




