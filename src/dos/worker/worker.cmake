if (${EMSCRIPTEN})
  set(WORKER_LINK_FLAGS "-g")
endif ()

include_directories(
  )

set(SOURCES_WORKER_CXX11
  "${CMAKE_CURRENT_LIST_DIR}/cpp/worker-protocol.cpp"
  )

set(SOURCES_WORKER_CXX03
  )

set_source_files_properties(${SOURCES_WORKER_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_WORKER_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")

set(SOURCES_SERVER_WORKER
  ${SOURCES_SERVER_JSDOS}
  ${SOURCES_LIBZIP}
  ${SOURCES_WORKER_CXX11}
  ${SOURCES_WORKER_CXX03}
  )

if (${EMSCRIPTEN})
  add_library(worker-server OBJECT ${SOURCES_SERVER_WORKER})
  target_compile_definitions(worker-server PUBLIC -DASYNCIFY -Demscripten_sleep_with_yield=asyncify_sleep -Demscripten_sleep=asyncify_sleep)

  add_executable(wworker $<TARGET_OBJECTS:worker-server>)
  set_target_properties(wworker PROPERTIES SUFFIX .js)
  set_target_properties(wworker PROPERTIES LINK_FLAGS "${WORKER_LINK_FLAGS} -s WASM=1 -s ASYNCIFY -s 'ASYNCIFY_IMPORTS=[\"emscripten_sleep\",\"syncSleep\"]' -s ASYNCIFY_WHITELIST=@${CMAKE_CURRENT_LIST_DIR}/../../../native/dos/asyncify.txt -s EXPORT_NAME='WWORKER'")
endif ()
