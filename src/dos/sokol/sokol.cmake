include_directories(
  "${CMAKE_CURRENT_LIST_DIR}/sokol"
  )

set(SOURCES_SOKOL_CXX11
  "${CMAKE_CURRENT_LIST_DIR}/protocol-sokol.cpp"
  )

set(SOURCES_SOKOL_CXX03
  )

set_source_files_properties(${SOURCES_SOKOL_CXX11} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++11")
set_source_files_properties(${SOURCES_SOKOL_CXX03} PROPERTIES COMPILE_FLAGS "${OPT_FLAGS} -std=c++03")

set(SOURCES_SERVER_SOKOL ${SOURCES_SERVER_JSDOS} ${SOURCES_LIBZIP})

add_executable(sokol ${SOURCES_SERVER_SOKOL} ${SOURCES_SOKOL_CXX11} ${SOURCES_SOKOL_CXX03})
target_link_libraries(sokol
  X11 z ncurses dl GL pthread asound
  )

if (X86_64)
  add_definitions(-DX86_64)
else()
  set_target_properties(sokol PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
endif()
