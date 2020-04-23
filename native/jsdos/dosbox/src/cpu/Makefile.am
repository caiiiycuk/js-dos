SUBDIRS = core_full core_normal core_dyn_x86 core_dynrec
AM_CPPFLAGS = -I$(top_srcdir)/include

noinst_LIBRARIES = libcpu.a
libcpu_a_SOURCES = callback.cpp cpu.cpp flags.cpp modrm.cpp modrm.h core_full.cpp instructions.h	\
		   paging.cpp lazyflags.h core_normal.cpp core_simple.cpp core_prefetch.cpp \
		   core_dyn_x86.cpp core_dynrec.cpp

if FUNARRAY_CORE
PREPROCESSED_FILES = core_simple_fun.ii core_normal_fun.ii core_prefetch_fun.ii
FUN_INCLUDES = core_simple_fun.h core_normal_fun.h core_prefetch_fun.h

# This is a dummy library to get Automake to generate dependencies
noinst_LIBRARIES += libextfun.a
libextfun_a_SOURCES = core_normal.cpp core_simple.cpp core_prefetch.cpp
libextfun_a_CPPFLAGS = $(AM_CPPFLAGS) -DGET_X86_FUNCTIONS

# This actually generates preprocessed files,
# only using the library for dependencies.
# Emscripten -s options in CXXFLAGS cause problems and must be excluded.
CXXPP = $(CXX) $(DEFS) $(DEFAULT_INCLUDES) $(INCLUDES) \
        $(AM_CPPFLAGS) $(CPPFLAGS)
core_simple_fun.ii: libextfun.a
	$(CXXPP) -DGET_X86_FUNCTIONS -E core_simple.cpp > $@
core_normal_fun.ii: libextfun.a
	$(CXXPP) -DGET_X86_FUNCTIONS -E core_normal.cpp > $@
core_prefetch_fun.ii: libextfun.a
	$(CXXPP) -DGET_X86_FUNCTIONS -E core_prefetch.cpp > $@

# Convert preprocessed code to files that can be included to
# build actual CPU core
BUILT_SOURCES = $(FUN_INCLUDES)
CLEANFILES = $(PREPROCESSED_FILES) $(FUN_INCLUDES)
$(FUN_INCLUDES): extractfun.py $(PREPROCESSED_FILES)
	python extractfun.py || rm -f $(FUN_INCLUDES)
endif
