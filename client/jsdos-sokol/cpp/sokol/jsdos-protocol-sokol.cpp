//
// Created by caiiiycuk on 27.02.2020.
//

#ifdef EMSCRIPTEN
#include <emscripten.h>
#include <emscripten/html5.h>
#endif

#include <jsdos-protocol.h>

#define SOKOL_NO_ENTRY
#define SOKOL_IMPL

#ifdef EMSCRIPTEN
#define SOKOL_GLES2
#else
#define SOKOL_GLCORE33
#endif

#include "sokol/sokol_app.h"
#include "sokol/sokol_gfx.h"
#include "sokol/sokol_audio.h"

#ifdef EMSCRIPTEN
#include "shaders.glsl100.h"

#define WINDOW_WIDTH 320
#define WINDOW_HEIGHT 200
#else
#include "shaders.glsl330.h"

#include <thread>
#include <mutex>
std::mutex mutex;

#define WINDOW_WIDTH 640
#define WINDOW_HEIGHT 400
#endif

int renderedFrame = 0;
int frameCount = 0;
int frameWidth = 0;
int frameHeight = 0;
uint32_t *frameRgba = 0;

extern "C" int EMSCRIPTEN_KEEPALIVE runRuntime();
extern "C" void EMSCRIPTEN_KEEPALIVE exitRuntime();

#include "jsdos-protocol-dr.h"
#include "jsdos-protocol-wc.h"
#include "jsdos-protocol-ws.h"

void(*on_client_frame_set_size)(int, int);
void(*on_client_frame_update_lines)(uint32_t *, uint32_t, void *);

void(*onSokolInit)(void);
void(*onSokolCleanup)(void);

enum MessagingType {
                    DIRECT = 1,
                    WORKER_CLIENT = 2,
                    WORKER = 3,
};

MessagingType initMessagingType() {
    MessagingType messagingType = DIRECT;

#ifdef EMSCRIPTEN
    messagingType =
        (MessagingType) EM_ASM_INT((
                                    return Module.messagingType || 3 /* WORKER */;
                                    ));
#endif
    return messagingType;
}

const MessagingType messagingType = initMessagingType();

static float vertices[] = {
    0.0f, 0.0f, 0.0f, 0.0f,
    1.0f, 0.0f, 1.0f, 0.0f,
    0.0f, 1.0f, 0.0f, 1.0f,
    1.0f, 1.0f, 1.0f, 1.0f
};

static float verticesFlipped[] = {
    0.0f, 0.0f, 0.0f, 1.0f,
    1.0f, 0.0f, 1.0f, 1.0f,
    0.0f, 1.0f, 0.0f, 0.0f,
    1.0f, 1.0f, 1.0f, 0.0f
};

class GfxState {
    public:
    int width;
    int height;
    sg_pass_action pass;
    sg_pipeline pipeline;
    sg_bindings bind;

    GfxState(int width, int height) : width(width), height(height),
                                      pass({}), pipeline({}), bind({}) {

        sg_buffer_desc bufferDescription = {};
        bufferDescription.size = sizeof(vertices);
        bufferDescription.content = sg_query_features().origin_top_left ? vertices : verticesFlipped;

        bind.vertex_buffers[0] = sg_make_buffer(&bufferDescription);

        sg_pipeline_desc pipelineDescription = {};
        pipelineDescription.shader = sg_make_shader(display_shader_desc());
        pipelineDescription.primitive_type = SG_PRIMITIVETYPE_TRIANGLE_STRIP;
        pipelineDescription.layout.attrs[0].format = SG_VERTEXFORMAT_FLOAT2;
        pipelineDescription.layout.attrs[1].format = SG_VERTEXFORMAT_FLOAT2;
        pipeline = sg_make_pipeline(&pipelineDescription);

        sg_image_desc imageDescription = {};
        imageDescription.width = width;
        imageDescription.height = height;
        imageDescription.pixel_format = SG_PIXELFORMAT_RGBA8;
        imageDescription.min_filter = SG_FILTER_LINEAR;
        imageDescription.mag_filter = SG_FILTER_LINEAR;
        imageDescription.wrap_u = SG_WRAP_CLAMP_TO_EDGE;
        imageDescription.wrap_v = SG_WRAP_CLAMP_TO_EDGE;
        imageDescription.usage = SG_USAGE_STREAM;
        bind.fs_images[0] = sg_make_image(&imageDescription);
    }

    ~GfxState() {
        sg_destroy_image(bind.fs_images[0]);
    }
};


extern "C" int EMSCRIPTEN_KEEPALIVE client_frame_width() {
    return frameWidth;
}

extern "C" int EMSCRIPTEN_KEEPALIVE client_frame_height() {
    return frameHeight;
}

extern "C" void* EMSCRIPTEN_KEEPALIVE client_frame_rgba() {
    return frameRgba;
}

GfxState *state = 0;

extern "C" void client_frame_set_size(int width, int height) {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(mutex);
#endif
    on_client_frame_set_size(width, height);
}


extern "C" void client_frame_update_lines(uint32_t *lines, uint32_t count, void *rgba) {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(mutex);
#endif
    on_client_frame_update_lines(lines, count, rgba);
}

extern "C" void client_sound_push(const float *samples, int num_samples) {
    if (messagingType == WORKER) {
        saudio_push(samples, num_samples);
    }
}


void sokolInit() {
    sg_desc gfxDescription = {};
    gfxDescription.buffer_pool_size = 4;
    gfxDescription.image_pool_size = 4;
    gfxDescription.shader_pool_size = 4;
    gfxDescription.pipeline_pool_size = 2;
    gfxDescription.context_pool_size = 1;
    gfxDescription.gl_force_gles2 = true;

    sg_setup(&gfxDescription);

    saudio_desc audioDescription = {};
    audioDescription.sample_rate = static_cast<int>(44100);
    audioDescription.num_channels = 1;

    saudio_setup(&audioDescription);
    assert(saudio_isvalid());

    onSokolInit();
}

void sokolFrame() {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(mutex);
#endif

    if (frameWidth == 0 || frameHeight == 0 || renderedFrame == frameCount) {
        return;
    }

    if (!state || state->width != frameWidth ||
        state->height != frameHeight) {
        delete state;

        state = new GfxState(frameWidth, frameHeight);
    }

    sg_image_content imageContent = {};
    imageContent.subimage[0][0] = {};
    imageContent.subimage[0][0].ptr = frameRgba;
    imageContent.subimage[0][0].size = (state->width) * (state->height) * (int) sizeof(uint32_t);

    sg_update_image(state->bind.fs_images[0], &imageContent);

    sg_begin_default_pass(&state->pass, state->width, state->height);
    sg_apply_pipeline(state->pipeline);
    sg_apply_bindings(&state->bind);
    sg_draw(0, 4, 1);
    sg_end_pass();
    sg_commit();

    renderedFrame = frameCount;
}

void sokolCleanup() {
    onSokolCleanup();
}

void keyEvent(const sapp_event *event) {
    server_add_key((KBD_KEYS) event->key_code, event->type == SAPP_EVENTTYPE_KEY_DOWN);
}

void client_run() {
    sapp_desc appDescription = {};
    appDescription.init_cb =
        []() {
            sokolInit();
        };

    appDescription.frame_cb =
        []() {
            sokolFrame();
        };

    appDescription.cleanup_cb =
        []() {
            sokolCleanup();
        };

    appDescription.event_cb =
        [](const sapp_event *event) {
            switch (event->type) {
            case SAPP_EVENTTYPE_KEY_DOWN:
            case SAPP_EVENTTYPE_KEY_UP:
                keyEvent(event);
                break;
            default:;
            }
        };

    appDescription.width = WINDOW_WIDTH;
    appDescription.height = WINDOW_HEIGHT;
    appDescription.ios_keyboard_resizes_canvas = false;
    appDescription.gl_force_gles2 = true;
    appDescription.html5_ask_leave_site = false;
    appDescription.html5_canvas_resize = true;
    appDescription.html5_enable_shutdown = true;

    _sapp_run(&appDescription);
}


extern "C" void EMSCRIPTEN_KEEPALIVE client_exit() {
    sapp_quit();
}

extern "C" int EMSCRIPTEN_KEEPALIVE runRuntime() {
    int argc = 0;
    char** argv = 0;

    switch (messagingType) {
        case WORKER: {
            printf("sokol started in WORKER mode\n");
            on_client_frame_set_size = ws_client_frame_set_size;
            on_client_frame_update_lines = ws_client_frame_update_lines;
            server_run(argc, argv);
            ws_exit_runtime();
            return 0;
        }

        case DIRECT: {
            printf("sokol started in DIRECT mode\n");
            onSokolInit = dr_sokolInit;
            onSokolCleanup = dr_sokolCleanup;
            on_client_frame_set_size = dr_client_frame_set_size;
            on_client_frame_update_lines = dr_client_frame_update_lines;

#ifdef EMSCRIPTEN
            client_run();
#else
            std::thread client(client_run);
#endif
            server_run(argc, argv);
#ifdef EMSCRIPTEN
            exitRuntime();
#else
            client.join();
            return 0;
#endif

        }

        case WORKER_CLIENT: {
            printf("sokol started in WORKER_CLIENT mode\n");
            onSokolInit = wc_sokolInit;
            onSokolCleanup = wc_sokolCleanup;
            on_client_frame_set_size = dr_client_frame_set_size;
            on_client_frame_update_lines = dr_client_frame_update_lines;

#ifdef EMSCRIPTEN
            client_run();
#else
            abort();
#endif
            return 0;
        }

        default: {
            printf("unknown messagingType %d\n", messagingType);
            abort();
        }
    }
}

extern "C" void EMSCRIPTEN_KEEPALIVE exitRuntime() {
#ifdef EMSCRIPTEN
    EM_ASM(({
                if (!Module.exit) {
                    var message = "ERR! exitRuntime called without request" +
                        ", asyncify state: " + Asyncify.state;
                    Module.err(message);
                    return;
                }
                Module.exit();
            }));

    emscripten_force_exit(0);
#endif
}

int main(int argc, char *argv[]) {
    if (messagingType == WORKER) {
        ws_init_runtime();
    }

#ifdef EMSCRIPTEN
    emscripten_exit_with_live_runtime();
#endif

    return 0;
}
