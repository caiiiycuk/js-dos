set(CORE_FLAGS "${OPT_FLAGS} -Werror=return-type -Wno-deprecated")

if (${EMSCRIPTEN})
else ()
    add_definitions(-DEMSCRIPTEN_KEEPALIVE=)
    include_directories("${CMAKE_CURRENT_LIST_DIR}/jsdos/linux")
endif ()

add_definitions(-DHAVE_CONFIG_H -DGET_X86_FUNCTIONS -DJSDOS)

include_directories(
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/include"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/include"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox"
)

set(SOURCES_CORE_CXX11
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-asyncify.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-timer.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dosbox.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-support.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_files.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/cdrom_image.cpp"
        )


set(SOURCES_CORE_CXX03
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-log.cpp"

        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/core_simple.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/paging.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/core_prefetch.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/core_dyn_x86.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/core_full.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/core_dynrec.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/core_normal.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/cpu.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/callback.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/flags.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/cpu/modrm.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/fpu/fpu.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_pal.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/ems.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/xms.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_put_pixel.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/bios_disk.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/bios.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_misc.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_char.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_video_state.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_memory.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_vptable.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/bios_keyboard.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_vesa.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/int10_modes.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drive_local.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drive_cache.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_keyboard_layout.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/cdrom.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/cdrom_ioctl_linux.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/cdrom_ioctl_win32.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/cdrom_aspi_win32.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/cdrom_ioctl_os2.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drive_overlay.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_tables.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_devices.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_mscdex.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_execute.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_programs.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drive_virtual.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drives.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_ioctl.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_memory.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_classes.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/dos_misc.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drive_fat.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/dos/drive_iso.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/shell/shell.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/shell/shell_cmds.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/shell/shell_batch.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/shell/shell_misc.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/gui/midi.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/gui/sdl_gui.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/gui/render_scalers.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/gui/render.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/debug/debug.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/debug/debug_win32.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/debug/debug_disasm.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/debug/debug_gui.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/pcspeaker.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/sblaster.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/gus.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_attr.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_paradise.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/ipxserver.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/dma.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_xga.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/timer.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_dac.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/pic.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_s3.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/cmos.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_memory.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/dbopl.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_crtc.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/hardware.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_draw.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/ipx.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/adlib.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/iohandler.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/joystick.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_seq.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/pci_bus.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mpu401.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/keyboard.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_misc.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/tandy_sound.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_tseng.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_gfx.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/vga_other.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/gameblaster.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/disney.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/memory.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/directserial.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/serialdummy.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/nullmodem.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/serialport.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/libserial.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/softmodem.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/serialport/misc_util.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mame/fmopl.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mame/saa1099.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mame/sn76496.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mame/ymdeltat.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mame/ymf262.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/misc/programs.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/misc/setup.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/misc/cross.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/misc/support.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/misc/messages.cpp"
        #	"${CMAKE_CURRENT_LIST_DIR}/dosbox/src/libs/gui_tk/gui_tk.cpp"
        #	"${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/opl.cpp"
        #	"${CMAKE_CURRENT_LIST_DIR}/dosbox/src/libs/zmbv/drvproc.cpp"
        #	"${CMAKE_CURRENT_LIST_DIR}/dosbox/src/libs/zmbv/zmbv.cpp"
        #	"${CMAKE_CURRENT_LIST_DIR}/dosbox/src/libs/zmbv/zmbv_vfw.cpp"
        )

set(SOURCES_SDL_CXX03
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/gui/sdlmain.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/hardware/mixer.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/gui/sdl_mapper.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/dosbox/src/ints/mouse.cpp"
        #"${CMAKE_CURRENT_LIST_DIR}/jsdos-cpp/gui/sdlmain.cpp"
        )

set(SOURCES_JSDOS_CXX11
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-main.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-mixer.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-mapper-noop.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-noop.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/jsdos/jsdos-mouse.cpp"
        )

set_source_files_properties(${SOURCES_CORE_CXX03} PROPERTIES COMPILE_FLAGS "${CORE_FLAGS} -std=c++03 -Wno-switch")
set_source_files_properties(${SOURCES_CORE_CXX11} PROPERTIES COMPILE_FLAGS "${CORE_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_SDL_CXX03} PROPERTIES COMPILE_FLAGS "${CORE_FLAGS} -std=c++03 -Wno-switch")
set_source_files_properties(${SOURCES_JSDOS_CXX11} PROPERTIES COMPILE_FLAGS "${CORE_FLAGS} -std=c++11")

set(SOURCES_SERVER_CORE ${SOURCES_CORE_CXX11} ${SOURCES_CORE_CXX03})
set(SOURCES_SERVER_SDL ${SOURCES_SERVER_CORE} ${SOURCES_SDL_CXX03})
set(SOURCES_SERVER_JSDOS ${SOURCES_SERVER_CORE} ${SOURCES_JSDOS_CXX11})
