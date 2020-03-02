//
// Created by caiiiycuk on 27.02.2020.
//

#include <js-dos-protocol.h>

#define SOKOL_NO_ENTRY
#define SOKOL_IMPL

#ifdef EMSCRIPTEN
#define SOKOL_GLES2
#else
#define SOKOL_GLCORE33
#endif

#include "sokol_app.h"
#include "sokol_gfx.h"
#include "sokol_audio.h"

#ifdef EMSCRIPTEN
#include "shaders.glsl100.h"
#else
#include "shaders.glsl330.h"
#endif

#ifndef EMSCRIPTEN
#include <mutex>
std::mutex mutex;
#endif

#define WINDOW_WIDTH 640
#define WINDOW_HEIGHT 400


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

int frameWidth = 0;
int frameHeight = 0;
uint32_t *frameRgba = 0;

GfxState *state = 0;

extern "C" void client_frame_set_size(int width, int height) {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(mutex);
#endif

    if (frameRgba) {
        delete[] frameRgba;
    }
    frameWidth = width;
    frameHeight = height;
    frameRgba = new uint32_t[width * height];
}

extern "C" void client_frame_open() {
}

extern "C" void client_frame_update_lines(int star, int count, uint32_t *rgba) {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(mutex);
#endif

    if (!frameRgba) {
        return;
    }

    memcpy(&frameRgba[star * frameWidth], rgba, sizeof(uint32_t) * count * frameWidth);
}

extern "C" void client_frame_close() {
}

extern "C" void client_sound_push(const float* samples, int num_samples) {
    saudio_push(samples, num_samples);
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
}

void sokolFrame() {
#ifndef EMSCRIPTEN
    std::lock_guard<std::mutex> g(mutex);
#endif

    if (frameWidth == 0 || frameHeight == 0) {
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
}

void sokolCleanup() {
    sg_shutdown();
}

void keyEvent(const sapp_event* event) {
    server_add_key((KBD_KEYS) event->key_code, event->type == SAPP_EVENTTYPE_KEY_DOWN);
}

extern "C" void client_run() {
    sapp_desc appDescription = {};
    appDescription.init_cb = []() {
                sokolInit();
            };
#ifndef EMSCRIPTEN
    appDescription.frame_cb = []() {
        sokolFrame();
    };
#endif
    appDescription.cleanup_cb = []() {
        sokolCleanup();
#ifndef EMSCRIPTEN
        std::terminate();
#endif
    };
    appDescription.event_cb = [](const sapp_event* event) {
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

    _sapp_run(&appDescription);
}
