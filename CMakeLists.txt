project(js-dos)
cmake_minimum_required(VERSION 3.6)

set(OPT_FLAG "-Oz -fno-exceptions")

if(${EMSCRIPTEN})
	add_definitions(-DEMSCRIPTEN)
else()
	set(CMAKE_C_COMPILER "/usr/bin/clang")
	set(CMAKE_CXX_COMPILER "/usr/bin/clang++")
#	add_definitions(-DC_DEBUG=1 -DC_HEAVY_DEBUG=1)
endif()

include("${CMAKE_CURRENT_LIST_DIR}/libzip/libzip.cmake")
include("${CMAKE_CURRENT_LIST_DIR}/server/server.cmake")
include("${CMAKE_CURRENT_LIST_DIR}/client/jsdos-sokol/sokol.cmake")
include("${CMAKE_CURRENT_LIST_DIR}/client/dosbox/dosbox.cmake")
