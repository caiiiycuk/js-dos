//
// Created by caiiiycuk on 09.12.2019.
//

#include <dosbox.h>
#include <cstdlib>
#include <mem.h>
#include <algorithm>
#include <vector>
#include <unordered_set>
#include "js-dos-debug-mem.h"
#include "timer.h"

extern Bit32u GetAddress(Bit16u seg, Bit32u offset);

const auto addressableSegments = 1; // 64Kb
const auto addressableOffsets = 0xFFFF;

std::unordered_set<Bit8u> watchingValues;
std::vector<std::pair<Bit16u, Bit32u>> addresses;
Bit32u reportedFoundCount = 0;

void MSR_Set(Bit8u val) {
    watchingValues.clear();
    watchingValues.insert(val);
    reportedFoundCount = 0;
    MSR_Execute();
}

bool MSR_InitTimer() {
//    TIMER_AddTickHandler([]() {
//        static Uint32 lastExecuteTime = 0;
//        Uint32 now = SDL_GetTicks();
//        if (now - lastExecuteTime > 1000) {
//            MSR_Execute();
//            lastExecuteTime = now;
//        }
//    });
    return true;
}

void MSR_Execute() {
    static bool init = MSR_InitTimer();

    if (watchingValues.empty()) {
        return;
    }

    if (addresses.empty()) {
        addresses.reserve(addressableSegments * addressableOffsets);
        // search whole memory
        for (auto seg = 0; seg < addressableSegments; ++seg) {
            for (auto off = 0; off < addressableOffsets; ++off) {
                auto ptr = GetAddress(seg, off);
                auto val = mem_readb(ptr);

                if (watchingValues.find(val) != watchingValues.end()) {
                    addresses.push_back(std::make_pair<>(seg, off));
                }
            }
        }
    } else {
        std::vector<std::pair<Bit16u, Bit32u>> newAddresses;
        newAddresses.reserve(addresses.size());
        for (auto next: addresses) {
            auto val = mem_readb(GetAddress(next.first, next.second));

            if (watchingValues.find(val) != watchingValues.end()) {
                newAddresses.push_back(next);
            }
        }

        addresses = newAddresses;
    }

    if (reportedFoundCount != addresses.size()) {
        reportedFoundCount = addresses.size();
        DEBUG_ShowMsg("DEBUG: Mem Search found %d addresses\n", reportedFoundCount);
    }
}

void MSR_Show() {
    for (auto i = 0; i < std::min(addresses.size(), (size_t) 5); ++i) {
        DEBUG_ShowMsg("DEBUG: Match at %04x:%04x - %02x\n", addresses[i].first, addresses[i].second,
                      mem_readb(GetAddress(addresses[i].first, addresses[i].second)));

    }
}


static Bit32u SearchLength = 0;
static Bitu SearchSeg;
static Bitu SearchOfs;
static Bit8u *SearchBuffer = NULL;
static Bit8u *SearchBufferValid = NULL;
#define MAX_SEARCH_RESULTS    20

static Bitu SearchResults[MAX_SEARCH_RESULTS][2]; // Seg:Ofs



void InitSearch(Bitu seg, Bitu ofs1, Bit32u num) {
    DEBUG_ShowMsg("DEBUG: Init called with params %04x:%04x - %04x.\n", seg, ofs1, num);
    SearchLength = num;
    SearchSeg = seg;
    SearchOfs = ofs1;
    free(SearchBuffer);
    free(SearchBufferValid);
    SearchBuffer = (Bit8u *) malloc(num);
    if (SearchBuffer == NULL) {
        DEBUG_ShowMsg("DEBUG: Out Of Memory during search initialization.\n");
        return;
    }
    SearchBufferValid = (Bit8u *) malloc(num);
    if (SearchBufferValid == NULL) {
        DEBUG_ShowMsg("DEBUG: Out Of Memory during search initialization.\n");
        free(SearchBuffer);
        SearchBuffer = NULL;
        return;
    }
    for (Bitu x = 0; x < num; x++) {
        SearchBuffer[x] = mem_readb(GetAddress(seg, ofs1 + x));
        SearchBufferValid[x] = 1;
    }
}

void DoSearch(SearchFunc op, Bit8u val) {
    DEBUG_ShowMsg("DEBUG: DoSearch called with params %s, %04x.\n",
                  (op == SearchFnEq) ? "SearchFnEq" :
                  (op == SearchFnNe) ? "SearchFnNe" :
                  (op == SearchFnLt) ? "SearchFnLt" :
                  (op == SearchFnGt) ? "SearchFnGt" :
                  (op == SearchFnEqVal) ? "SearchFnEqVal" : "unknown", val);
    Bitu nResults = 0;
    for (Bitu x = 0; x < SearchLength; x++) {
        if (SearchBufferValid[x] == 1) {
            if (op(SearchBuffer[x], mem_readb(GetAddress(SearchSeg, SearchOfs + x)), val)) {
                SearchBuffer[x] = mem_readb(GetAddress(SearchSeg, SearchOfs + x));
                if (nResults < MAX_SEARCH_RESULTS) {
                    SearchResults[nResults][0] = SearchSeg;
                    SearchResults[nResults][1] = SearchOfs + x;
                }
                nResults++;
            } else {
                SearchBufferValid[x] = 0;
            }
        }
    }

    for (Bitu x = 0; x < std::min(MAX_SEARCH_RESULTS, (int) nResults); x++) {
        DEBUG_ShowMsg("DEBUG: Match at %04x:%04x - %02x\n", SearchResults[x][0], SearchResults[x][1],
                      mem_readb(GetAddress(SearchResults[x][0], SearchResults[x][1])));
    }

    DEBUG_ShowMsg("DEBUG: %d results found.\n", nResults);
}

int SearchFnEq(Bit8u lhs, Bit8u rhs, Bit8u val) {
    return (lhs == rhs);
}

int SearchFnNe(Bit8u lhs, Bit8u rhs, Bit8u val) {
    return (lhs != rhs);
}

int SearchFnLt(Bit8u lhs, Bit8u rhs, Bit8u val) {
    return (lhs > rhs);
}

int SearchFnGt(Bit8u lhs, Bit8u rhs, Bit8u val) {
    return (lhs < rhs);
}

int SearchFnEqVal(Bit8u lhs, Bit8u rhs, Bit8u val) {
    return lhs == rhs && rhs == val;
}

