#ifdef EMSCRIPTEN
#include <emscripten.h>

#include <stdio.h>
#include <stdlib.h>
#include "mem.h"
#include "regs.h"
#include "dos_inc.h" /* for Drives[] */
#include "src/dos/drives.h"

EM_JS(void, emsc_dump_memory_contents, (HostPt memBase,
            uint32_t ip, uint32_t flags, void *regs,
            uint16_t *segs_val, uint32_t *segs_phys,
            uint32_t numPages, bool copyDosMemory), {
    Module.memoryContents = {
        "memBase": memBase,
        "ip": ip,
        "flags": flags,
        "registers": {
            "ax": Module.HEAPU32[(regs+0)>>2],
            "cx": Module.HEAPU32[(regs+1)>>2],
            "dx": Module.HEAPU32[(regs+2)>>2],
            "sp": Module.HEAPU32[(regs+3)>>2],
            "bp": Module.HEAPU32[(regs+4)>>2],
            "si": Module.HEAPU32[(regs+5)>>2],
            "di": Module.HEAPU32[(regs+6)>>2]
        },
        "segments_values": {
            "es": Module.HEAPU16[(segs_val+0)>>1],
            "cs": Module.HEAPU16[(segs_val+1)>>1],
            "ss": Module.HEAPU16[(segs_val+2)>>1],
            "ds": Module.HEAPU16[(segs_val+3)>>1],
            "fs": Module.HEAPU16[(segs_val+4)>>1],
            "gs": Module.HEAPU16[(segs_val+5)>>1]
        },
        "segments_physical": {
            "es": Module.HEAPU32[(segs_phys+0)>>2],
            "cs": Module.HEAPU32[(segs_phys+1)>>2],
            "ss": Module.HEAPU32[(segs_phys+2)>>2],
            "ds": Module.HEAPU32[(segs_phys+3)>>2],
            "fs": Module.HEAPU32[(segs_phys+4)>>2],
            "gs": Module.HEAPU32[(segs_phys+5)>>2]
        },
        "numPages": numPages,
        "memoryCopy": undefined
    };
    if (copyDosMemory) {
        Module.memoryContents['memoryCopy'] = Module.HEAPU8.slice(
                memBase, memBase + (numPages / 4096)*1024*1024);
    }
  });

extern "C" void EMSCRIPTEN_KEEPALIVE dumpMemory(bool copyDosMemory) {
  HostPt memBase = GetMemBase();
  Bitu numPages = MEM_TotalPages();
  emsc_dump_memory_contents(memBase, cpu_regs.ip.dword[0],
          cpu_regs.flags, (void*)cpu_regs.regs, Segs.val, Segs.phys,
          numPages, copyDosMemory);
  return;
}

extern "C" void EMSCRIPTEN_KEEPALIVE rescanFilesystem() {
  // This is essentially what the RESCAN program does
  for(Bitu i=0;i<DOS_DRIVES;i++) {
    if (Drives[i]) Drives[i]->EmptyCache();
  }
  return;
}

#endif // ifdef EMSCRIPTEN
