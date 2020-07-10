// # jsdos config
// is a builder that create dosbox.conf for your

type DosConfigValue = string | number | boolean;

interface DosConfigOption {
    name: string,
    description: string,
    value: DosConfigValue,
    allowedValues: DosConfigValue[],
};

type DosCategoryOptions = { [name: string]: DosConfigOption };

interface DosConfigCategory {
    name: string,
    description: string,
    options: DosCategoryOptions,
}

export class OutputCategory implements DosConfigCategory {
    name = "sdl";
    description = "This section contains all of the low level system settings for how DOSBox interacts with your real hardware. You can define what resolutions are emulated, how DOSBox should treat errors or listen to your keyboard and mouse. You can often achieve a fair level of optimization by working with these setting, though for the most part leaving them at their default settings will create the best experience. These settings are passed on to the SDL Library which handles low level things like input and thread priority.";
    options = {
        autolock: {
            name: "autolock",
            description: "Mouse will automatically lock, if you click on the screen.",
            value: false,
            allowedValues: [true, false],
        }
    };
};

export class DosboxCategory implements DosConfigCategory {
    name = "dosbox";
    description = "The [dosbox] section contains various settings that do not pertain to any other section (e.g. setting the language used in DOSBox help texts, where to store screen captures, etc.)";
    options = {
        machine: {
            name: "machine",
            description: "The type of machine tries to emulate.",
            value: "svga_s3",
            allowedValues: ["hercules", "cga", "tandy", "pcjr", "ega", "vgaonly", "svga_s3", "svga_et3000", "svga_et4000", "svga_paradise", "vesa_nolfb", "vesa_oldvbe"],
        }
    };
}

export class CpuCategory implements DosConfigCategory {
    name = "cpu";
    description = "The CPU section controls how DOSBox tries to emulate the CPU, how fast the emulation should be, and to adjust it. DOSBox offers 4 different methods of CPU emulation.";
    options = {
        core: {
            name: "core",
            description: "CPU Core used in emulation. auto will switch to dynamic if available and appropriate.",
            value: "auto",
            allowedValues: ["auto", "normal", "simple"],
        },
        cputype: {
            name: "cputype",
            description: "CPU Type used in emulation. auto is the fastest choice.",
            value: "auto",
            allowedValues: ["auto", "386", "386_slow", "486_slow", "pentium_slow", "386_prefetch"]
        },
        cycles: {
            name: "cycles",
            description: `Amount of instructions DOSBox tries to emulate each millisecond. Setting this value too high results in sound dropouts and lags.
Cycles can be set in 3 ways:
'auto'          tries to guess what a game needs.
                It usually works, but can fail for certain games.
'fixed #number' will set a fixed amount of cycles. This is what you usually need if 'auto' fails.
                (Example: fixed 4000).
'max'           will allocate as much cycles as your computer is able to handle.
`,
            value: "auto",
            allowedValues: ["auto", "fixed", "max"],
        },
    };
}

export class MixerCategory implements DosConfigCategory {
    name = "mixer";
    description = "Here you can define the quality of emulated audio.";
    options = {
        rate: {
            name: "rate",
            description: "Frequency rate of sound",
            value: 22050,
            allowedValues: [],
        },
        nosound: {
            name: "nosound",
            description: "Enable silent mode, sound is still emulated though.",
            value: false,
            allowedValues: [true, false],
        },
    };
}

export class AutoexecCategory implements DosConfigCategory {
    name = "autoexec";
    description = "Lines in this section will be run at startup";
    options = {
        script: {
            name: "lines",
            description: "Use \\n to separate lines",
            value: "",
            allowedValues: [],
        },
    };
}

export interface DosConfig {
    output: OutputCategory,
    dosbox: DosboxCategory,
    cpu: CpuCategory,
    mixer: MixerCategory,
    autoexec: AutoexecCategory,
}

export function createDosConfig(): DosConfig {
    return {
        output: new OutputCategory(),
        dosbox: new DosboxCategory(),
        cpu: new CpuCategory(),
        mixer: new MixerCategory(),
        autoexec: new AutoexecCategory(),
    };
}

function validateCategory(category: DosConfigCategory, valid: DosConfigCategory): Promise<void> {
    const categoryName = valid.name === "sdl" ? "output" : valid.name;
    return new Promise<void>((resolve, reject) => {
        if (!category) {
            const name = valid.name;
            reject(new Error("Category '" + categoryName + "' is missed"));
            return;
        }

        if (category.name !== valid.name) {
            reject(new Error("Incorrect category name '" + category.name + "' should be '" +
                valid.name + "'"));
            return;
        }

        for (const key of Object.keys(category.options)) {
            const next = category.options[key];
            const validOption = valid.options[key];
            if (validOption === undefined) {
                reject(new Error("Unknown option '" + (next.name || key) + "' in '" + category.name + "'"));
                return;
            }

            if (validOption.allowedValues.length > 0) {
                const value = next.value;
                const allowedValue = validOption.allowedValues.find((v) => v === value);

                if (categoryName === "cpu" &&
                    next.name === "cycles" &&
                    (value + "").startsWith("fixed ")) {
                    const num = Number.parseInt((value as string).substr("fixed ".length), 10);
                    if (isNaN(num)) {
                        reject(new Error("Fixed value should conatain number"));
                        return;
                    }
                } else if (allowedValue === undefined) {
                    reject(new Error("Incorrect value '" + value + "' for '" + category.name +
                        "." + (next.name || key) + "' allowed is " + JSON.stringify(validOption.allowedValues)));
                    return;
                }
            }
        }

        for (const key of Object.keys(valid.options)) {
            if (!(key in category.options)) {
                reject(new Error("Option '" + key + "' is missed in '" + categoryName + "'"));
                return;
            }
        }

        resolve();
    });
}

async function validateConfig(config: DosConfig): Promise<any> {
    const valid = createDosConfig();
    for (const category of Object.keys(valid)) {
        await validateCategory((config as any)[category], (valid as any)[category]);
    }
}

async function normalizeCategory(category: DosConfigCategory, valid: DosConfigCategory) {
    if (category === undefined) {
        return;
    }

    for (const key of Object.keys(category.options || {})) {
        const option = category.options[key];
        if (typeof option === "string" ||
            typeof option === "number" ||
            Array.isArray(option)) {
            const validCategory = valid.options[key];
            if (!validCategory) {
                continue;
            }

            const value: any = option;
            category.options[key] = {...validCategory};
            category.options[key].value = value;
        }
    }
}

async function normalizeConfig(config: DosConfig) : Promise<any> {
    const valid = createDosConfig();
    for (const category of Object.keys(valid)) {
        await normalizeCategory((config as any)[category], (valid as any)[category]);
    }
}

export async function toDosboxConf(config: DosConfig): Promise<string> {
    await normalizeConfig(config);
    await validateConfig(config);

    const content =
        writeCategory(config.output) +
        writeOutputDefaults() +
        writeCategory(config.dosbox) +
        writeDosboxDefaults() +
        writeCategory(config.cpu) +
        writeCpuDefaults() +
        writeCategory(config.mixer) +
        writeMixerDefaults() +
        writeOtherDefaults() +
        writeAutoexec(config.autoexec);


    return Promise.resolve(content);
}

function writeCategory(section: DosConfigCategory): string {
    let body = "";

    body += `[${section.name}]\n`;
    for (const key of Object.keys(section.options).sort()) {
        const next = section.options[key];
        body += `${next.name}=${next.value}\n`
    }

    return body;
}

function writeAutoexec(section: AutoexecCategory): string {
    return `[autoexec]
echo off
mount c .
c:

type jsdos~1/readme.txt
echo on

${section.options.script.value}

# Generated using https://js-dos.com
# █▀▀▀▀▀█ █  ▄▄▄▀▀█ █▀▀▀▀▀█
# █ ███ █ ██▄ █ ▀ ▄ █ ███ █
# █ ▀▀▀ █ ▄██ ▀ ▀▀█ █ ▀▀▀ █
# ▀▀▀▀▀▀▀ ▀ █▄▀▄▀ █ ▀▀▀▀▀▀▀
# █▀▄▄█▀▀▄▄ ▀ ▀█▄▄▄▄ ▀▄█▀█▀
# █▀ ▀ ▀▀▄ █▀ ▄ ▄▀▀▀▄ █▀█▄
# ▄ ▄▄ █▀▀▄ ▄▀▄▀▀█  ▀▀▄▀▀█▀
#   ▄▀▀█▀▀ █▀█▀█▀▀▄ ▀██▀█▄
# ▀▀▀ ▀ ▀ █▄█ ▀█▄▄█▀▀▀█▀▀
# █▀▀▀▀▀█ ▄▄▄ ▄ ▄ █ ▀ █▄▄▄▄
# █ ███ █ ▀█▀▀▄▀▀▄████▀▀█▄█
# █ ▀▀▀ █ ▄▀▀█▀█▀▄ ▀▀▄▄█▄█
# ▀▀▀▀▀▀▀ ▀   ▀▀ ▀  ▀   ▀▀▀
`;
}

function writeOutputDefaults() {
    return `
fullscreen=false
fulldouble=false
fullresolution=original
windowresolution=original
output=surface
sensitivity=100
waitonerror=true
priority=higher,normal
mapperfile=mapper-jsdos.map
usescancodes=true
vsync=false
`;
}

function writeDosboxDefaults() {
    return `
language=
captures=capture
memsize=16
`;
}

function writeCpuDefaults() {
    return `
cycleup=10
cycledown=20
`;
}

function writeMixerDefaults() {
    return `
blocksize=1024
prebuffer=20
`;
}

function writeOtherDefaults() {
    return `
[render]
# frameskip: How many frames DOSBox skips before drawing one.
#    aspect: Do aspect correction, if your output method doesn't support scaling this can slow things down!.
#    scaler: Scaler used to enlarge/enhance low resolution modes.
#              If 'forced' is appended, then the scaler will be used even if the result might not be desired.
#            Possible values: none, normal2x, normal3x, advmame2x, advmame3x, advinterp2x, advinterp3x, hq2x, hq3x, 2xsai, super2xsai, supereagle, tv2x, tv3x, rgb2x, rgb3x, scan2x, scan3x.

frameskip=0
aspect=false
scaler=none

[midi]
#     mpu401: Type of MPU-401 to emulate.
#             Possible values: intelligent, uart, none.
# mididevice: Device that will receive the MIDI data from MPU-401.
#             Possible values: default, win32, alsa, oss, coreaudio, coremidi, none.
# midiconfig: Special configuration options for the device driver. This is usually the id of the device you want to use.
#               See the README/Manual for more details.

mpu401=intelligent
mididevice=default
midiconfig=

[sblaster]
#  sbtype: Type of Soundblaster to emulate. gb is Gameblaster.
#          Possible values: sb1, sb2, sbpro1, sbpro2, sb16, gb, none.
#  sbbase: The IO address of the soundblaster.
#          Possible values: 220, 240, 260, 280, 2a0, 2c0, 2e0, 300.
#     irq: The IRQ number of the soundblaster.
#          Possible values: 7, 5, 3, 9, 10, 11, 12.
#     dma: The DMA number of the soundblaster.
#          Possible values: 1, 5, 0, 3, 6, 7.
#    hdma: The High DMA number of the soundblaster.
#          Possible values: 1, 5, 0, 3, 6, 7.
# sbmixer: Allow the soundblaster mixer to modify the DOSBox mixer.
# oplmode: Type of OPL emulation. On 'auto' the mode is determined by sblaster type. All OPL modes are Adlib-compatible, except for 'cms'.
#          Possible values: auto, cms, opl2, dualopl2, opl3, none.
#  oplemu: Provider for the OPL emulation. compat might provide better quality (see oplrate as well).
#          Possible values: default, compat, fast.
# oplrate: Sample rate of OPL music emulation. Use 49716 for highest quality (set the mixer rate accordingly).
#          Possible values: 44100, 49716, 48000, 32000, 22050, 16000, 11025, 8000.

sbtype=sb16
sbbase=220
irq=7
dma=1
hdma=5
sbmixer=true
oplmode=auto
oplemu=default
oplrate=44100

[gus]
#      gus: Enable the Gravis Ultrasound emulation.
#  gusrate: Sample rate of Ultrasound emulation.
#           Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
#  gusbase: The IO base address of the Gravis Ultrasound.
#           Possible values: 240, 220, 260, 280, 2a0, 2c0, 2e0, 300.
#   gusirq: The IRQ number of the Gravis Ultrasound.
#           Possible values: 5, 3, 7, 9, 10, 11, 12.
#   gusdma: The DMA channel of the Gravis Ultrasound.
#           Possible values: 3, 0, 1, 5, 6, 7.
# ultradir: Path to Ultrasound directory. In this directory
#           there should be a MIDI directory that contains
#           the patch files for GUS playback. Patch sets used
#           with Timidity should work fine.

gus=false
gusrate=44100
gusbase=240
gusirq=5
gusdma=3
ultradir=C:\ULTRASND

[speaker]
# pcspeaker: Enable PC-Speaker emulation.
#    pcrate: Sample rate of the PC-Speaker sound generation.
#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
#     tandy: Enable Tandy Sound System emulation. For 'auto', emulation is present only if machine is set to 'tandy'.
#            Possible values: auto, on, off.
# tandyrate: Sample rate of the Tandy 3-Voice generation.
#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.
#    disney: Enable Disney Sound Source emulation. (Covox Voice Master and Speech Thing compatible).

pcspeaker=true
pcrate=44100
tandy=auto
tandyrate=44100
disney=true

[joystick]
# joysticktype: Type of joystick to emulate: auto (default), none,
#               2axis (supports two joysticks),
#               4axis (supports one joystick, first joystick used),
#               4axis_2 (supports one joystick, second joystick used),
#               fcs (Thrustmaster), ch (CH Flightstick).
#               none disables joystick emulation.
#               auto chooses emulation depending on real joystick(s).
#               (Remember to reset dosbox's mapperfile if you saved it earlier)
#               Possible values: auto, 2axis, 4axis, 4axis_2, fcs, ch, none.
#        timed: enable timed intervals for axis. Experiment with this option, if your joystick drifts (away).
#     autofire: continuously fires as long as you keep the button pressed.
#       swap34: swap the 3rd and the 4th axis. can be useful for certain joysticks.
#   buttonwrap: enable button wrapping at the number of emulated buttons.

joysticktype=auto
timed=true
autofire=false
swap34=false
buttonwrap=false

[serial]
# serial1: set type of device connected to com port.
#          Can be disabled, dummy, modem, nullmodem, directserial.
#          Additional parameters must be in the same line in the form of
#          parameter:value. Parameter for all types is irq (optional).
#          for directserial: realport (required), rxdelay (optional).
#                           (realport:COM1 realport:ttyS0).
#          for modem: listenport (optional).
#          for nullmodem: server, rxdelay, txdelay, telnet, usedtr,
#                         transparent, port, inhsocket (all optional).
#          Example: serial1=modem listenport:5000
#          Possible values: dummy, disabled, modem, nullmodem, directserial.
# serial2: see serial1
#          Possible values: dummy, disabled, modem, nullmodem, directserial.
# serial3: see serial1
#          Possible values: dummy, disabled, modem, nullmodem, directserial.
# serial4: see serial1
#          Possible values: dummy, disabled, modem, nullmodem, directserial.

serial1=dummy
serial2=dummy
serial3=disabled
serial4=disabled

[dos]
#            xms: Enable XMS support.
#            ems: Enable EMS support.
#            umb: Enable UMB support.
# keyboardlayout: Language code of the keyboard layout (or none).

xms=true
ems=true
umb=true
keyboardlayout=auto

[ipx]
# ipx: Enable ipx over UDP/IP emulation.

ipx=false
`;
}
