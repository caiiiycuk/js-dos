/* eslint-disable camelcase */

export const KBD_NONE = 0;
export const KBD_0 = 48;
export const KBD_1 = 49;
export const KBD_2 = 50;
export const KBD_3 = 51;
export const KBD_4 = 52;
export const KBD_5 = 53;
export const KBD_6 = 54;
export const KBD_7 = 55;
export const KBD_8 = 56;
export const KBD_9 = 57;
export const KBD_a = 65;
export const KBD_b = 66;
export const KBD_c = 67;
export const KBD_d = 68;
export const KBD_e = 69;
export const KBD_f = 70;
export const KBD_g = 71;
export const KBD_h = 72;
export const KBD_i = 73;
export const KBD_j = 74;
export const KBD_k = 75;
export const KBD_l = 76;
export const KBD_m = 77;
export const KBD_n = 78;
export const KBD_o = 79;
export const KBD_p = 80;
export const KBD_q = 81;
export const KBD_r = 82;
export const KBD_s = 83;
export const KBD_t = 84;
export const KBD_u = 85;
export const KBD_v = 86;
export const KBD_w = 87;
export const KBD_x = 88;
export const KBD_y = 89;
export const KBD_z = 90;
export const KBD_f1 = 290;
export const KBD_f2 = 291;
export const KBD_f3 = 292;
export const KBD_f4 = 293;
export const KBD_f5 = 294;
export const KBD_f6 = 295;
export const KBD_f7 = 296;
export const KBD_f8 = 297;
export const KBD_f9 = 298;
export const KBD_f10 = 299;
export const KBD_f11 = 300;
export const KBD_f12 = 301;

export const KBD_kp0 = 320;
export const KBD_kp1 = 321;
export const KBD_kp2 = 322;
export const KBD_kp3 = 323;
export const KBD_kp4 = 324;
export const KBD_kp5 = 325;
export const KBD_kp6 = 326;
export const KBD_kp7 = 327;
export const KBD_kp8 = 328;
export const KBD_kp9 = 329;

export const KBD_kpperiod = 330;
export const KBD_kpdivide = 331;
export const KBD_kpmultiply = 332;
export const KBD_kpminus = 333;
export const KBD_kpplus = 334;
export const KBD_kpenter = 335;

export const KBD_esc = 256;
export const KBD_tab = 258;
export const KBD_backspace = 259;
export const KBD_enter = 257;
export const KBD_space = 32;
export const KBD_leftalt = 342;
export const KBD_rightalt = 346;
export const KBD_leftctrl = 341;
export const KBD_rightctrl = 345;
export const KBD_leftshift = 340;
export const KBD_rightshift = 344;
export const KBD_capslock = 280;
export const KBD_scrolllock = 281;
export const KBD_numlock = 282;
export const KBD_grave = 96;
export const KBD_minus = 45;
export const KBD_equals = 61;
export const KBD_backslash = 92;
export const KBD_leftbracket = 91;
export const KBD_rightbracket = 93;
export const KBD_semicolon = 59;
export const KBD_quote = 39;
export const KBD_period = 46;
export const KBD_comma = 44;
export const KBD_slash = 47;
export const KBD_printscreen = 283;
export const KBD_pause = 284;
export const KBD_insert = 260;
export const KBD_home = 268;
export const KBD_pageup = 266;
export const KBD_delete = 261;
export const KBD_end = 269;
export const KBD_pagedown = 267;
export const KBD_left = 263;
export const KBD_up = 265;
export const KBD_down = 264;
export const KBD_right = 262;
export const KBD_extra_lt_gt = 348; // ???

export const domToKeyCodes: {[index: number]: number} = {
    8: KBD_backspace,
    9: KBD_tab,
    13: KBD_enter,
    16: KBD_leftshift,
    17: KBD_leftctrl,
    18: KBD_leftalt,
    19: KBD_pause,
    27: KBD_esc,
    32: KBD_space,
    33: KBD_pageup,
    34: KBD_pagedown,
    35: KBD_end,
    36: KBD_home,
    37: KBD_left,
    38: KBD_up,
    39: KBD_right,
    40: KBD_down,
    45: KBD_insert,
    46: KBD_delete,
    48: KBD_0,
    49: KBD_1,
    50: KBD_2,
    51: KBD_3,
    52: KBD_4,
    53: KBD_5,
    54: KBD_6,
    55: KBD_7,
    56: KBD_8,
    57: KBD_9,
    59: KBD_semicolon,
    64: KBD_equals,
    65: KBD_a,
    66: KBD_b,
    67: KBD_c,
    68: KBD_d,
    69: KBD_e,
    70: KBD_f,
    71: KBD_g,
    72: KBD_h,
    73: KBD_i,
    74: KBD_j,
    75: KBD_k,
    76: KBD_l,
    77: KBD_m,
    78: KBD_n,
    79: KBD_o,
    80: KBD_p,
    81: KBD_q,
    82: KBD_r,
    83: KBD_s,
    84: KBD_t,
    85: KBD_u,
    86: KBD_v,
    87: KBD_w,
    88: KBD_x,
    89: KBD_y,
    90: KBD_z,
    91: KBD_leftbracket,
    93: KBD_rightbracket,
    96: KBD_kp0,
    97: KBD_kp1,
    98: KBD_kp2,
    99: KBD_kp3,
    100: KBD_kp4,
    101: KBD_kp5,
    102: KBD_kp6,
    103: KBD_kp7,
    104: KBD_kp8,
    105: KBD_kp9,
    // 106: KBD_kpmultiply,
    // 107: KBD_kpadd,
    // 109: KBD_kpsubtract,
    // 110: KBD_kpdecimal,
    111: KBD_kpdivide,
    112: KBD_f1,
    113: KBD_f2,
    114: KBD_f3,
    115: KBD_f4,
    116: KBD_f5,
    117: KBD_f6,
    118: KBD_f7,
    119: KBD_f8,
    120: KBD_f9,
    121: KBD_f10,
    122: KBD_f11,
    123: KBD_f12,
    144: KBD_numlock,
    145: KBD_scrolllock,
    173: KBD_minus,
    186: KBD_semicolon,
    187: KBD_equals,
    188: KBD_comma,
    189: KBD_minus,
    190: KBD_period,
    191: KBD_slash,
    // 192: KBD_graveaccent,
    219: KBD_leftbracket,
    220: KBD_backslash,
    221: KBD_rightbracket,
    // 222: KBD_apostrophe,
    // 224: KBD_left_super,
};

export const namedKeyCodes: {[name: string]: number} = {
    "KBD_NONE": KBD_NONE,
    "KBD_0": KBD_0,
    "KBD_1": KBD_1,
    "KBD_2": KBD_2,
    "KBD_3": KBD_3,
    "KBD_4": KBD_4,
    "KBD_5": KBD_5,
    "KBD_6": KBD_6,
    "KBD_7": KBD_7,
    "KBD_8": KBD_8,
    "KBD_9": KBD_9,
    "KBD_a": KBD_a,
    "KBD_b": KBD_b,
    "KBD_c": KBD_c,
    "KBD_d": KBD_d,
    "KBD_e": KBD_e,
    "KBD_f": KBD_f,
    "KBD_g": KBD_g,
    "KBD_h": KBD_h,
    "KBD_i": KBD_i,
    "KBD_j": KBD_j,
    "KBD_k": KBD_k,
    "KBD_l": KBD_l,
    "KBD_m": KBD_m,
    "KBD_n": KBD_n,
    "KBD_o": KBD_o,
    "KBD_p": KBD_p,
    "KBD_q": KBD_q,
    "KBD_r": KBD_r,
    "KBD_s": KBD_s,
    "KBD_t": KBD_t,
    "KBD_u": KBD_u,
    "KBD_v": KBD_v,
    "KBD_w": KBD_w,
    "KBD_x": KBD_x,
    "KBD_y": KBD_y,
    "KBD_z": KBD_z,
    "KBD_f1": KBD_f1,
    "KBD_f2": KBD_f2,
    "KBD_f3": KBD_f3,
    "KBD_f4": KBD_f4,
    "KBD_f5": KBD_f5,
    "KBD_f6": KBD_f6,
    "KBD_f7": KBD_f7,
    "KBD_f8": KBD_f8,
    "KBD_f9": KBD_f9,
    "KBD_f10": KBD_f10,
    "KBD_f11": KBD_f11,
    "KBD_f12": KBD_f12,

    "KBD_kp0": KBD_kp0,
    "KBD_kp1": KBD_kp1,
    "KBD_kp2": KBD_kp2,
    "KBD_kp3": KBD_kp3,
    "KBD_kp4": KBD_kp4,
    "KBD_kp5": KBD_kp5,
    "KBD_kp6": KBD_kp6,
    "KBD_kp7": KBD_kp7,
    "KBD_kp8": KBD_kp8,
    "KBD_kp9": KBD_kp9,

    "KBD_kpperiod": KBD_kpperiod,
    "KBD_kpdivide": KBD_kpdivide,
    "KBD_kpmultiply": KBD_kpmultiply,
    "KBD_kpminus": KBD_kpminus,
    "KBD_kpplus": KBD_kpplus,
    "KBD_kpenter": KBD_kpenter,

    "KBD_esc": KBD_esc,
    "KBD_tab": KBD_tab,
    "KBD_backspace": KBD_backspace,
    "KBD_enter": KBD_enter,
    "KBD_space": KBD_space,
    "KBD_leftalt": KBD_leftalt,
    "KBD_rightalt": KBD_rightalt,
    "KBD_leftctrl": KBD_leftctrl,
    "KBD_rightctrl": KBD_rightctrl,
    "KBD_leftshift": KBD_leftshift,
    "KBD_rightshift": KBD_rightshift,
    "KBD_capslock": KBD_capslock,
    "KBD_scrolllock": KBD_scrolllock,
    "KBD_numlock": KBD_numlock,
    "KBD_grave": KBD_grave,
    "KBD_minus": KBD_minus,
    "KBD_equals": KBD_equals,
    "KBD_backslash": KBD_backslash,
    "KBD_leftbracket": KBD_leftbracket,
    "KBD_rightbracket": KBD_rightbracket,
    "KBD_semicolon": KBD_semicolon,
    "KBD_quote": KBD_quote,
    "KBD_period": KBD_period,
    "KBD_comma": KBD_comma,
    "KBD_slash": KBD_slash,
    "KBD_printscreen": KBD_printscreen,
    "KBD_pause": KBD_pause,
    "KBD_insert": KBD_insert,
    "KBD_home": KBD_home,
    "KBD_pageup": KBD_pageup,
    "KBD_delete": KBD_delete,
    "KBD_end": KBD_end,
    "KBD_pagedown": KBD_pagedown,
    "KBD_left": KBD_left,
    "KBD_up": KBD_up,
    "KBD_down": KBD_down,
    "KBD_right": KBD_right,
    "KBD_extra_lt_gt": KBD_extra_lt_gt,
};

export const keyCodesToDom: {[index: number]: number} = {};
for (const next of Object.keys(domToKeyCodes)) {
    const key = Number.parseInt(next, 10);
    keyCodesToDom[domToKeyCodes[key]] = key;
}

export function domToKeyCode(domCode: number) {
    return domToKeyCodes[domCode] || 0;
}
