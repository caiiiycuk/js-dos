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

#ifndef DOSBOX_LOGGING_H
#define DOSBOX_LOGGING_H
enum LOG_TYPES {
	LOG_ALL = 0,
	LOG_VGA, LOG_VGAGFX,LOG_VGAMISC,LOG_INT10,
	LOG_SB,LOG_DMACONTROL,
	LOG_FPU,LOG_CPU,LOG_PAGING,
	LOG_FCB,LOG_FILES,LOG_IOCTL,LOG_EXEC,LOG_DOSMISC,
	LOG_PIT,LOG_KEYBOARD,LOG_PIC,
	LOG_MOUSE,LOG_BIOS,LOG_GUI,LOG_MISC,
	LOG_IO,
	LOG_PCI,
	LOG_MSG,
	LOG_MAX
};

enum LOG_SEVERITIES {
	LOG_NORMAL = 0,
	LOG_WARN,
	LOG_ERROR,
	LOG_SEVERITY_MAX,
};

class Logger {
private:
	LOG_TYPES       d_type;
	LOG_SEVERITIES  d_severity;
public:
	Logger(LOG_TYPES type, LOG_SEVERITIES severity);
	void operator() (char const* format, ...);
};

Logger& getLogger(LOG_TYPES type, LOG_SEVERITIES severity);
#define LOG(type,severity) getLogger(type,severity)
#define LOG_MSG(format,...)  getLogger(LOG_MSG, LOG_NORMAL)(format, ##__VA_ARGS__)
#define LOG_ERR(format,...)  getLogger(LOG_MSG, LOG_ERROR)(format, ##__VA_ARGS__)

#endif //DOSBOX_LOGGING_H
