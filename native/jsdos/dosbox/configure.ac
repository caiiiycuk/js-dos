dnl Init.
AC_INIT(dosbox,SVN)
AC_PREREQ(2.50)
AC_CONFIG_SRCDIR(README)

dnl Check for Emscripten is done early because it needs to change host triplet.
AS_CASE([$CC],
        [*emcc], [enable_emscripten="yes"],
        [enable_emscripten="no"])

AS_IF([test "x$enable_emscripten" = "xyes"],
      AC_MSG_NOTICE([auto-detected use of Emscripten]))

AC_ARG_ENABLE(
  [emscripten],
  [AC_HELP_STRING([--enable-emscripten=@<:@no/yes@:>@],
                  [compile to JavaScript using Emscripten])])

dnl AC_CANONICAL_HOST fails to detect Emscripten.
dnl This contains kludges to make things work.
AS_IF([test "x$enable_emscripten" = "xyes"],
      [host_alias=none
       : ${CXXFLAGS="-O3"}
       : ${CFLAGS="-O3"}
       ac_cv_exeext=.html])

dnl Detect the canonical host and target build environment
AC_CANONICAL_HOST
AC_CANONICAL_BUILD

dnl Setup for automake
AM_INIT_AUTOMAKE
AC_CONFIG_HEADER(config.h)

dnl Checks for programs.
AC_PROG_MAKE_SET
AC_PROG_CC
AC_PROG_CPP
AC_PROG_CXX
AC_PROG_INSTALL
AC_PROG_RANLIB
AM_PROG_AR

dnl This probably needs to be after Automake init
AM_CONDITIONAL([EMSCRIPTEN_BUILD], [test "x$enable_emscripten" = "xyes"])

dnl Function array core
AC_ARG_ENABLE(
  [funarray],
  [AC_HELP_STRING([--enable-funarray@<:@=no/yes@:>@],
                  [Use array of function pointers in CPU core.
                   Defaults to yes with Emscripten and no otherwise.])],
  [],
  [AS_IF([test "x$enable_emscripten" = "xyes"],
         [enable_funarray=yes],
         [enable_funarray=no])])
AM_CONDITIONAL([FUNARRAY_CORE], [test "x$enable_funarray" = "xyes"])
AS_IF([test "x$enable_funarray" = "xyes"],
      [AC_DEFINE(FUNARRAY_CORE, 1, [use array of function pointers in core])])

dnl Some needed libaries for OS2
dnl perharps join this with the other target depended checks. move them upwards
if test x$host = xi386-pc-os2-emx ; then
    CXXFLAGS="$CXXFLAGS -Zmt"
    LDFLAGS="$LDFLAGS -Zomf -Zmt"
fi

dnl Check for SDL
dnl When cross-compiling, the SDL prefix needs to be set, so the right
dnl sdl-config is found. SDL is included with Emscripten and its
dnl sdl-config does nothing, so just assume SDL is present then.
AC_ARG_WITH(sdl2, [AC_HELP_STRING([--with-sdl2=no/PATH],
                  [SDL 2 is used by default. Use this option to select SDL 1
                   instead or provide a path to a custom Emscripten SDL 2
                   build.])],
                  [], [with_sdl2=yes])
AS_IF([test "x$enable_emscripten" != "xyes"],[
SDL_VERSION=1.2.0
AM_PATH_SDL(:,
            :,
	    :
)
LIBS="$LIBS $SDL_LIBS"
CPPFLAGS="$CPPFLAGS $SDL_CFLAGS"

dnl Check if SDL is 1.2.x, 2.0.y
AC_MSG_CHECKING([SDL version only being 1.2.x or 2.0.x])
AC_COMPILE_IFELSE([AC_LANG_SOURCE([
#include "SDL.h"
void blah(){
#if !((SDL_MAJOR_VERSION == 1) && (SDL_MINOR_VERSION == 2)) && !((SDL_MAJOR_VERSION == 2) && (SDL_MINOR_VERSION == 0))
#error "Only SDL 1.2 and 2.0 supported"
#endif
;
}
])],AC_MSG_RESULT([yes]),[
 AC_MSG_RESULT([no]) 
 AC_MSG_ERROR([Only libSDL 1.2.x or 2.0.x supported])])
 ])

dnl Checks for header files.

dnl Checks for typedefs, structures, and compiler characteristics.
AC_C_CONST
AC_C_INLINE
AC_TYPE_SIZE_T
AC_STRUCT_TM
AC_CHECK_SIZEOF(unsigned char)
AC_CHECK_SIZEOF(unsigned short)
AC_CHECK_SIZEOF(unsigned int)
AC_CHECK_SIZEOF(unsigned long)
AC_CHECK_SIZEOF(unsigned long long)
AC_CHECK_SIZEOF(int *)

dnl some semi complex check for sys/socket so it works on darwin as well
AC_CHECK_HEADERS([stdlib.h sys/types.h])
AC_CHECK_HEADERS([sys/socket.h  netinet/in.h pwd.h], [], [],
[#include <stdio.h>
#ifdef STDC_HEADERS
# include <stdlib.h>
# include <stddef.h>
#else
# ifdef HAVE_STDLIB_H
#  include <stdlib.h>
# endif
#endif
#ifdef HAVE_SYS_TYPES_H
# include <sys/types.h>
#endif
])

dnl check for the socklen_t (darwin doesn't always have it)
AC_COMPILE_IFELSE([AC_LANG_SOURCE([
#include <stdio.h>
#ifdef STDC_HEADERS
# include <stdlib.h>
# include <stddef.h>
#else
# ifdef HAVE_STDLIB_H
#  include <stdlib.h>
# endif
#endif
#ifdef HAVE_SYS_TYPES_H
# include <sys/types.h>
#endif
#ifdef HAVE_SYS_SOCKET_H
#include <sys/socket.h>
#endif
])],[],[AC_DEFINE([socklen_t],[int],[Define to `int` if you don't have socklen_t])])

AC_MSG_CHECKING(if environ can be included)
AC_LINK_IFELSE([AC_LANG_PROGRAM([[
#include <unistd.h>
#include <stdlib.h>]],[[*environ;]])],
[AC_MSG_RESULT(yes);AC_DEFINE(ENVIRON_INCLUDED,1,[environ can be included])],AC_MSG_RESULT(no))

AC_MSG_CHECKING(if environ can be linked)
AC_LINK_IFELSE([AC_LANG_PROGRAM([[extern char ** environ;]],[[*environ;]])],
[AC_MSG_RESULT(yes);AC_DEFINE(ENVIRON_LINKED,1,[environ can be linked])],AC_MSG_RESULT(no))

AC_MSG_CHECKING([if dirent includes d_type])
AC_COMPILE_IFELSE([AC_LANG_SOURCE([
#include <sys/types.h>
#include <dirent.h>
void blah(){
struct dirent d_test;
d_test.d_type = 0;
}])],[AC_MSG_RESULT(yes);AC_DEFINE(DIRENT_HAS_D_TYPE,1,[struct dirent has d_type])],AC_MSG_RESULT(no))


dnl Check for powf
AC_MSG_CHECKING(for powf in libm);
LIBS_BACKUP=$LIBS;
LIBS="$LIBS -lm";
AC_LINK_IFELSE([AC_LANG_PROGRAM([[#include <math.h>]],[[
        powf(1.0f, 1.0f);
]])], [AC_MSG_RESULT(yes)], [AC_DEFINE([DB_HAVE_NO_POWF],[1],[libm doesn't include powf])])
LIBS=$LIBS_BACKUP

dnl Look for clock_gettime, a DB_HAVE_CLOCK_GETTIME is set when present
AH_TEMPLATE([DB_HAVE_CLOCK_GETTIME],[Determines if the function clock_gettime is available.])
AC_SEARCH_LIBS([clock_gettime], [rt] , [found_clock_gettime=yes], [found_clock_gettime=no])
if test x$found_clock_gettime = xyes; then
  AC_DEFINE(DB_HAVE_CLOCK_GETTIME)
fi

dnl Checks for libraries.

#Check if the compiler support attributes
AH_TEMPLATE([C_HAS_ATTRIBUTE],[Determines if the compilers supports attributes for structures.])
AC_MSG_CHECKING(if compiler allows __attribute__)
AC_COMPILE_IFELSE([AC_LANG_PROGRAM([[
typedef struct { } __attribute__((packed)) junk;]],
[[ ]])],[ AC_MSG_RESULT(yes);AC_DEFINE(C_HAS_ATTRIBUTE)],AC_MSG_RESULT(no))


#Check if the compiler supports certain attributes
OLDCFLAGS="$CFLAGS"
CFLAGS="-Werror"

AH_TEMPLATE([C_ATTRIBUTE_ALWAYS_INLINE],[Determines if the compilers supports always_inline attribute.])
AC_MSG_CHECKING(if compiler allows __attribute__((always_inline)) )
AC_COMPILE_IFELSE([AC_LANG_SOURCE([ inline void __attribute__((always_inline)) test(){}
])],[ AC_MSG_RESULT(yes);AC_DEFINE(C_ATTRIBUTE_ALWAYS_INLINE)],AC_MSG_RESULT(no))

AH_TEMPLATE([C_ATTRIBUTE_FASTCALL],[Determines if the compilers supports fastcall attribute.])
AC_MSG_CHECKING(if compiler allows __attribute__((fastcall)) )
AC_COMPILE_IFELSE([AC_LANG_SOURCE([ void __attribute__((fastcall)) test(){}
])],[ AC_MSG_RESULT(yes);AC_DEFINE(C_ATTRIBUTE_FASTCALL)],AC_MSG_RESULT(no))


CFLAGS="$OLDCFLAGS"


#Check if the compiler supports __builtin_expect
#Switch language to c++
AC_LANG_PUSH(C++)
AH_TEMPLATE([C_HAS_BUILTIN_EXPECT],[Determines if the compilers supports __builtin_expect for branch prediction.])
AC_MSG_CHECKING(if compiler allows __builtin_expect)
AC_COMPILE_IFELSE([AC_LANG_PROGRAM([[]],[[
int x=10;if( __builtin_expect ((x==1),0) ) ;
]])], [ AC_MSG_RESULT(yes);AC_DEFINE(C_HAS_BUILTIN_EXPECT)],AC_MSG_RESULT(no))
#switch language back
AC_LANG_POP(C++)

# Host compiler may support this, but Emscripten does not.
AS_IF([test "x$enable_emscripten" != "xyes"],[
dnl test if compiler supports -mno-ms-bitfields as it is bugged 
# https://gcc.gnu.org/bugzilla/show_bug.cgi?id=52991
BACKUP_CFLAGS="$CFLAGS"
CFLAGS="-mno-ms-bitfields"
AC_MSG_CHECKING(if compiler supports -mno-ms-bitfields)
AC_COMPILE_IFELSE([AC_LANG_SOURCE([
void blah(){
;
}
])],[
AC_MSG_RESULT([yes])
CXXFLAGS="$CXXFLAGS -mno-ms-bitfields"
],[AC_MSG_RESULT([no])])
CFLAGS="$BACKUP_CFLAGS"
])

dnl enable disable alsa and pass it's cflags to CXXFLAGS
AC_ARG_ENABLE(alsa-midi,
AC_HELP_STRING([--enable-alsa-midi],[compile with alsa midi support (default yes)]),
[ case "${enableval}" in
 yes) alsa_midi=true;;
 no)  alsa_midi=false;;
esac],
[alsa_midi=true])
if test x$alsa_midi = xtrue ; then 
  AM_PATH_ALSA(0.9.0, AC_DEFINE(HAVE_ALSA,1,[Define to 1 to use ALSA for MIDI]) , : )
  CXXFLAGS="$CXXFLAGS $ALSA_CFLAGS"
fi

#Check for big endian machine, should #define WORDS_BIGENDIAN if so
AC_C_BIGENDIAN

#Features to enable/disable
AH_TEMPLATE(C_DEBUG,[Define to 1 to enable internal debugger, requires libcurses])
AH_TEMPLATE(C_HEAVY_DEBUG,[Define to 1 to enable heavy debugging, also have to enable C_DEBUG])
AC_ARG_ENABLE(debug,AC_HELP_STRING([--enable-debug],[Enable debug mode]),[
   AC_CHECK_HEADER(curses.h,have_curses_h=yes,)
   AC_CHECK_LIB(curses, initscr, have_curses_lib=yes, , )
   AC_CHECK_LIB(ncurses, initscr, have_ncurses_lib=yes, , )
   AC_CHECK_LIB(pdcurses, initscr, have_pdcurses_lib=yes, , )

   if test x$enable_debug = xno; then
     AC_MSG_RESULT([Debugger not enabled])
   elif test x$have_curses_lib = xyes -a x$have_curses_h = xyes ; then
     LIBS="$LIBS -lcurses"
     AC_DEFINE(C_DEBUG,1)
     if test x$enable_debug = xheavy ; then 
       AC_DEFINE(C_HEAVY_DEBUG,1)
     fi
   elif test x$have_ncurses_lib = xyes -a x$have_curses_h = xyes ; then
     LIBS="$LIBS -lncurses"
     AC_DEFINE(C_DEBUG,1)
     if test x$enable_debug = xheavy ; then 
       AC_DEFINE(C_HEAVY_DEBUG,1)
     fi
   elif test x$have_pdcurses_lib = xyes -a x$have_curses_h = xyes ; then
     LIBS="$LIBS -lpdcurses"
     AC_DEFINE(C_DEBUG,1)
     if test x$enable_debug = xheavy ; then 
       AC_DEFINE(C_HEAVY_DEBUG,1)
     fi
   else 
     AC_MSG_ERROR([Can't find curses, which is required for debug mode])
   fi
],)

AH_TEMPLATE(C_CURSOUT,[Define to 1 to enable Curses text mode output, requires libncursesw])
AC_ARG_WITH(curses,
   [AC_HELP_STRING([--with-curses],[Use Curses for text mode output. For Emscripten, provide path to emcurses. Otherwise, ncursesw will be used automatically.])],
   [AS_IF([test "x$with_curses" = xno],
       [AC_MSG_RESULT([Curses text mode output not enabled])],
       [test "x$enable_debug" != xno -a "x$enable_debug" != x ],
       [AC_MSG_ERROR([Debug uses Curses and cannot be used with Curses text mode output])],
       [test "x$with_curses" = xyes],
       [AS_IF([test "x$enable_emscripten" = "xyes"],
           [AC_MSG_ERROR([For Emscripten, use --with-curses=/path/to/emcurses])],
           [AC_CHECK_HEADER([ncursesw/curses.h],[have_ncursesw_h=yes])
            AC_CHECK_LIB(ncursesw, initscr, [have_ncursesw_lib=yes])
            AS_IF([test "x$have_ncursesw_lib" = xyes -a "x$have_ncursesw_h" = xyes],
               [LIBS="$LIBS -lncursesw"
                AC_DEFINE(C_CURSOUT,1)],
               [AC_MSG_ERROR([Cannot find ncursesw for text mode output])])])],
       dnl This is for Emscripten. Argument is path to emcurses.
       [CXXFLAGS="$CXXFLAGS -Wno-warn-absolute-paths -I$with_curses"
        LIBS="$LIBS -L$with_curses/emscripten -lpdcurses --pre-js $with_curses/emscripten/termlib.js --shell-file $with_curses/emscripten/template.html"
        AC_DEFINE(C_CURSOUT,1)])],
   [with_curses=no])

AH_TEMPLATE(C_SDLGFX,[Define to 1 to enable SDL graphical output])
AC_ARG_ENABLE(sdlgfx,AC_HELP_STRING([--enable-sdlgfx],
                                    [Enable SDL graphical output]),[
    AS_IF([test "x$enable_sdlgfx" = xno],
          [AC_MSG_RESULT([SDL graphical output not enabled])],
          [enable_sdlgfx=yes])],[
    AS_IF([test "x$with_curses" = xno],
          [enable_sdlgfx=yes],
          [AC_MSG_RESULT([Disabling SDL graphical output by default because Curses output enabled.])
           enable_sdlgfx=no])])
AS_IF([test "x$enable_sdlgfx" = xyes],[AC_DEFINE(C_SDLGFX,1)])

AH_TEMPLATE(C_CORE_INLINE,[Define to 1 to use inlined memory functions in cpu core])
AC_ARG_ENABLE(core-inline,AC_HELP_STRING([--enable-core-inline],[Enable inlined memory handling in CPU Core]),[
  if test x$enable_core_inline = xyes ; then 
    AC_MSG_RESULT([enabling inlined memory handling in CPU Core])
    AC_DEFINE(C_CORE_INLINE,1)
  fi
],)


dnl The target cpu checks for dynamic cores
AH_TEMPLATE(C_TARGETCPU,[The type of cpu this target has])
AC_MSG_CHECKING(for target cpu type) 
case "$host_cpu" in
  x86_64 | amd64)
    AC_DEFINE(C_TARGETCPU,X86_64)
    AC_MSG_RESULT(x86-64 bit compatible)
    c_targetcpu="x86_64"
    c_unalignedmemory=yes
    ;;
  i?86)
    AC_DEFINE(C_TARGETCPU,X86)
    AC_MSG_RESULT(x86 compatible)
    c_targetcpu="x86"
    c_unalignedmemory=yes
    ;;
   powerpc*)
    AC_DEFINE(C_TARGETCPU,POWERPC)
    AC_MSG_RESULT(Power PC)
    c_targetcpu="powerpc"
    c_unalignedmemory=yes
    ;;
   m68k*)
    AC_DEFINE(C_TARGETCPU,M68K)
    AC_MSG_RESULT(Motorola 68000)
    c_targetcpu="m68k"
    c_unalignedmemory=yes
    ;;
   *)
    AC_DEFINE(C_TARGETCPU,UNKNOWN)
    AC_MSG_RESULT(unknown)
    c_unalignedmemory=no
    ;;
esac

AC_ARG_ENABLE(dynamic-core,AC_HELP_STRING([--disable-dynamic-core],[Disable all dynamic cores]),,enable_dynamic_core=yes)

AH_TEMPLATE(C_DYNAMIC_X86,[Define to 1 to use x86 dynamic cpu core])
AC_ARG_ENABLE(dynamic-x86,AC_HELP_STRING([--disable-dynamic-x86],[Disable x86 dynamic cpu core]),,enable_dynamic_x86=yes)
AC_MSG_CHECKING(whether x86 dynamic cpu core will be enabled) 
if test x$enable_dynamic_x86 = xno -o x$enable_dynamic_core = xno; then 
   AC_MSG_RESULT(no)
else
  if test x$c_targetcpu = xx86 ; then
      AC_DEFINE(C_DYNAMIC_X86,1)
      AC_MSG_RESULT(yes)
  else
      AC_MSG_RESULT(no)
  fi
fi

AH_TEMPLATE(C_DYNREC,[Define to 1 to use recompiling cpu core. Can not be used together with the dynamic-x86 core])
AC_ARG_ENABLE(dynrec,AC_HELP_STRING([--disable-dynrec],[Disable recompiling cpu core]),,enable_dynrec=yes)
AC_MSG_CHECKING(whether recompiling cpu core will be enabled) 
if test x$enable_dynrec = xno -o x$enable_dynamic_core = xno; then 
   AC_MSG_RESULT(no)
else
dnl x86 only enable it if dynamic-x86 is disabled.
  if test x$c_targetcpu = xx86 ; then
    if test x$enable_dynamic_x86 = xno ; then
        AC_DEFINE(C_DYNREC,1)
        AC_MSG_RESULT(yes)
    else
        AC_MSG_RESULT([no, using dynamic-x86])
    fi
  else 
    if test x$c_targetcpu = xx86_64 ; then
        AC_DEFINE(C_DYNREC,1)
        AC_MSG_RESULT(yes)
    else      
      AC_MSG_RESULT(no)
    fi
  fi
fi

AH_TEMPLATE(C_FPU,[Define to 1 to enable floating point emulation])
AC_ARG_ENABLE(fpu,AC_HELP_STRING([--disable-fpu],[Disable fpu support]),,enable_fpu=yes)
AC_MSG_CHECKING(whether fpu emulation will be enabled) 
if test x$enable_fpu = xyes ; then 
  AC_MSG_RESULT(yes)
  AC_DEFINE(C_FPU,1)
else 
  AC_MSG_RESULT(no)
fi 

AH_TEMPLATE(C_FPU_X86,[Define to 1 to use a x86/x64 assembly fpu core])
AC_ARG_ENABLE(fpu-x86,AC_HELP_STRING([--disable-fpu-x86],[Disable x86 assembly fpu core]),,enable_fpu_x86=yes)
AC_ARG_ENABLE(fpu-x64,AC_HELP_STRING([--disable-fpu-x64],[Disable x64 assembly fpu core]),,enable_fpu_x64=yes)
AC_MSG_CHECKING(whether the x86/x64 assembly fpu core will be enabled) 
if test x$enable_fpu_x86 = xno -o x$enable_fpu_x64 = xno; then 
   AC_MSG_RESULT(no)
else
  if test x$enable_fpu = xyes; then
    if test x$c_targetcpu = xx86 -o x$c_targetcpu = xx86_64; then
        AC_DEFINE(C_FPU_X86,1)
        AC_MSG_RESULT(yes)
    else
        AC_MSG_RESULT(no)
    fi
  else
      AC_MSG_RESULT(no)
  fi
fi

AH_TEMPLATE(C_UNALIGNED_MEMORY,[Define to 1 to use a unaligned memory access])
AC_ARG_ENABLE(unaligned_memory,AC_HELP_STRING([--disable-unaligned-memory],[Disable unaligned memory access]),,enable_unaligned_memory=yes)
AC_MSG_CHECKING(whether to enable unaligned memory access) 
if test x$enable_unaligned_memory = xyes -a x$c_unalignedmemory = xyes; then 
  AC_DEFINE(C_UNALIGNED_MEMORY,1)
  AC_MSG_RESULT(yes)
else
  AC_MSG_RESULT(no)
fi

AH_TEMPLATE(C_SSHOT,[Define to 1 to enable screenshots, requires libpng])
dnl With Emscripten, this can find the native PNG library, causing problems.
AS_IF([test "x$enable_emscripten" != "xyes"],[
AC_CHECK_HEADER(png.h,have_png_h=yes,)
AC_CHECK_LIB(png, png_get_io_ptr, have_png_lib=yes, ,-lz)
if test x$have_png_lib = xyes -a x$have_png_h = xyes ; then
  LIBS="$LIBS -lpng -lz"
  AC_DEFINE(C_SSHOT,1)
else
  AC_MSG_WARN([Can't find libpng, screenshot support disabled])
fi
])

AH_TEMPLATE(C_MODEM,[Define to 1 to enable internal modem support, requires SDL_net])
AH_TEMPLATE(C_IPX,[Define to 1 to enable IPX over Internet networking, requires SDL_net])
AC_CHECK_HEADER(SDL_net.h,have_sdl_net_h=yes,)

if test x$with_sdl2 = "xyes" ; then
  LIBSDL_HEADER="SDL2"
else
  LIBSDL_HEADER="SDL"
fi

if test x$host = xi386-pc-os2-emx ; then
  AC_MSG_CHECKING(for SDLNet_Init in ${LIBSDL_HEADER}_net);
  LIBS_BACKUP=$LIBS;
  LIBS="$LIBS -l${LIBSDL_HEADER}_Net";
  AC_LINK_IFELSE([AC_LANG_PROGRAM([[#include <SDL_Net.h>]],[[
	SDLNet_Init ();
  ]])], [AC_MSG_RESULT(yes); have_sdl_net_lib=yes], AC_MSG_RESULT(no))
  LIBS=$LIBS_BACKUP
else
AC_CHECK_LIB(${LIBSDL_HEADER}_net, SDLNet_Init, have_sdl_net_lib=yes, , )
fi
if test x$have_sdl_net_lib = xyes -a x$have_sdl_net_h = xyes ; then
   LIBS="$LIBS -l${LIBSDL_HEADER}_net"
   AC_DEFINE(C_MODEM,1)
   AC_DEFINE(C_IPX,1)
else 
   AC_MSG_WARN([Can't find ${LIBSDL_HEADER}_net, internal modem and ipx disabled])
fi

AH_TEMPLATE(C_X11_XKB,[define to 1 if you have XKBlib.h and X11 lib])
dnl Emscripten has X11 headers now, but DOSBox should only use SDL.
AS_IF([test "x$enable_emscripten" != "xyes"],[
AC_CHECK_LIB(X11, main, have_x11_lib=yes, have_x11_lib=no, )
AC_CHECK_HEADER(X11/XKBlib.h, have_x11_h=yes, have_x11_h=no, )
AC_MSG_CHECKING(for XKBlib support)
if test x$have_x11_lib = xyes -a x$have_x11_h = xyes ; then
   LIBS="$LIBS -lX11"
   AC_DEFINE(C_X11_XKB,1)
   AC_MSG_RESULT(yes)
else
   AC_MSG_RESULT(no)
fi
])

AH_TEMPLATE(C_OPENGL,[Define to 1 to use opengl display output support])
dnl OpenGL support cannot successfully compile yet with Emscripten.
AS_IF([test "x$enable_emscripten" != "xyes"],[
AC_CHECK_LIB(GL, main, have_gl_lib=yes, have_gl_lib=no , )
AC_CHECK_LIB(opengl32, main, have_opengl32_lib=yes,have_opengl32_lib=no , )
AC_CHECK_HEADER(GL/gl.h, have_gl_h=yes , have_gl_h=no , )
AC_ARG_ENABLE(opengl,AC_HELP_STRING([--disable-opengl],[Disable opengl support]),,enable_opengl=yes)
AC_MSG_CHECKING(whether opengl display output will be enabled) 
if test x$enable_opengl = xyes; then
case "$host" in
    *-*-darwin*)
       AC_MSG_RESULT(yes)
       LIBS="$LIBS -framework OpenGL"
       AC_DEFINE(C_OPENGL,1)
       ;;
    *)
       if test x$have_gl_h = xyes -a x$have_gl_lib = xyes ; then 
         AC_MSG_RESULT(yes)
         LIBS="$LIBS -lGL"
         AC_DEFINE(C_OPENGL,1)
       elif test x$have_gl_h = xyes -a x$have_opengl32_lib = xyes ; then 
         AC_MSG_RESULT(yes)
         LIBS="$LIBS -lopengl32"
         AC_DEFINE(C_OPENGL,1)
       else
         AC_MSG_RESULT(no)
       fi
       ;;
esac
fi
])

AH_TEMPLATE(C_SDL_SOUND,[Define to 1 to enable SDL_sound support])
AC_CHECK_HEADER(SDL_sound.h,have_SDL_sound_h=yes,)
AC_CHECK_LIB(SDL_sound, Sound_Init, have_SDL_sound_init=yes,,)
AC_CHECK_LIB(SDL_sound, Sound_Seek, have_SDL_sound_seek=yes,,)
if test x$have_SDL_sound_h = xyes -a x$have_SDL_sound_init = xyes ; then
  if test x$have_SDL_sound_seek = xyes ; then
    LIBS="-lSDL_sound $LIBS"
    AC_DEFINE(C_SDL_SOUND,1)
   else 
     AC_MSG_WARN([Can't find SoundSeek in libSDL_Sound, libSDL_sound support disabled])
   fi
else
  AC_MSG_WARN([Can't find libSDL_sound, libSDL_sound support disabled])
fi

dnl Check for mprotect. Needed for 64 bits linux 
AH_TEMPLATE(C_HAVE_MPROTECT,[Define to 1 if you have the mprotect function])
AC_CHECK_HEADER([sys/mman.h], [
AC_CHECK_FUNC([mprotect],[AC_DEFINE(C_HAVE_MPROTECT,1)])
])

dnl Setpriority
AH_TEMPLATE(C_SET_PRIORITY,[Define to 1 if you have setpriority support])
AC_MSG_CHECKING(for setpriority support)
AC_LINK_IFELSE([AC_LANG_SOURCE([
#include <sys/resource.h>
int main(int argc,char * argv[]) {
	return setpriority (PRIO_PROCESS, 0,PRIO_MIN+PRIO_MAX);
};
])],AC_MSG_RESULT(yes);AC_DEFINE(C_SET_PRIORITY,1),AC_MSG_RESULT(no))


dnl Some target detection and actions for them
case "$host" in
    *-*-cygwin* | *-*-mingw32*)
       LIBS="$LIBS -lwinmm"
       AC_CHECK_HEADERS(ddraw.h)
       AC_DEFINE(C_DIRECTSERIAL, 1, [ Define to 1 if you want serial passthrough support (Win32, Posix and OS/2 only).])
       if test x$have_sdl_net_lib = xyes -a x$have_sdl_net_h = xyes ; then
         LIBS="$LIBS -lws2_32"
       fi
       ;;
    *-*-darwin*)
       dnl We have a problem here: both Mac OS X and Darwin report 
       dnl the same signature "powerpc-apple-darwin*" - so we have
       dnl to do more to distinguish them.
       dnl For now I am lazy and do not add proper detection code.
       AC_DEFINE(MACOSX, 1, [Compiling on Mac OS X])
       LIBS="$LIBS -framework CoreMIDI -framework AudioUnit -framework AudioToolbox -framework AppKit"
       AC_DEFINE(C_DIRECTSERIAL, 1, [ Define to 1 if you want serial passthrough support (Win32, Posix and OS/2).])
       ;;
    *-*-linux*)
       AC_DEFINE(LINUX, 1, [Compiling on GNU/Linux])
       AC_DEFINE(C_DIRECTSERIAL, 1, [ Define to 1 if you want serial passthrough support (Win32, Posix and OS/2).])
       ;;
    *-*-freebsd* | *-*-dragonfly* | *-*-netbsd* | *-*-openbsd*)
       dnl Disabled directserial for now. It doesn't do anything without
       dnl specifying an extra ifdef in directserial_posix.*
       dnl directserial detection should be rewritten to test for the needed
       dnl functions and headers. I currently do not know 
       dnl which ones are needed for BSD
       AC_DEFINE(BSD, 1, [Compiling on BSD])
       AC_DEFINE(C_DIRECTSERIAL, 1, [ Define to 1 if you want serial passthrough support (Win32, Posix and OS/2).])
       ;;
    *-*-os2-emx*)
       AC_DEFINE(OS2, 1, [Compiling on OS/2 EMX])
       AC_DEFINE(C_DIRECTSERIAL, 1, [ Define to 1 if you want serial passthrough support (Win32, Posix and OS/2).])
       ;;
esac

dnl Some stuff for the icon.
case "$host" in
    *-*-cygwin* | *-*-mingw32*)
       dnl Some stuff for the ico
       AC_CHECK_TOOL(WINDRES, windres, :)
    ;;
    *)
       WINDRES=":"
    ;;
esac
       AM_CONDITIONAL(HAVE_WINDRES, test "x$WINDRES" != "x:")
       AC_SUBST(WINDRES)


AH_TEMPLATE([EMTERPRETER_SYNC],[Compile for use with Emscripten emterpreter sync.])
AC_ARG_ENABLE(
  [sync],
  [AC_HELP_STRING([--disable-sync],
    [Do not use Emscripten emterpreter sync])],
  [], [enable_sync=yes])
AM_CONDITIONAL([EMTERPRETER], [test "x$enable_sync" != "xno"])

AC_ARG_ENABLE(
  [wasm],
  [AC_HELP_STRING([--enable-wasm],
    [Build to WebAssembly instead of asm.js])],
  [], [enable_wasm=no])
AM_CONDITIONAL([WEBASSEMBLY], [test "x$enable_wasm" == "xyes"])

# Use of Emscripten-specific compiler flags breaks tests compiled with the
# host compiler, so those flags are set at the end.
AS_IF([test "x$enable_emscripten" = "xyes"],[
  AS_IF([test "x$enable_sync" != "xno"], [AC_DEFINE([EMTERPRETER_SYNC],[1])])
  AS_IF([test "x$with_sdl2" != "xno"],[
    AS_IF([test "x$with_sdl2" = "xyes"],
      [CXXFLAGS="$CXXFLAGS -s USE_SDL=2"],
      [LIBS="$LIBS -L$with_sdl2/build/.libs/ -lSDL2"
       CXXFLAGS="$CXXFLAGS -Wno-warn-absolute-paths -I$with_sdl2/include"
    ])
  ])
])


AC_CONFIG_FILES([ 
Makefile
src/Makefile
src/cpu/Makefile
src/cpu/core_full/Makefile
src/cpu/core_normal/Makefile
src/cpu/core_dyn_x86/Makefile
src/cpu/core_dynrec/Makefile
src/debug/Makefile
src/dos/Makefile
src/fpu/Makefile
src/gui/Makefile
src/hardware/Makefile
src/hardware/serialport/Makefile
src/ints/Makefile
src/libs/Makefile
src/libs/zmbv/Makefile
src/libs/gui_tk/Makefile
src/misc/Makefile
src/shell/Makefile
src/platform/Makefile
src/platform/visualc/Makefile
visualc_net/Makefile
include/Makefile
docs/Makefile
])
AC_OUTPUT
