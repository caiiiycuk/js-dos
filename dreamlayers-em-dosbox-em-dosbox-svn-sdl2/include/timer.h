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

#ifndef DOSBOX_TIMER_H
#define DOSBOX_TIMER_H


#define PIT_TICK_RATE 1193182

#ifdef JSDOS
#include <cstdint>
uint32_t GetMsPassedFromStart();
#define GetTicks()  GetMsPassedFromStart();
#else
/* underlying clock rate in HZ */
#include <SDL/SDL.h>
#define GetTicks() SDL_GetTicks()
#endif


double GetCurrentTimeMs();
void DelayWithYield(int ms);
void Delay(int ms);

typedef void (*TIMER_TickHandler)(void);

/* Register a function that gets called everytime if 1 or more ticks pass */
void TIMER_AddTickHandler(TIMER_TickHandler handler);
void TIMER_DelTickHandler(TIMER_TickHandler handler);

/* This will add 1 milliscond to all timers */
void TIMER_AddTick(void);

#endif
