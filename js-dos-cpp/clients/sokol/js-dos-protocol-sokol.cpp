//
// Created by caiiiycuk on 27.02.2020.
//

#include <js-dos-protocol.h>

#define SOKOL_NO_ENTRY
#define SOKOL_IMPL
#define SOKOL_GLCORE33

#include "sokol_app.h"
#include "sokol_gfx.h"
#include "sokol_audio.h"

#include "shaders.glsl330.h"

#include <mutex>

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

    GfxState(int width, int height) : width(width), height(height) {
        sg_buffer_desc bufferDescription{
                .size = sizeof(vertices),
                .content = sg_query_features().origin_top_left ? vertices : verticesFlipped
        };
        bind.vertex_buffers[0] = sg_make_buffer(&bufferDescription);

        sg_pipeline_desc pipelineDescription{
                .shader = sg_make_shader(display_shader_desc()),
                .primitive_type = SG_PRIMITIVETYPE_TRIANGLE_STRIP
        };
        pipelineDescription.layout.attrs[0].format = SG_VERTEXFORMAT_FLOAT2;
        pipelineDescription.layout.attrs[1].format = SG_VERTEXFORMAT_FLOAT2;

        sg_image_desc imageDescription{
                .width = width,
                .height = height,
                .pixel_format = SG_PIXELFORMAT_RGBA8,
                .min_filter = SG_FILTER_LINEAR,
                .mag_filter = SG_FILTER_LINEAR,
                .wrap_u = SG_WRAP_CLAMP_TO_EDGE,
                .wrap_v = SG_WRAP_CLAMP_TO_EDGE
        };
        imageDescription.usage = SG_USAGE_STREAM;

        bind.fs_images[0] = sg_make_image(&imageDescription);
        pipeline = sg_make_pipeline(&pipelineDescription);
    }

    ~GfxState() {
        sg_destroy_image(bind.fs_images[0]);
    }
};

std::mutex mutex;
int frameWidth = 0;
int frameHeight = 0;
uint32_t *frameRgba = 0;

GfxState *state = 0;

extern "C" void client_frame_set_size(int width, int height) {
    std::lock_guard<std::mutex> g(mutex);
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
    std::lock_guard<std::mutex> g(mutex);
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
    sg_desc description{
            .buffer_pool_size = 4,
            .image_pool_size = 4,
            .shader_pool_size = 4,
            .pipeline_pool_size = 2,
            .context_pool_size = 1,
            .gl_force_gles2 = true,
    };
    sg_setup(&description);

    saudio_desc desc{
            .sample_rate = static_cast<int>(44100),
            .num_channels = 1,
    };
    saudio_setup(&desc);
    assert(saudio_isvalid());
}

void sokolFrame() {
    std::lock_guard<std::mutex> g(mutex);

    if (frameWidth == 0 || frameHeight == 0) {
        return;
    }

    if (!state || state->width != frameWidth ||
        state->height != frameHeight) {
        delete state;

        state = new GfxState(frameWidth, frameHeight);
    }

    sg_image_content imageContent;
    imageContent.subimage[0][0] = {
            .ptr = frameRgba,
            .size = (state->width) * (state->height) * (int) sizeof(uint32_t)
    };
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

extern "C" void client_run() {
    sapp_desc appDescription {
            .init_cb = []() {
                sokolInit();
            },
            .frame_cb = []() {
                sokolFrame();
            },
            .cleanup_cb = []() {
                sokolCleanup();
                std::terminate();
            },
//            .event_cb = __dbgui_event,
            .width = WINDOW_WIDTH,
            .height = WINDOW_HEIGHT,
            .gl_force_gles2 = true,
    };

    _sapp_run(&appDescription);
}
