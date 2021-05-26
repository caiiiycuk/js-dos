
Created by caiiiycuk on 14.01.2020.


```
#ifndef JS_DOS_JS_DOS_CORE_H
#define JS_DOS_JS_DOS_CORE_H

#include <mem.h>
#include <regs.h>

typedef PhysPt (*GetEAHandler)(void);

struct CoreSimple {
    Bitu opcode_index;
    HostPt cseip;
    PhysPt base_ds,base_ss;
    SegNames base_val_ds;
    bool rep_zero;
    Bitu prefixes;
    GetEAHandler * ea_table;
};

struct CorePrefetch {
    Bitu opcode_index;
    PhysPt cseip;
    PhysPt base_ds,base_ss;
    SegNames base_val_ds;
    bool rep_zero;
    Bitu prefixes;
    GetEAHandler * ea_table;
};

extern CoreSimple* getCoreSimple();
extern CorePrefetch* getCorePrefetch();

#endif //JS_DOS_JS_DOS_CORE_H

```


