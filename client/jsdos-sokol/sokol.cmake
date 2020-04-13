if (${EMSCRIPTEN})
    set(USE_PORTS "-s USE_ZLIB=1")
    set(CMAKE_C_FLAGS "${OPT_FLAG} -w -Werror=return-type ${USE_PORTS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} ${USE_PORTS}")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} \
		${USE_PORTS} \
		${OPT_FLAG} \
    -O1 -g \
		-s TOTAL_STACK=1MB \
		-s MALLOC=emmalloc \
		--emit-symbol-map \
		-s ASSERTIONS=0 \
		-s SAFE_HEAP=0 \
		-s TOTAL_MEMORY=67108864 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s EXIT_RUNTIME=1 \
		-s INVOKE_RUN=0 \
		-s MODULARIZE=1 \
		-s FORCE_FILESYSTEM=1 -lidbfs.js \
		-s EXTRA_EXPORTED_RUNTIME_METHODS=\"['getMemory', 'addRunDependency', 'removeRunDependency','FS', 'FS_createPath', 'FS_createPreloadedFile', \
			'FS_createDataFile', 'lengthBytesUTF8', 'stringToUTF8', 'UTF16ToString', 'UTF8ToString', 'callMain']\" \
		-s ERROR_ON_UNDEFINED_SYMBOLS=0")
endif ()

include("${CMAKE_CURRENT_LIST_DIR}/../../3rd-party/3rd-party.cmake")

include_directories(
        "${CMAKE_CURRENT_LIST_DIR}/cpp/sokol"
)

set(SOURCES_SOKOL_CXX11
        "${CMAKE_CURRENT_LIST_DIR}/cpp/sokol/jsdos-protocol-sokol.cpp"
        )

set(SOURCES_SOKOL_CXX03
        #	"${CMAKE_CURRENT_LIST_DIR}/js-dos-cpp/js-dos-3rdparty.c"
        )

set_source_files_properties(${SOURCES_SOKOL_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_SOKOL_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")

set(SOURCES_SERVER_SOKOL ${SOURCES_SERVER_JSDOS} ${SOURCES_3RDPARTY})

if (${EMSCRIPTEN})
    add_library(sokol-client OBJECT ${SOURCES_SOKOL_CXX11} ${SOURCES_SOKOL_CXX03})
    add_library(sokol-server OBJECT ${SOURCES_SERVER_SOKOL})
    target_compile_definitions(sokol-client PUBLIC -DASYNCIFY -Demscripten_sleep_with_yield=asyncify_sleep -Demscripten_sleep=asyncify_sleep)
    target_compile_definitions(sokol-server PUBLIC -DASYNCIFY -Demscripten_sleep_with_yield=asyncify_sleep -Demscripten_sleep=asyncify_sleep)
    add_executable(wsokol $<TARGET_OBJECTS:sokol-server> $<TARGET_OBJECTS:sokol-client>)

    set_target_properties(wsokol PROPERTIES SUFFIX .js)
    set_target_properties(wsokol PROPERTIES LINK_FLAGS "-s WASM=1 -s ASYNCIFY -s 'ASYNCIFY_IMPORTS=[\"emscripten_sleep\",\"syncSleep\"]' -s ASYNCIFY_WHITELIST=@${CMAKE_CURRENT_LIST_DIR}/../../server/asyncify.txt -s EXPORT_NAME='WSOKOL'")

    add_executable(wsokol-client $<TARGET_OBJECTS:sokol-client>)
    set_target_properties(wsokol-client PROPERTIES SUFFIX .js)
    set_target_properties(wsokol-client PROPERTIES LINK_FLAGS "-s WASM=1 -s EXPORT_NAME='WSOKOL_CLIENT'")
else ()
    add_executable(sokol ${SOURCES_SERVER_SOKOL} ${SOURCES_SOKOL_CXX11} ${SOURCES_SOKOL_CXX03})
    target_link_libraries(sokol
            X11 z ncurses dl GL pthread asound
            )

    set_target_properties(sokol PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
endif ()
