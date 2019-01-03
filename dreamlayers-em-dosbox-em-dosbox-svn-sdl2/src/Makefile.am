AM_CPPFLAGS = -I$(top_srcdir)/include

SUBDIRS = cpu debug dos fpu gui hardware libs ints misc shell platform 

bin_PROGRAMS = dosbox

if HAVE_WINDRES
ico_stuff = winres.rc
endif

.rc.o:
	$(WINDRES) -o $@ $<

dosbox_SOURCES = dosbox.cpp $(ico_stuff)
dosbox_LDADD = cpu/libcpu.a debug/libdebug.a dos/libdos.a fpu/libfpu.a  hardware/libhardware.a gui/libgui.a \
               ints/libints.a misc/libmisc.a shell/libshell.a hardware/serialport/libserial.a libs/gui_tk/libgui_tk.a

EXTRA_DIST = winres.rc dosbox.ico

if EMSCRIPTEN_BUILD
dosbox_LDFLAGS=-s TOTAL_MEMORY=134217728 -s ALLOW_MEMORY_GROWTH=0
CLEANFILES=dosbox.js dosbox.html.mem dosbox.js.orig.js dosbox.js.tmp.js
if EMTERPRETER
dosbox_LDFLAGS+=-s EMTERPRETIFY=1 -s EMTERPRETIFY_ASYNC=1 -s EMTERPRETIFY_WHITELIST=@emterpretify.txt -s FETCH=1
EXTRA_dosbox_DEPENDENCIES=emterpretify.txt
else
# Memory init file is huge and it doesn't save bandwith even if using gzip.
# It is only required when using emterpreter.
dosbox_LDFLAGS+=--memory-init-file 0
endif
if WEBASSEMBLY
dosbox_LDFLAGS+=-s WASM=1
endif
endif

# https://stackoverflow.com/questions/1779984/header-dependency-in-automake
BUILT_SOURCES=version.stamp
version.stamp:
	python version.py ../include/version.h .. $(CXX)
