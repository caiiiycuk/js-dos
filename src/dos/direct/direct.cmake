if (${EMSCRIPTEN})
  set(DIRECT_LINK_FLAGS "")
endif ()

include_directories(
  )

set(SOURCES_DIRECT_CXX11
  "${CMAKE_CURRENT_LIST_DIR}/cpp/direct-protocol.cpp"
  "${CMAKE_CURRENT_LIST_DIR}/cpp/direct-debugger.cpp"
  )

set(SOURCES_DIRECT_CXX03
  )

set_source_files_properties(${SOURCES_DIRECT_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_DIRECT_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")

set(SOURCES_SERVER_DIRECT
  ${SOURCES_SERVER_JSDOS}
  ${SOURCES_LIBZIP}
  ${SOURCES_DIRECT_CXX11}
  ${SOURCES_DIRECT_CXX03}
  )

if (${EMSCRIPTEN})
  add_library(direct-server OBJECT ${SOURCES_SERVER_DIRECT})
  add_executable(wdirect $<TARGET_OBJECTS:direct-server>)
  set_target_properties(wdirect PROPERTIES SUFFIX .js)
  set_target_properties(wdirect PROPERTIES LINK_FLAGS "${DIRECT_LINK_FLAGS} -s WASM=1 -s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=[\"syncSleep\"]' -s ASYNCIFY_WHITELIST=@${CMAKE_CURRENT_LIST_DIR}/../../../native/dos/asyncify.txt -s EXPORT_NAME='WDIRECT'")
endif ()
