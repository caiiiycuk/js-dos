if (${EMSCRIPTEN})
    set(SOKOL_LINK_FLAGS "")
endif ()

include_directories(
        "${CMAKE_CURRENT_LIST_DIR}/cpp/sokol"
)

set(SOURCES_SOKOL_CXX11
        "${CMAKE_CURRENT_LIST_DIR}/cpp/sokol/jsdos-protocol-sokol.cpp"
        "${CMAKE_CURRENT_LIST_DIR}/cpp/sokol/jsdos-protocol-js.cpp"
        )

set(SOURCES_SOKOL_CXX03
        #	"${CMAKE_CURRENT_LIST_DIR}/js-dos-cpp/js-dos-3rdparty.c"
        )

set_source_files_properties(${SOURCES_SOKOL_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_SOKOL_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")

set(SOURCES_SERVER_SOKOL ${SOURCES_SERVER_JSDOS} ${SOURCES_LIBZIP})

if (${EMSCRIPTEN})
    add_library(sokol-client OBJECT ${SOURCES_SOKOL_CXX11} ${SOURCES_SOKOL_CXX03})
    add_library(sokol-server OBJECT ${SOURCES_SERVER_SOKOL})
    target_compile_definitions(sokol-client PUBLIC -DASYNCIFY -Demscripten_sleep_with_yield=asyncify_sleep -Demscripten_sleep=asyncify_sleep)
    target_compile_definitions(sokol-server PUBLIC -DASYNCIFY -Demscripten_sleep_with_yield=asyncify_sleep -Demscripten_sleep=asyncify_sleep)

    add_executable(wsokol $<TARGET_OBJECTS:sokol-server> $<TARGET_OBJECTS:sokol-client>)
    set_target_properties(wsokol PROPERTIES SUFFIX .js)
    set_target_properties(wsokol PROPERTIES LINK_FLAGS "${SOKOL_LINK_FLAGS} -s WASM=1 -s ASYNCIFY -s 'ASYNCIFY_IMPORTS=[\"emscripten_sleep\",\"syncSleep\"]' -s ASYNCIFY_WHITELIST=@${CMAKE_CURRENT_LIST_DIR}/../../native/jsdos/asyncify.txt -s EXPORT_NAME='WSOKOL'")

    add_executable(wsokol-client $<TARGET_OBJECTS:sokol-client>)
    set_target_properties(wsokol-client PROPERTIES SUFFIX .js)
    set_target_properties(wsokol-client PROPERTIES LINK_FLAGS "${SOKOL_LINK_FLAGS} -s WASM=1 -s EXPORT_NAME='WSOKOL_CLIENT'")
else ()
    add_executable(sokol ${SOURCES_SERVER_SOKOL} ${SOURCES_SOKOL_CXX11} ${SOURCES_SOKOL_CXX03})
    target_link_libraries(sokol
            X11 z ncurses dl GL pthread asound
            )

    set_target_properties(sokol PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
endif ()
