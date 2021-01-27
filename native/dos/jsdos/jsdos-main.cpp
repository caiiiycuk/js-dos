
//
// Created by caiiiycuk on 26.02.2020.
//

#include <config.h>
#include <control.h>
#include <jsdos-support.h>
#include <mapper.h>
#include <programs.h>
#include <protocol.h>
#include <video.h>
#include <mouse.h>
#include <cstdarg>

#include "timer.h"

#ifdef EMSCRIPTEN
#include <emscripten.h>
#include <emscripten/html5.h>
#else
#include <thread>
#include <mutex>

std::mutex eventsMutex;
#endif

struct KBDHash {
  template <typename T>
  std::size_t operator()(T t) const {
    return static_cast<std::size_t>(t);
  }
};

// TODO:
bool canUsePointerLock = false;
bool isPointerLocked() {
    return false;
}

Bit8u *surface = 0;
extern Bitu surfaceWidth = 0;
extern Bitu surfaceHeight = 0;
Bitu surfacePitch = 0;
bool surfaceUpdating = false;
float mouseX = 0.5f;
float mouseY = 0.5f;

Bitu GFX_GetBestMode(Bitu flags) {
    return GFX_CAN_32 | GFX_CAN_RANDOM;
}

Bitu GFX_SetSize(Bitu width, Bitu height, Bitu flags, double scalex, double scaley, GFX_CallBack_t callback) {
    if (surfaceWidth == width &&
        surfaceHeight == height) {
        return GFX_CAN_32 | GFX_CAN_RANDOM | GFX_HARDWARE;
    }

    if (surface != 0) {
        delete[]  surface;
    }
    surfaceWidth = width;
    surfaceHeight = height;
    surfacePitch = width * sizeof(uint32_t); // RGBA
    surface = new Bit8u[height * surfacePitch];
    client_frame_set_size(width, height);

    mouseX = 0.5f;
    mouseY = 0.5f;

    return GFX_CAN_32 | GFX_CAN_RANDOM | GFX_HARDWARE;
}

bool GFX_StartUpdate(Bit8u *&pixels, Bitu &pitch) {
    if (surfaceUpdating || surface == 0) {
        return false;
    }

    pixels = surface;
    pitch = surfacePitch;
    surfaceUpdating = true;
    return true;
}

void GFX_EndUpdate(const Bit16u *changedLines) {
    if (!surfaceUpdating) {
        return;
    }

    if (changedLines) {
        std::vector<uint32_t> lines;
        Bitu y = 0, index = 0;
        while (y < surfaceHeight) {
            if (!(index & 1)) {
                y += changedLines[index];
            } else {
                int count = changedLines[index];
                lines.push_back(y);
                lines.push_back(count);
                lines.push_back(y * surfacePitch);
                y += count;
            }
            index++;
        }
        client_frame_update_lines(lines.data(), lines.size() / 3, (uint32_t*) surface);
    }

    surfaceUpdating = false;
}

void GFX_ResetScreen(void) {
}

void GFX_SetPalette(Bitu start, Bitu count, GFX_PalEntry *entries) {
    abort();
}

Bitu GFX_GetRGB(Bit8u red, Bit8u green, Bit8u blue) {
    return red + (green << 8) + (blue << 16);
}


static void GUI_ShutDown(Section * /*sec*/) {
}

static void GUI_StartUp(Section *sec) {
    sec->AddDestroyFunction(&GUI_ShutDown);
}

void Config_Add_Gui() {
    Section_prop *sdl_sec = control->AddSection_prop("sdl", &GUI_StartUp);
    sdl_sec->AddInitFunction(&MAPPER_StartUp);

    Prop_bool *Pbool;
    Prop_string *Pstring;
    Prop_int *Pint;
    Prop_multival *Pmulti;

    Pbool = sdl_sec->Add_bool("fullscreen", Property::Changeable::Always, false);
    Pbool->Set_help("Start dosbox directly in fullscreen. (Press ALT-Enter to go back)");

    Pbool = sdl_sec->Add_bool("vsync", Property::Changeable::Always, false);
    Pbool->Set_help("Sync to Vblank IF supported by the output device and renderer (if relevant).\n"
                    "It can reduce screen flickering, but it can also result in a slow DOSBox.");

    Pstring = sdl_sec->Add_string("fullresolution", Property::Changeable::Always, "0x0");
    Pstring->Set_help("What resolution to use for fullscreen: original, desktop or a fixed size (e.g. 1024x768).\n"
                      "  Using your monitor's native resolution with aspect=true might give the best results.\n"
                      "  If you end up with small window on a large screen, try an output different from surface.");

    Pstring = sdl_sec->Add_string("windowresolution", Property::Changeable::Always, "original");
    Pstring->Set_help("Scale the window to this size IF the output device supports hardware scaling.\n"
                      "  (output=surface does not!)");

    const char *outputs[] = {
            "surface",
            "overlay",
            0};
    Pstring = sdl_sec->Add_string("output", Property::Changeable::Always, "surface");
    Pstring->Set_help("What video system to use for output.");
    Pstring->Set_values(outputs);


    Pbool = sdl_sec->Add_bool("autolock", Property::Changeable::Always, false);
    Pbool->Set_help("Mouse will automatically lock, if you click on the screen. (Press CTRL-F10 to unlock)");

    Pint = sdl_sec->Add_int("sensitivity", Property::Changeable::Always, 100);
    Pint->SetMinMax(1, 1000);
    Pint->Set_help("Mouse sensitivity.");

    Pbool = sdl_sec->Add_bool("waitonerror", Property::Changeable::Always, true);
    Pbool->Set_help("Wait before closing the console if dosbox has an error.");

    Pmulti = sdl_sec->Add_multi("priority", Property::Changeable::Always, ",");
    Pmulti->SetValue("higher,normal");
    Pmulti->Set_help(
            "Priority levels for dosbox. Second entry behind the comma is for when dosbox is not focused/minimized.\n"
            "  pause is only valid for the second entry.");

    const char *actt[] = {"lowest", "lower", "normal", "higher", "highest", "pause", 0};
    Pstring = Pmulti->GetSection()->Add_string("active", Property::Changeable::Always, "higher");
    Pstring->Set_values(actt);

    const char *inactt[] = {"lowest", "lower", "normal", "higher", "highest", "pause", 0};
    Pstring = Pmulti->GetSection()->Add_string("inactive", Property::Changeable::Always, "normal");
    Pstring->Set_values(inactt);

    Pstring = sdl_sec->Add_path("mapperfile",Property::Changeable::Always, "jsdos-mapper.json");
    Pstring->Set_help("File used to load/save the key/event mappings from. Resetmapper only works with the default value.");

    Pbool = sdl_sec->Add_bool("usescancodes", Property::Changeable::Always, true);
    Pbool->Set_help("Avoid usage of symkeys, might not work on all operating systems.");
}

void Config_Emscripten() {
#ifdef EMSCRIPTEN
    EM_ASM(
        // Don't copy canvas image back into RAM in SDL_LockSurface()
        Module['screenIsReadOnly'] = true;
        // set nearest neighbor scaling, for sharply upscaled pixels
        // var canvasStyle = Module['canvas'].style;
        // canvasStyle.imageRendering = "optimizeSpeed";
        // canvasStyle.imageRendering = "-moz-crisp-edges";
        // canvasStyle.imageRendering = "-o-crisp-edges";
        // canvasStyle.imageRendering = "-webkit-optimize-contrast";
        // canvasStyle.imageRendering = "optimize-contrast";
        // canvasStyle.imageRendering = "crisp-edges";
        // canvasStyle.imageRendering = "pixelated";
    );
    // register no-op callbacks for defered events
// TODO: @caiiiycuk
//    emscripten_set_mousedown_callback("#canvas", NULL, false, [](int eventType, const EmscriptenMouseEvent *mouseEvent, void *userData) {
//        if (canUsePointerLock && !isPointerLocked()) {
//            emscripten_request_pointerlock("#canvas", false);
//        }
//        return 0;
//    });
//    emscripten_set_pointerlockchange_callback("#document", NULL, false,
//        [](int eventType, const EmscriptenPointerlockChangeEvent *pointerlockChangeEvent, void *userData) -> EM_BOOL {
//            if (canUsePointerLock) {
//                GFX_CaptureMouse();
//                return true;
//            }
//            return false;
//        });
#endif
}

/* static variable to show wether there is not a valid stdout.
 * Fixes some bugs when -noconsole is used in a read only directory */
static bool no_stdout = false;
void GFX_ShowMsg(char const* format,...) {
    char buf[512];
    va_list msg;
    va_start(msg,format);
    vsprintf(buf,format,msg);
    strcat(buf,"\n");
    va_end(msg);
    if(!no_stdout) printf("%s",buf); //Else buf is parsed again.
}


int jsdos_main(Config *config) {
    // defined in control.h
    control = config;

    Config_Add_Gui();
    DOSBOX_Init();
    Config_Emscripten();

    /* Parse configuration files */
    std::string config_file, config_path;
    Cross::GetPlatformConfigDir(config_path);

    //First parse -userconf
    if (control->cmdline->FindExist("-userconf", true)) {
        config_file.clear();
        Cross::GetPlatformConfigDir(config_path);
        Cross::GetPlatformConfigName(config_file);
        config_path += config_file;
        control->ParseConfigFile(config_path.c_str());
        if (!control->configfiles.size()) {
            //Try to create the userlevel configfile.
            config_file.clear();
            Cross::CreatePlatformConfigDir(config_path);
            Cross::GetPlatformConfigName(config_file);
            config_path += config_file;
            if (control->PrintConfig(config_path.c_str())) {
                LOG_MSG("CONFIG: Generating default configuration.\nWriting it to %s", config_path.c_str());
                //Load them as well. Makes relative paths much easier
                control->ParseConfigFile(config_path.c_str());
            }
        }
    }

    //Second parse -conf switches
    while (control->cmdline->FindString("-conf", config_file, true)) {
        if (!control->ParseConfigFile(config_file.c_str())) {
            // try to load it from the user directory
            control->ParseConfigFile((config_path + config_file).c_str());
        }
    }
    // if none found => parse localdir conf
    if (!control->configfiles.size()) {
        printf("Parsing default config .jsdos/dosbox.conf\n");
        control->ParseConfigFile(".jsdos/dosbox.conf");
    }

    // if none found => parse userlevel conf
    if (!control->configfiles.size()) {
        config_file.clear();
        Cross::GetPlatformConfigName(config_file);
        control->ParseConfigFile((config_path + config_file).c_str());
    }

    if (!control->configfiles.size()) {
        //Try to create the userlevel configfile.
        config_file.clear();
        Cross::CreatePlatformConfigDir(config_path);
        Cross::GetPlatformConfigName(config_file);
        config_path += config_file;
        if (control->PrintConfig(config_path.c_str())) {
            LOG_MSG("CONFIG: Generating default configuration.\nWriting it to %s", config_path.c_str());
            //Load them as well. Makes relative paths much easier
            control->ParseConfigFile(config_path.c_str());
        } else {
            LOG_MSG("CONFIG: Using default settings. Create a configfile to change them");
        }
    }


#if (ENVIRON_LINKED)
    control->ParseEnv(environ);
#endif
//		UI_Init();
//		if (control->cmdline->FindExist("-startui")) UI_Run(false);
    /* Init all the sections */
    control->Init();
    /* Some extra SDL Functions */
    Section_prop *sdl_sec = static_cast<Section_prop *>(control->GetSection("sdl"));

//    @caiiiycuk: TODO
//    if (control->cmdline->FindExist("-fullscreen") || sdl_sec->Get_bool("fullscreen")) {
//        if(!sdl.desktop.fullscreen) { //only switch if not already in fullscreen
//            GFX_SwitchFullScreen();
//        }
//    }
//

    /* Init the keyMapper */
    MAPPER_Init();
    if (control->cmdline->FindExist("-startmapper")) MAPPER_RunInternal();

    /* Start up main machine */
    control->StartUp();
    /* Shutdown everything */

    return 0;
}

struct KeyEvent {
    KBD_KEYS key;
    bool pressed;
    uint64_t clientTime;
};

std::list<KeyEvent> keyEvents;
mstime executeNextKeyEventAt = 0;

void GFX_Events() {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(eventsMutex);
#endif
  if (keyEvents.empty()) {
      return;
    }

    auto frameTime = GetMsPassedFromStart();
    auto it = keyEvents.begin();
    while (executeNextKeyEventAt <= frameTime && it != keyEvents.end()) {
      auto key = it->key;
      auto pressed = it->pressed;
      auto clientTime = it->clientTime;

      KEYBOARD_AddKey(key, pressed);
      it = keyEvents.erase(it);
      if (it != keyEvents.end()) {
        executeNextKeyEventAt = frameTime + (it->clientTime - clientTime);
      }
    }
}


void server_add_key(KBD_KEYS key, bool pressed, uint64_t pressedMs) {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(eventsMutex);
#endif
    keyEvents.push_back({ key, pressed, pressedMs });
    if (keyEvents.size() == 1) {
      executeNextKeyEventAt = GetMsPassedFromStart();
    }
}

void server_mouse_moved(float x, float y, uint64_t movedMs) {
#ifndef EMSCRIPTEN
  std::lock_guard<std::mutex> g(eventsMutex);
#endif
  Mouse_CursorMoved((x - mouseX) * surfaceWidth,
                    (y - mouseY) * surfaceHeight,
                    x,
                    y,
                    false);

  mouseX = x;
  mouseY = y;
}

void server_mouse_button(int button, bool pressed, uint64_t pressedMs) {
#ifndef EMSCRIPTEN
  std::lock_guard<std::mutex> g(eventsMutex);
#endif
  if (pressed) {
    Mouse_ButtonPressed(button);
  } else {
    Mouse_ButtonReleased(button);
  }
}

void server_exit() {
    jsdos::requestExit();
}

int server_run() {
    CommandLine commandLine(0, 0);
    Config config(&commandLine);
    return jsdos_main(&config);
}
