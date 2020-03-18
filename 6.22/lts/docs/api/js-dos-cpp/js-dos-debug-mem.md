




Created by caiiiycuk on 09.12.2019.



  

```

#include <dosbox.h>
#include <cstdlib>
#include <mem.h>
#include <algorithm>
#include <vector>
#include <unordered_set>
#include "js-dos-debug-mem.h"
#include "timer.h"
#include <paging.h>
#include <regs.h>
#include <cassert>
#include <cstdio>
#include <video.h>
#include <render.h>
#include <vga.h>

extern Bit32u GetAddress(Bit16u seg, Bit32u offset);
extern void DEBUG_ShowMsg(char const* format,...);

const auto addressableSegments = 1; // 64Kb
const auto addressableOffsets = 0xFFFF;

std::unordered_set<Bit8u> watchingValues;
std::vector<std::pair<Bit16u, Bit32u> > addresses;
Bit32u reportedFoundCount = 0;

void MemAddSearchValue(Bit8u val) {
    watchingValues.clear();
    watchingValues.insert(val);
    reportedFoundCount = 0;
    MemSearchExecute();
}

void MemSearchExecute() {
    if (watchingValues.empty()) {
        return;
    }

    if (addresses.empty()) {
        addresses.reserve(addressableSegments * addressableOffsets);

```







search whole memory


  

```
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
        std::vector<std::pair<Bit16u, Bit32u> > newAddresses;
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

void MemSearchShowResult() {
    for (auto i = 0; i < std::min(addresses.size(), (size_t) 5); ++i) {
        DEBUG_ShowMsg("DEBUG: Match at %04x:%04x - %02x\n", addresses[i].first, addresses[i].second,
                      mem_readb(GetAddress(addresses[i].first, addresses[i].second)));
    }
}


void WriteSnapshot() {
    auto memSize = 16 * 1024 * 1024;
    auto segCount = memSize / 0xFFFF;

    FILE* f = fopen("snapshot.bin","wb");
    if (!f) {
        DEBUG_ShowMsg("DEBUG: Can't create snapshot.bin\n");
        return;
    }

    Bit8u *pixels;
    Bitu pitch;
    int width;
    int height;
    bool fullscreen;
    GFX_GetSize(width, height, fullscreen);
    if (!GFX_StartUpdate(pixels, pitch)) {
        DEBUG_ShowMsg("DEBUG: Can't capture video data\n");
        fclose(f);
        return;
    }

    fwrite(pixels, sizeof(Bit8u), height * pitch, f);


```







vga mem


  

```
    Bit32u vga_allocsize=vga.vmemsize;

```







Keep lower limit at 512k


  

```
    if (vga_allocsize<512*1024) vga_allocsize=512*1024;

```







We reserve extra 2K for one scan line


  

```
    vga_allocsize+=2048;

```







   vga.mem.linear_orgptr = new Bit8u[vga_allocsize+16];


  

```
    fwrite(vga.mem.linear_orgptr, 1, vga_allocsize + 16, f);

```







   vga.fastmem_orgptr = new Bit8u[(vga.vmemsize<<1)+4096+16];


  

```
    fwrite(vga.fastmem_orgptr, 1, (vga.vmemsize<<1)+4096+16, f);
    DEBUG_ShowMsg("Snapshot vga size %d %d\n", vga_allocsize + 16, (vga.vmemsize<<1)+4096+16);

    fwrite(&cpu_regs, sizeof(CPU_Regs), 1, f);

    for (auto seg = 0; seg < segCount; ++seg) {
        for (auto offset = 0; offset < 0xFFFF; ++offset) {
            Bit8u val;
            if (mem_readb_checked(GetAddress(seg, offset), &val)) {
                val = 0;
            }
            fwrite(&val, 1, 1, f);
        }
    }

    GFX_EndUpdate(0);
    fclose(f);
    DEBUG_ShowMsg("DEBUG: Machine dumped to snapshot.bin\n");
}

void RestoreSnapshot() {
    FILE* f = fopen("snapshot.bin","rb");
    if (!f) {
        DEBUG_ShowMsg("DEBUG: Can't open snapshot.bin\n");
        return;
    }

    Bit8u *pixels;
    Bitu pitch;
    int width;
    int height;
    bool fullscreen;
    GFX_GetSize(width, height, fullscreen);
    if (!GFX_StartUpdate(pixels, pitch)) {
        DEBUG_ShowMsg("DEBUG: Can't update video data\n");
        fclose(f);
        return;
    }
    fread(pixels, sizeof(Bit8u), height * pitch, f);


```







vga mem


  

```
    Bit32u vga_allocsize=vga.vmemsize;

```







Keep lower limit at 512k


  

```
    if (vga_allocsize<512*1024) vga_allocsize=512*1024;

```







We reserve extra 2K for one scan line


  

```
    vga_allocsize+=2048;

```







   vga.mem.linear_orgptr = new Bit8u[vga_allocsize+16];


  

```
    fread(vga.mem.linear_orgptr, 1, vga_allocsize + 16, f);

```







   vga.fastmem_orgptr = new Bit8u[(vga.vmemsize<<1)+4096+16];


  

```
    fread(vga.fastmem_orgptr, 1, (vga.vmemsize<<1)+4096+16, f);

    DEBUG_ShowMsg("Snapshot vga size %d %d\n", vga_allocsize + 16, (vga.vmemsize<<1)+4096+16);
    auto readcount = fread(&cpu_regs, sizeof(CPU_Regs), 1, f);
    if (readcount != 1) {
        assert(false);
    }

    Bit8u val;
    Bitu offset = 0;
    while (fread(&val, sizeof(Bit8u), 1, f) == 1) {
        mem_writeb_checked(GetAddress(offset / 0xFFFF, offset % 0xFFFF), val);
        offset++;
    }

    GFX_EndUpdate(0);
    fclose(f);
    DEBUG_ShowMsg("DEBUG: Snapshot readed from snapshot.bin\n");
}


```




