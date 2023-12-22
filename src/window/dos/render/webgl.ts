import { CommandInterface } from "emulators";
import { resizeCanvas } from "./resize";

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;

const fsSource = `
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;


void main(void) {
  highp vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
}
`;

export function webGl(canvas: HTMLCanvasElement,
                      ci: CommandInterface,
                      forceAspect?: number) {
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        throw new Error("Unable to create webgl context on given canvas");
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    const textureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    const uSampler = gl.getUniformLocation(shaderProgram, "uSampler");

    initBuffers(gl, vertexPosition, textureCoord);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const pixel = new Uint8Array([0, 0, 0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE,
        pixel);

    gl.useProgram(shaderProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uSampler, 0);

    let frameWidth = 0;
    let frameHeight = 0;

    let requestAnimationFrameId: number | null = null;
    let frame: Uint8Array | null = null;
    let frameFormat: number = 0;

    const updateTexture = () => {
        if (frame !== null) {
            gl.texImage2D(gl.TEXTURE_2D, 0, frameFormat,
                frameWidth, frameHeight, 0, frameFormat, gl.UNSIGNED_BYTE,
                frame);
            frame = null;
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrameId = null;
    };

    const onResize = () => {
        resizeCanvas(canvas, frameWidth, frameHeight, forceAspect);
    };

    const onResizeFrame = (w: number, h: number) => {
        frameWidth = w;
        frameHeight = h;
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        frame = null;
        gl.viewport(0, 0, frameWidth, frameHeight);
        onResize();
    };

    ci.events().onFrameSize(onResizeFrame);
    ci.events().onFrame((rgb, rgba) => {
        frame = rgb != null ? rgb : rgba;
        frameFormat = rgb != null ? gl.RGB : gl.RGBA;
        if (requestAnimationFrameId === null) {
            requestAnimationFrameId = requestAnimationFrame(updateTexture);
        }
    });

    onResizeFrame(ci.width(), ci.height());

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas.parentElement!);
    window.addEventListener("resize", onResize);

    return () => {
        ci.events().onFrameSize(() => {});
        ci.events().onFrame(() => {});
        resizeObserver.disconnect();
        window.removeEventListener("resize", onResize);
    };
}

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram() as WebGLShader;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, shaderType: GLenum, source: string) {
    const shader = gl.createShader(shaderType) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: " + info);
    }

    return shader;
}

function initBuffers(gl: WebGLRenderingContext, vertexPosition: number, textureCoord: number) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);

    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoord);
}
