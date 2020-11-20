/*
 *  Copyright (C) 2002-2020  The DOSBox Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

#ifndef DOSBOX_KEYBOARD_H
#define DOSBOX_KEYBOARD_H

// Use more or less standardized GLFW keycodes

enum KBD_KEYS {
    KBD_NONE = 0,
    KBD_0 = 48,
    KBD_1 = 49,
    KBD_2 = 50,
    KBD_3 = 51,
    KBD_4 = 52,
    KBD_5 = 53,
    KBD_6 = 54,
    KBD_7 = 55,
    KBD_8 = 56,
    KBD_9 = 57,
    KBD_a = 65,
    KBD_b = 66,
    KBD_c = 67,
    KBD_d = 68,
    KBD_e = 69,
    KBD_f = 70,
    KBD_g = 71,
    KBD_h = 72,
    KBD_i = 73,
    KBD_j = 74,
    KBD_k = 75,
    KBD_l = 76,
    KBD_m = 77,
    KBD_n = 78,
    KBD_o = 79,
    KBD_p = 80,
    KBD_q = 81,
    KBD_r = 82,
    KBD_s = 83,
    KBD_t = 84,
    KBD_u = 85,
    KBD_v = 86,
    KBD_w = 87,
    KBD_x = 88,
    KBD_y = 89,
    KBD_z = 90,
    KBD_f1 = 290,
    KBD_f2 = 291,
    KBD_f3 = 292,
    KBD_f4 = 293,
    KBD_f5 = 294,
    KBD_f6 = 295,
    KBD_f7 = 296,
    KBD_f8 = 297,
    KBD_f9 = 298,
    KBD_f10 = 299,
    KBD_f11 = 300,
    KBD_f12 = 301,

    /*Now the weirder keys */
    KBD_kp0 = 320,
    KBD_kp1 = 321,
    KBD_kp2 = 322,
    KBD_kp3 = 323,
    KBD_kp4 = 324,
    KBD_kp5 = 325,
    KBD_kp6 = 326,
    KBD_kp7 = 327,
    KBD_kp8 = 328,
    KBD_kp9 = 329,

    KBD_kpperiod = 330,
    KBD_kpdivide = 331,
    KBD_kpmultiply = 332,
    KBD_kpminus = 333,
    KBD_kpplus = 334,
    KBD_kpenter = 335,

    KBD_esc = 256,
    KBD_tab = 258,
    KBD_backspace = 259,
    KBD_enter = 257,
    KBD_space = 32,
    KBD_leftalt = 342,
    KBD_rightalt = 346,
    KBD_leftctrl = 341,
    KBD_rightctrl = 345,
    KBD_leftshift = 340,
    KBD_rightshift = 344,
    KBD_capslock = 280,
    KBD_scrolllock = 281,
    KBD_numlock = 282,
    KBD_grave = 96,
    KBD_minus = 45,
    KBD_equals = 61,
    KBD_backslash = 92,
    KBD_leftbracket = 91,
    KBD_rightbracket = 93,
    KBD_semicolon = 59,
    KBD_quote = 39,
    KBD_period = 46,
    KBD_comma = 44,
    KBD_slash = 47,
    KBD_printscreen = 283,
    KBD_pause = 284,
    KBD_insert = 260,
    KBD_home = 268,
    KBD_pageup = 266,
    KBD_delete = 261,
    KBD_end = 269,
    KBD_pagedown = 267,
    KBD_left = 263,
    KBD_up = 265,
    KBD_down = 264,
    KBD_right = 262,
    KBD_extra_lt_gt = 348, //???
};

void KEYBOARD_ClrBuffer(void);
void KEYBOARD_AddKey(KBD_KEYS keytype, bool pressed);

#endif
