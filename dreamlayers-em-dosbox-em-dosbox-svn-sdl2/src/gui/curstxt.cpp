/*
 *  Copyright (C) 2002-2015  The DOSBox Team
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
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */

#include "config.h"

#ifdef C_CURSOUT
#define _XOPEN_SOURCE_EXTENDED
#include <stdlib.h>
#include <locale.h>
#ifdef EMSCRIPTEN
#define PDC_WIDE
#define NCURSES_COLOR_T short
#include <curses.h>
#else
#include <ncursesw/curses.h>
#endif
#include "dosbox.h"
#include "keyboard.h"

static chtype vga2unicode(unsigned char c) {
	/* Table from https://en.wikipedia.org/wiki/Code_page_437 */
	static const short vga2uni_tab[256] = {
		/* 00 */ 0x0020, 0x263A, 0x263B, 0x2665, 0x2666, 0x2663, 0x2660, 0x2022,
		/* 08 */ 0x25D8, 0x25CB, 0x25D9, 0x2642, 0x2640, 0x266A, 0x266B, 0x263C,
		/* 10 */ 0x25BA, 0x25C4, 0x2195, 0x203C, 0x00B6, 0x00A7, 0x25AC, 0x21A8,
		/* 18 */ 0x2191, 0x2193, 0x2192, 0x2190, 0x221F, 0x2194, 0x25B2, 0x25BC,
		/* 20 */ 0x0020, 0x0021, 0x0022, 0x0023, 0x0024, 0x0025, 0x0026, 0x0027,
		/* 28 */ 0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F,
		/* 30 */ 0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036, 0x0037,
		/* 38 */ 0x0038, 0x0039, 0x003A, 0x003B, 0x003C, 0x003D, 0x003E, 0x003F,
		/* 40 */ 0x0040, 0x0041, 0x0042, 0x0043, 0x0044, 0x0045, 0x0046, 0x0047,
		/* 48 */ 0x0048, 0x0049, 0x004A, 0x004B, 0x004C, 0x004D, 0x004E, 0x004F,
		/* 50 */ 0x0050, 0x0051, 0x0052, 0x0053, 0x0054, 0x0055, 0x0056, 0x0057,
		/* 58 */ 0x0058, 0x0059, 0x005A, 0x005B, 0x005C, 0x005D, 0x005E, 0x005F,
		/* 60 */ 0x0060, 0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067,
		/* 68 */ 0x0068, 0x0069, 0x006A, 0x006B, 0x006C, 0x006D, 0x006E, 0x006F,
		/* 70 */ 0x0070, 0x0071, 0x0072, 0x0073, 0x0074, 0x0075, 0x0076, 0x0077,
		/* 78 */ 0x0078, 0x0079, 0x007A, 0x007B, 0x007C, 0x007D, 0x007E, 0x2302,
		/* 80 */ 0x00C7, 0x00FC, 0x00E9, 0x00E2, 0x00E4, 0x00E0, 0x00E5, 0x00E7,
		/* 88 */ 0x00EA, 0x00EB, 0x00E8, 0x00EF, 0x00EE, 0x00EC, 0x00C4, 0x00C5,
		/* 90 */ 0x00C9, 0x00E6, 0x00C6, 0x00F4, 0x00F6, 0x00F2, 0x00FB, 0x00F9,
		/* 98 */ 0x00FF, 0x00D6, 0x00DC, 0x00A2, 0x00A3, 0x00A5, 0x20A7, 0x0192,
		/* A0 */ 0x00E1, 0x00ED, 0x00F3, 0x00FA, 0x00F1, 0x00D1, 0x00AA, 0x00BA,
		/* A8 */ 0x00BF, 0x2310, 0x00AC, 0x00BD, 0x00BC, 0x00A1, 0x00AB, 0x00BB,
		/* B0 */ 0x2591, 0x2592, 0x2593, 0x2502, 0x2524, 0x2561, 0x2562, 0x2556,
		/* B8 */ 0x2555, 0x2563, 0x2551, 0x2557, 0x255D, 0x255C, 0x255B, 0x2510,
		/* C0 */ 0x2514, 0x2534, 0x252C, 0x251C, 0x2500, 0x253C, 0x255E, 0x255F,
		/* C8 */ 0x255A, 0x2554, 0x2569, 0x2566, 0x2560, 0x2550, 0x256C, 0x2567,
		/* D0 */ 0x2568, 0x2564, 0x2565, 0x2559, 0x2558, 0x2552, 0x2553, 0x256B,
		/* D8 */ 0x256A, 0x2518, 0x250C, 0x2588, 0x2584, 0x258C, 0x2590, 0x2580,
		/* E0 */ 0x03B1, 0x00DF, 0x0393, 0x03C0, 0x03A3, 0x03C3, 0x00B5, 0x03C4,
		/* E8 */ 0x03A6, 0x0398, 0x03A9, 0x03B4, 0x221E, 0x03C6, 0x03B5, 0x2229,
		/* F0 */ 0x2261, 0x00B1, 0x2265, 0x2264, 0x2320, 0x2321, 0x00F7, 0x2248,
		/* F8 */ 0x00B0, 0x2219, 0x00B7, 0x221A, 0x207F, 0x00B2, 0x25A0, 0x00A0,
	};
	return vga2uni_tab[c];
}

#define CKMD_CTRL 1
#define CKMD_SHIFT 2
static const struct {
	KBD_KEYS key;
	Bit8u mod;
} txt_basekeys[128] = {
	{ KBD_NONE, 0 },
	{ KBD_a, CKMD_CTRL }, { KBD_b, CKMD_CTRL }, { KBD_c, CKMD_CTRL },
	{ KBD_d, CKMD_CTRL }, { KBD_e, CKMD_CTRL }, { KBD_f, CKMD_CTRL },
	{ KBD_g, CKMD_CTRL }, { KBD_h, CKMD_CTRL },
	{ KBD_tab, 0 }, /* { KBD_i, CKMD_CTRL }, */
	{ KBD_enter, 0 }, /* { KBD_j, CKMD_CTRL },  */
	{ KBD_k, CKMD_CTRL }, { KBD_l, CKMD_CTRL },
	{ KBD_m, CKMD_CTRL }, { KBD_n, CKMD_CTRL }, { KBD_o, CKMD_CTRL },
	{ KBD_p, CKMD_CTRL }, { KBD_q, CKMD_CTRL }, { KBD_r, CKMD_CTRL },
	{ KBD_s, CKMD_CTRL }, { KBD_t, CKMD_CTRL }, { KBD_u, CKMD_CTRL },
	{ KBD_v, CKMD_CTRL }, { KBD_w, CKMD_CTRL }, { KBD_x, CKMD_CTRL },
	{ KBD_y, CKMD_CTRL }, { KBD_z, CKMD_CTRL }, /* 0x1A = CTRL-Z */
	{ KBD_esc, 0 },
	{ KBD_NONE, 0 }, { KBD_NONE, 0 }, { KBD_NONE, 0 }, { KBD_NONE, 0 },
	{ KBD_space, 0 },
	{ KBD_1, CKMD_SHIFT }, { KBD_quote, CKMD_SHIFT }, { KBD_3, CKMD_SHIFT},
	{ KBD_4, CKMD_SHIFT }, { KBD_5, CKMD_SHIFT }, { KBD_7, CKMD_SHIFT },
	{ KBD_quote, 0 }, { KBD_9, CKMD_SHIFT }, { KBD_0, CKMD_SHIFT },
	{ KBD_8, CKMD_SHIFT }, { KBD_equals, CKMD_SHIFT }, { KBD_comma, 0 },
	{ KBD_minus, 0 }, { KBD_period, 0 }, { KBD_slash, 0 },
	{ KBD_0, 0 }, { KBD_1, 0 }, { KBD_2, 0 }, { KBD_3, 0 }, { KBD_4, 0 },
	{ KBD_5, 0 }, { KBD_6, 0 }, { KBD_7, 0 }, { KBD_8, 0 }, { KBD_9, 0 },
	{ KBD_semicolon, CKMD_SHIFT }, { KBD_semicolon, 0 },
	{ KBD_comma, CKMD_SHIFT }, { KBD_equals, 0 },
	{ KBD_period, CKMD_SHIFT }, { KBD_slash, CKMD_SHIFT },
	{ KBD_2, CKMD_SHIFT },
	{ KBD_a, CKMD_SHIFT }, { KBD_b, CKMD_SHIFT }, { KBD_c, CKMD_SHIFT },
	{ KBD_d, CKMD_SHIFT }, { KBD_e, CKMD_SHIFT }, { KBD_f, CKMD_SHIFT },
	{ KBD_g, CKMD_SHIFT }, { KBD_h, CKMD_SHIFT }, { KBD_i, CKMD_SHIFT },
	{ KBD_j, CKMD_SHIFT }, { KBD_k, CKMD_SHIFT }, { KBD_l, CKMD_SHIFT },
	{ KBD_m, CKMD_SHIFT }, { KBD_n, CKMD_SHIFT }, { KBD_o, CKMD_SHIFT },
	{ KBD_p, CKMD_SHIFT }, { KBD_q, CKMD_SHIFT }, { KBD_r, CKMD_SHIFT },
	{ KBD_s, CKMD_SHIFT }, { KBD_t, CKMD_SHIFT }, { KBD_u, CKMD_SHIFT },
	{ KBD_v, CKMD_SHIFT }, { KBD_w, CKMD_SHIFT }, { KBD_x, CKMD_SHIFT },
	{ KBD_y, CKMD_SHIFT }, { KBD_z, CKMD_SHIFT },
	{ KBD_leftbracket, 0 }, { KBD_backslash, 0 }, { KBD_rightbracket, 0 },
	{ KBD_6, CKMD_SHIFT }, { KBD_minus, CKMD_SHIFT }, { KBD_grave, 0 },
	{ KBD_a, 0 }, { KBD_b, 0 }, { KBD_c, 0 },
	{ KBD_d, 0 }, { KBD_e, 0 }, { KBD_f, 0 },
	{ KBD_g, 0 }, { KBD_h, 0 }, { KBD_i, 0 },
	{ KBD_j, 0 }, { KBD_k, 0 }, { KBD_l, 0 },
	{ KBD_m, 0 }, { KBD_n, 0 }, { KBD_o, 0 },
	{ KBD_p, 0 }, { KBD_q, 0 }, { KBD_r, 0 },
	{ KBD_s, 0 }, { KBD_t, 0 }, { KBD_u, 0 },
	{ KBD_v, 0 }, { KBD_w, 0 }, { KBD_x, 0 },
	{ KBD_y, 0 }, { KBD_z, 0 },
	{ KBD_leftbracket, CKMD_SHIFT }, { KBD_backslash, CKMD_SHIFT },
	{ KBD_rightbracket, CKMD_SHIFT }, { KBD_grave, CKMD_SHIFT },
	{ KBD_backspace, 0 }
};

static const struct {
	int ch;
	KBD_KEYS key;
	Bit8u mod;
} txt_extkeys[] = {
	{ KEY_LEFT, KBD_left, 0 }, { KEY_RIGHT, KBD_right, 0 },
	{ KEY_SLEFT, KBD_left, CKMD_SHIFT }, { KEY_SRIGHT, KBD_right, CKMD_SHIFT },
	{ KEY_UP, KBD_up, 0 }, { KEY_DOWN, KBD_down, 0 },
	{ KEY_BTAB, KBD_tab, CKMD_SHIFT },
	{ KEY_F(1), KBD_f1, 0 }, { KEY_F(2), KBD_f2, 0 },
	{ KEY_F(3), KBD_f3, 0 }, { KEY_F(4), KBD_f4, 0 },
	{ KEY_F(5), KBD_f5, 0 }, { KEY_F(6), KBD_f6, 0 },
	{ KEY_F(7), KBD_f7, 0 }, { KEY_F(8), KBD_f8, 0 },
	{ KEY_F(9), KBD_f9, 0 }, { KEY_F(10), KBD_f10, 0 },
	{ KEY_F(11), KBD_f11, 0 }, { KEY_F(12), KBD_f12, 0 },
	{ KEY_BACKSPACE, KBD_backspace, 0 },
	{ KEY_ENTER, KBD_enter, 0 },
	{ KEY_PRINT, KBD_printscreen, 0 },
	{ KEY_IC, KBD_insert, 0 }, { KEY_HOME, KBD_home, 0 },
	{ KEY_PPAGE, KBD_pageup, 0 }, { KEY_DC, KBD_delete, 0 },
	{ KEY_SDC, KBD_delete, CKMD_SHIFT },
	{ KEY_END, KBD_end, 0 }, { KEY_NPAGE, KBD_pagedown, 0 }
    /* Not generating KBD_extra_lt_gt, KBD_pause, modifiers and KBD_kp* */
};

static int txt_line;
static int txt_cursrow, txt_curscol;
static bool txt_inited = false;

static void TXTOUT_ShutDown(void) {
	txt_inited = false;
	endwin();
}

void TXTOUT_SetSize(Bitu width, Bitu height) {
	if (!txt_inited) {
		static const NCURSES_COLOR_T vgacolors[8] = {
			COLOR_BLACK, COLOR_BLUE, COLOR_GREEN, COLOR_CYAN,
			COLOR_RED, COLOR_MAGENTA, COLOR_YELLOW, COLOR_WHITE
		};

		setlocale(LC_ALL, "");

		WINDOW *txt_win = initscr();
		atexit(TXTOUT_ShutDown);
		raw();
		noecho();
		keypad(txt_win, TRUE);
		nodelay(txt_win, TRUE);

		start_color();
		for (int i = 0; i < 8*8; i++) {
			init_pair(i + 1, vgacolors[i & 7], vgacolors[i >> 3]);
		}

		move(0,0);
		txt_line = 0;
		txt_cursrow = 0;

		txt_inited = true;
	}

#ifdef __PDCURSES__
	resize_term(height, width);
#else
	printf("\e[8;%u;%ut", height, width);
	fflush(NULL);
	resizeterm(height, width);
#endif
}

void TXTOUT_Draw_Line(const Bit8u* vidmem, Bitu len) {
	move(txt_line, 0);
	txt_line++;

	for (Bitu cx=0;cx<len;cx++) {
		Bitu chr=vidmem[cx*2];
		Bitu col=vidmem[cx*2+1];
		int attrset = COLOR_PAIR((col & 7) + ((col & 0x70) >> 1) + 1);
		if (col & 8)
			attrset |= A_BOLD;
#ifdef __PDCURSES__
		else
			attroff(A_BOLD);
#endif
		unsigned char buf[4];
		cchar_t ch;
#ifdef __PDCURSES__
		attron(attrset);
		ch = vga2unicode(chr);
#else // ncursesw
		ch.attr = attrset;
		ch.chars[0] = vga2unicode(chr);
		ch.chars[1] = 0;
#endif
		add_wch(&ch);
	}
}

void TXTOUT_SetCursor(Bitu col) {
	txt_cursrow = txt_line;
	txt_curscol = col;
}

void TXTOUT_StartUpdate(void) {
	txt_line = 0;
	txt_cursrow = 0;
}

/* Use of getch() makes the cursor appear wherever it currently is,
 * which is not necessarily its proper location.
 */
static void TXTOUT_Events(void) {
	while (1) {
		KBD_KEYS key = KBD_NONE;
		Bit8u mod = 0;
		int ch = getch();

		if (ch == ERR) {
			break;
		} else if (ch >= 0 &&
		           ch < sizeof(txt_basekeys) / sizeof(txt_basekeys[0]))  {
			key = txt_basekeys[ch].key;
			mod = txt_basekeys[ch].mod;
		} else {
			for (int i = 0; i < sizeof(txt_extkeys) / sizeof(txt_extkeys[0]);
			     i++) {
				if (txt_extkeys[i].ch == ch) {
					key = txt_extkeys[i].key;
					mod = txt_extkeys[i].mod;
					break;
				}
			}
		}

		if (key != KBD_NONE) {
			if (mod & CKMD_CTRL) KEYBOARD_AddKey(KBD_leftctrl, true);
			if (mod & CKMD_SHIFT) KEYBOARD_AddKey(KBD_leftshift, true);
			KEYBOARD_AddKey(key, true);
			KEYBOARD_AddKey(key, false);
			if (mod & CKMD_SHIFT) KEYBOARD_AddKey(KBD_leftshift, false);
			if (mod & CKMD_CTRL) KEYBOARD_AddKey(KBD_leftctrl, false);
		}
	}
}

void TXTOUT_EndUpdate(void) {
	// DOSBox will call this before TXTOUT_SetSize() initialization
	if (!txt_inited) return;
	if (txt_cursrow > 0) {
		curs_set(1);
		move(txt_cursrow - 1, txt_curscol);
	} else {
		curs_set(0);
	}
	refresh();
	TXTOUT_Events();
}

#endif // C_CURSOUT

#ifndef C_SDLGFX
#include "render.h"
#include "setup.h"
#include "vga.h"
void RENDER_Init(Section * sec) { vga.draw.lines_scaled = 1; }
static void RENDER_NullDrawLine(const void * src) {}
ScalerLineHandler_t RENDER_DrawLine = RENDER_NullDrawLine;
void RENDER_SetSize(Bitu width,Bitu height,Bitu bpp,float fps,double ratio,bool dblw,bool dblh) {}
bool RENDER_StartUpdate(void) { return true; }
void RENDER_EndUpdate(bool abort) {
#ifdef C_CURSOUT
	TXTOUT_EndUpdate();
#endif // C_CURSOUT
}
void RENDER_SetPal(Bit8u entry,Bit8u red,Bit8u green,Bit8u blue) {}
void GFX_ShowMsg(char const* format,...) {}
void GFX_Events(void) {}
void GFX_ResetScreen(void) {}
void GFX_SwitchFullScreen(void) {}
void GFX_EndUpdate( const Bit16u *changedLines ) {}
void GFX_LosingFocus(void) {}
void GFX_CaptureMouse(void) {}
bool mouselocked = false;
void Mouse_AutoLock(bool enable) {}
void GFX_SetTitle(Bit32s cycles ,Bits frameskip,bool paused) {}
void GFX_UpdateDisplayDimensions(int width, int height) {}
#include "SDL.h"
SDL_Rect GFX_GetSDLSurfaceSubwindowDims(Bit16u width, Bit16u height) {}
SDL_Window * GFX_SetSDLSurfaceWindow(Bit16u width, Bit16u height) {}
#endif // !C_SDLGFX
