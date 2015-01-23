js-dos.com
==========

js-dos.com codebase

Usage:
```sh
mkdir build
cd build
perl -w ../build.pl <path-to-dos-root>
```

The build script works by convention. Expected directory layout in dos root:
```sh
\FOLDER1
 \PROGRAM1.EXE
  \PROGRAM1.EXE
 \PROGRAM2.COM
  \PROGRAM2.COM
 \...
\FOLDER2
 \...
```

Options (create file with this name in program directory):
* ./dosbox.conf - config for dosbox
* ./js-dos.nocursor - disable cursor when mouse on canvas

If you want to add a game on js-dos.com. Plase send me archive with game that runs in DosBox to 
email (caiiiycuk@gmail.com).
