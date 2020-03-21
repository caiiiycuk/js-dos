//
// Created by caiiiycuk on 21.03.20.
//

#ifndef JSDOS_SDL_STUB_H
#define JSDOS_SDL_STUB_H

#define SDL_MAJOR_VERSION	1
#define SDL_MINOR_VERSION	2
#define SDL_PATCHLEVEL		15

#define SDL_VERSIONNUM(X, Y, Z)						\
	((X)*1000 + (Y)*100 + (Z))

/** This is the version number macro for the current SDL version */
#define SDL_COMPILEDVERSION \
	SDL_VERSIONNUM(SDL_MAJOR_VERSION, SDL_MINOR_VERSION, SDL_PATCHLEVEL)

/** This macro will evaluate to true if compiled with SDL at least X.Y.Z */
#define SDL_VERSION_ATLEAST(X, Y, Z) \
	(SDL_COMPILEDVERSION >= SDL_VERSIONNUM(X, Y, Z))

#endif
