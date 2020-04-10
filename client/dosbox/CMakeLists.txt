project(dosbox)
cmake_minimum_required(VERSION 3.6)

set(OPT_FLAG "-Oz")
set(USE_SDL ON)

set(CMAKE_C_COMPILER "/usr/bin/clang")
set(CMAKE_CXX_COMPILER "/usr/bin/clang++")

include("${CMAKE_CURRENT_LIST_DIR}/../../server/server.cmake")

set(SOURCES ${SOURCES_CORE})

add_executable(dosbox ${SOURCES})
target_link_libraries(dosbox
        X11 z ncurses dl GL pthread asound
        SDL SDL_mixer
        )

set_target_properties(dosbox PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
