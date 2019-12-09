//
// Created by caiiiycuk on 09.12.2019.
//
#include <dosbox.h>
#include <cstring>
#include "js-dos-debug-mem.h"

extern Bit32u GetHexValue(char* str, char*& hex);

bool DEBUG_JsDos_ParseCommand(char *str) {
    auto found = strstr(str, "MSRSET ");
    if (found) {
        found += strlen("MSRSET ");
        Bit8u val = (Bit8u) GetHexValue(found, found);
        MSR_Set(val);
        return true;
    }

    found = strstr(str, "MSRSHOW");
    if (found) {
        MSR_Show();
        return true;
    }

    found = strstr(str, "INITSEARCH ");
    if (found) { // Init Search
        found += 11;
        Bit16u seg = (Bit16u) GetHexValue(found, found);
        found++;
        Bit32u ofs = GetHexValue(found, found);
        found++;
        Bit32u num = GetHexValue(found, found);
        found++;
        InitSearch(seg, ofs, num);
        return true;
    }

    found = strstr(str, "DOSEARCH ");
    if (found) { // Search
        found += 9;
        char func[6];
        int i;
        SearchFunc op;
        for (i = 0; i < 5; i++) {
            if ((found[i] != ' ') && (found[i] != 0)) func[i] = found[i];
            else {
                func[i] = 0;
                break;
            };
        };
        func[5] = 0;
        found += i;
        if (!strcmp(func, "EQ")) {
            op = SearchFnEq;
        } else if (!strcmp(func, "NE")) {
            op = SearchFnNe;
        } else if (!strcmp(func, "LT")) {
            op = SearchFnLt;
        } else if (!strcmp(func, "GT")) {
            op = SearchFnGt;
        } else if (!strcmp(func, "EQVAL")) {
            op = SearchFnEqVal;
        } else {
            op = SearchFnEqVal;
        }
        Bit8u val = (Bit8u) GetHexValue(found, found);
        found++;
        DoSearch(op, val);
        return true;
    }
    return false;
}
