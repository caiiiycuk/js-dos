




Created by caiiiycuk on 09.12.2019.



  

```
#include <dosbox.h>
#include <cstring>
#include "js-dos-debug-mem.h"

extern Bit32u GetHexValue(char* str, char*& hex);

bool DEBUG_JsDos_ParseCommand(char *str) {
    auto found = strstr(str, "MEMVALUE ");
    if (found) {
        found += strlen("MEMVALUE ");
        Bit8u val = (Bit8u) GetHexValue(found, found);
        MemAddSearchValue(val);
        return true;
    }

    found = strstr(str, "MEMRESULT");
    if (found) {
        MemSearchShowResult();
        return true;
    }

    found = strstr(str, "WRITESNAPSHOT");
    if (found) {
        WriteSnapshot();
        return true;
    }

    found = strstr(str, "READSNAPSHOT");
    if (found) {
        RestoreSnapshot();
        return true;
    }

    return false;
}


```




