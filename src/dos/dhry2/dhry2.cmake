set(SOURCES_DHRY2_CXX11
  "${CMAKE_CURRENT_LIST_DIR}/dhry2.cpp"
  )

set(SOURCES_DHRY2_CXX03
  )

set_source_files_properties(${SOURCES_DHRY2_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_DHRY2_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")


add_executable(dhry2 ${SOURCES_SERVER_JSDOS} ${SOURCES_DHRY2_CXX11} ${SOURCES_DHRY2_CXX03})
add_custom_command(TARGET dhry2
        PRE_BUILD
        COMMAND cp "${CMAKE_CURRENT_LIST_DIR}/bin/dhry_2.exe" /tmp/dhry_2.exe && xxd -i /tmp/dhry_2.exe > "${CMAKE_CURRENT_LIST_DIR}/dhry_2_exe.h"
        COMMAND cp "${CMAKE_CURRENT_LIST_DIR}/bin/DOS4GW.EXE" /tmp/dos4gw.exe && xxd -i /tmp/dos4gw.exe > "${CMAKE_CURRENT_LIST_DIR}/dos4gw_exe.h"
        COMMAND cp "${CMAKE_CURRENT_LIST_DIR}/bin/dosbox.conf" /tmp/dosbox.conf && xxd -i /tmp/dosbox.conf > "${CMAKE_CURRENT_LIST_DIR}/dosbox_conf.h"
        COMMAND cp "${CMAKE_CURRENT_LIST_DIR}/bin/dhry2.html" "${CMAKE_BINARY_DIR}/dhry2.html"
        COMMAND cp "${CMAKE_CURRENT_LIST_DIR}/bin/dhry2_node.js" "${CMAKE_BINARY_DIR}/dhry2_node.js"
)

if (${EMSCRIPTEN})
  set_target_properties(dhry2 PROPERTIES SUFFIX .js)
  set_target_properties(dhry2 PROPERTIES LINK_FLAGS "-s WASM=1 -s ASYNCIFY=1 -s 'ASYNCIFY_IMPORTS=[\"syncSleep\"]' -s ASYNCIFY_WHITELIST=@${CMAKE_CURRENT_LIST_DIR}/../../../native/dos/asyncify.txt -s EXPORT_NAME='WDHRY2'")
else()
  if (X86_64)
    add_definitions(-DX86_64)
  else()
    set_target_properties(dhry2 PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
  endif()
endif ()
