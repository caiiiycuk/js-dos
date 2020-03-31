project(js-dos)
cmake_minimum_required(VERSION 3.6)

set(OPT_FLAG "-Oz")

if(${EMSCRIPTEN})
	set(USE_PORTS "-s USE_ZLIB=1")
	set(CMAKE_C_FLAGS "${OPT_FLAG} -w -Werror=return-type ${USE_PORTS}")
	set(CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} ${USE_PORTS}")
	set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} \
		${USE_PORTS} \
		${OPT_FLAG} \
		-s TOTAL_STACK=1MB \
		-s MALLOC=emmalloc \
		--emit-symbol-map \
		-s EXIT_RUNTIME=1 \
		-s ASSERTIONS=0 \
		-s SAFE_HEAP=0 \
		-s TOTAL_MEMORY=67108864 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s INVOKE_RUN=0 \
		-s MODULARIZE=1 \
		-s EXPORT_NAME='WSOKOL' \
		-s FORCE_FILESYSTEM=1 -lidbfs.js \
		-s EXTRA_EXPORTED_RUNTIME_METHODS=\"['getMemory', 'addRunDependency', 'removeRunDependency','FS', 'FS_createPath', 'FS_createPreloadedFile', \
			'FS_createDataFile', 'lengthBytesUTF8', 'stringToUTF8', 'UTF16ToString', 'UTF8ToString', 'callMain']\" \
		-s NO_EXIT_RUNTIME=1 \
		-s ERROR_ON_UNDEFINED_SYMBOLS=0")
	add_definitions(-DEMSCRIPTEN)
else()
	set(CMAKE_C_COMPILER "/usr/bin/clang")
	set(CMAKE_CXX_COMPILER "/usr/bin/clang++")
#	add_definitions(-DC_DEBUG=1 -DC_HEAVY_DEBUG=1)
endif()

include("${CMAKE_CURRENT_LIST_DIR}/../../server/server.cmake")
include("${CMAKE_CURRENT_LIST_DIR}/../../3rd-party/3rd-party.cmake")

include_directories(
	"${CMAKE_CURRENT_LIST_DIR}/cpp/sokol"
)

set(SOURCES_SOKOL_CXX11
	"${CMAKE_CURRENT_LIST_DIR}/cpp/sokol/jsdos-protocol-sokol.cpp"
	"${CMAKE_CURRENT_LIST_DIR}/cpp/sokol/jsdos-messaging.cpp"
)
set_source_files_properties(${SOURCES_SOKOL_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")

set(SOURCES_SOKOL_CXX03
#	"${CMAKE_CURRENT_LIST_DIR}/js-dos-cpp/js-dos-3rdparty.c"
)
set_source_files_properties(${SOURCES_SOKOL_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")

set(SOURCES ${SOURCES_SOKOL_CXX11} ${SOURCES_SOKOL_CXX03} ${SOURCES_CORE} ${SOURCES_3RDPARTY})

if(${EMSCRIPTEN})
	add_library(bin-asyncify OBJECT ${SOURCES})
  target_compile_definitions(bin-asyncify PUBLIC -DASYNCIFY -Demscripten_sleep_with_yield=asyncify_sleep -Demscripten_sleep=asyncify_sleep)
	add_executable(wsokol $<TARGET_OBJECTS:bin-asyncify>)
	set_target_properties(wsokol PROPERTIES SUFFIX .js)
	set_target_properties(wsokol PROPERTIES LINK_FLAGS "-s WASM=1 -s ASYNCIFY -s 'ASYNCIFY_IMPORTS=[\"emscripten_sleep\",\"syncSleep\"]' -s ASYNCIFY_WHITELIST=@${CMAKE_CURRENT_LIST_DIR}/../../server/asyncify.txt")
else()
	add_executable(bin ${SOURCES})
	target_link_libraries(bin
		X11  z ncurses dl GL  pthread asound
	  )

	set_target_properties(bin PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
endif()
