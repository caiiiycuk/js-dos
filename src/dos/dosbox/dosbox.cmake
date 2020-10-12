add_executable(dosbox ${SOURCES_SERVER_SDL})
target_link_libraries(dosbox
        X11 z ncurses dl GL pthread asound
        SDL SDL_mixer
        )

if (X86_64)
    add_definitions(-DX86_64)
else()
    set_target_properties(dosbox PROPERTIES COMPILE_FLAGS "-m32" LINK_FLAGS "-m32")
endif()
