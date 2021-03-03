#ifdef EMSCRIPTEN
#include <emscripten.h>

#include <stdio.h>
#include <stdlib.h>
#include "mem.h"
#include "regs.h"
#include "dos_inc.h" /* for Drives[] */
#include "dosbox.h"
#include "src/dos/drives.h"
#include "jsdos-asyncify.h"

struct RegisterSet {
  uint32_t al;
  uint32_t ah;
  uint32_t ax;
  uint32_t eax;

  uint32_t bl;
  uint32_t bh;
  uint32_t bx;
  uint32_t bex;

  uint32_t cl;
  uint32_t ch;
  uint32_t cx;
  uint32_t cex;

  uint32_t dl;
  uint32_t dh;
  uint32_t dx;
  uint32_t edx;

  uint32_t si;
  uint32_t esi;

  uint32_t di;
  uint32_t edi;

  uint32_t sp;
  uint32_t esp;

  uint32_t bp;
  uint32_t ebp;

  uint32_t ip;
  uint32_t eip;

};

EM_JS(void, emsc_dump_memory_contents, (HostPt memBase,
            uint32_t ip, uint32_t flags, RegisterSet regs,
            uint16_t *segs_val, uint32_t *segs_phys,
            uint32_t numPages, bool copyDosMemory), {

    registerNames = ["al", "ah", "ax", "eax",
                     "bl", "bh", "bx", "ebx",
                     "cl", "ch", "cx", "ecx",
                     "dl", "dh", "dx", "edx",
                     "si", "esi", "di", "edi",
                     "sp", "esp", "bp", "ebp",
                     "ip", "eip"];
    registers = Object.fromEntries(registerNames.map((_, i) => 
                [_, Module.HEAPU32[(regs>>2) + i]]));

    Module.memoryContents = {
        "memBase": memBase,
        "ip": ip,
        "flags": flags,
        "registers": registers,
        "segments_values": {
            "es": Module.HEAPU16[(segs_val>>1)+0],
            "cs": Module.HEAPU16[(segs_val>>1)+1],
            "ss": Module.HEAPU16[(segs_val>>1)+2],
            "ds": Module.HEAPU16[(segs_val>>1)+3],
            "fs": Module.HEAPU16[(segs_val>>1)+4],
            "gs": Module.HEAPU16[(segs_val>>1)+5]
        },
        "segments_physical": {
            "es": Module.HEAPU32[(segs_phys>>2)+0],
            "cs": Module.HEAPU32[(segs_phys>>2)+1],
            "ss": Module.HEAPU32[(segs_phys>>2)+2],
            "ds": Module.HEAPU32[(segs_phys>>2)+3],
            "fs": Module.HEAPU32[(segs_phys>>2)+4],
            "gs": Module.HEAPU32[(segs_phys>>2)+5]
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

  // As noted in mem.h, mem_readb accounts for the paged memory system.
  uint8_t *reallocatedBuffer = (uint8_t*)malloc((numPages / 4096)*1024*1024);
  for (Bitu x = 0; x < (numPages / 4096)*1024*1024; x++) {
    reallocatedBuffer[x] = mem_readb(x);
  }

  // The macros below use macros defined in regs.h
  RegisterSet regs;

  regs.al = reg_al;
  regs.ah = reg_ah;
  regs.ax = reg_ax;
  regs.eax = reg_eax;

  regs.bl = reg_bl;
  regs.bh = reg_bh;
  regs.bx = reg_bx;
  regs.bex = reg_ebx;

  regs.cl = reg_cl;
  regs.ch = reg_ch;
  regs.cx = reg_cx;
  regs.cex = reg_ecx;

  regs.dl = reg_dl;
  regs.dh = reg_dh;
  regs.dx = reg_dx;
  regs.edx = reg_edx;

  regs.si = reg_si;
  regs.esi = reg_esi;

  regs.di = reg_di;
  regs.edi = reg_edi;

  regs.sp = reg_sp;
  regs.esp = reg_esp;

  regs.bp = reg_bp;
  regs.ebp = reg_ebp;

  regs.ip = reg_ip;
  regs.eip = reg_eip;

  emsc_dump_memory_contents(reallocatedBuffer, cpu_regs.ip.dword[0],
          cpu_regs.flags, regs, Segs.val, Segs.phys,
          numPages, copyDosMemory);
  free(reallocatedBuffer);
  return;
}

extern "C" void EMSCRIPTEN_KEEPALIVE rescanFilesystem() {
  // This is essentially what the RESCAN program does
  for(Bitu i=0;i<DOS_DRIVES;i++) {
    if (Drives[i]) Drives[i]->EmptyCache();
  }
  return;
}

Bitu DosBox_Pause(void) {
  asyncify_sleep(1);
  return 0;
}

extern "C" bool EMSCRIPTEN_KEEPALIVE pauseExecution(bool shouldPause) {
  // This will toggle the debugger mode. We replicate some logic here to avoid
  // displaying the debugger code ons-screen.
  static bool debuggingEnabled = false;
  if(shouldPause) {
    debuggingEnabled = true;
    DOSBOX_SetLoop(&DosBox_Pause);
  } else {
    debuggingEnabled = false;
    DOSBOX_SetNormalLoop();
  }
  return debuggingEnabled;
}

#endif // ifdef EMSCRIPTEN
