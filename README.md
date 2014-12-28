js-dos.com
==========

js-doc.com codebase

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
