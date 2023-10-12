export const dosboxconf = [{
    name: "Win 95",
    contents: `
[sdl]
autolock=true

[dosbox]
title=Windows 95
memsize=128

[video]
vmemsize=8
vesa modelist width limit=0
vesa modelist height limit=0

[dos]
ver=7.1
hard drive data rate limit=0
floppy drive data rate limit=0

[cpu]
cputype=pentium_mmx
core=normal

[sblaster]
sbtype=sb16vibra

[fdc, primary]
int13fakev86io=true

[ide, primary]
int13fakeio=true
int13fakev86io=true

[ide, secondary]
int13fakeio=true
int13fakev86io=true
cd-rom insertion delay=4000

[render]
scaler=none

[autoexec]
echo off
imgmount 2 sockdrive wss://backend.make-vm.com:8001 dos.zone win95
echo Please visit our website:
echo 
echo         _                __
echo        (_)____      ____/ /___  _____ _________  ____ ___
echo       / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
echo      / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
echo   __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
echo  /___/
echo
echo type 'boot c:' to load windows 95
echo on
# 
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
#
`.replace(/\n/g, "\r\n"),
}, {
    name: "Win 98",
    contents: `
[sdl]
autolock=true

[dosbox]
title=Windows 98
memsize=128

[video]
vmemsize=8
vesa modelist width limit=0
vesa modelist height limit=0

[dos]
ver=7.1
hard drive data rate limit=0
floppy drive data rate limit=0

[cpu]
cputype=pentium_mmx
core=normal

[sblaster]
sbtype=sb16vibra

[fdc, primary]
int13fakev86io=true

[ide, primary]
int13fakeio=true
int13fakev86io=true

[ide, secondary]
int13fakeio=true
int13fakev86io=true
cd-rom insertion delay=4000

[render]
scaler=none

[autoexec]
echo off
mount c .
c:

echo Please visit our website:
echo 
echo         _                __
echo        (_)____      ____/ /___  _____ _________  ____ ___
echo       / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
echo      / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
echo   __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
echo  /___/
echo on
# 
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
#
`.replace(/\n/g, "\r\n"),
}, {
    name: "Win1.x",
    contents: `
[sdl]
autolock=true

[dosbox]
title=Windows 1.0x

[dos]
ver=3.4

[serial]
# Comment out the line below if you have the special OEM Windows 1.04
# release from the IBM PS/2 Collegiate Kit, which supports PS/2 mouse.
serial1=serialmouse

[parallel]
parallel1=printer

[printer]
multipage=true
timeout=5000

[render]
scaler=none

[autoexec]
echo off
mount c .
c:

echo Please visit our website:
echo 
echo         _                __
echo        (_)____      ____/ /___  _____ _________  ____ ___
echo       / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
echo      / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
echo   __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
echo  /___/
echo on
# 
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
#
`.replace(/\n/g, "\r\n"),
}, {
    name: "Win 2.x",
    contents: `
[sdl]
autolock=true

[dosbox]
title=Windows 2.x

[dos]
ver=4.0

[serial]
#uncomment if using Windows/386 2.01 which lacks PS/2 mouse support
#serial1=serialmouse

[parallel]
parallel1=printer

[printer]
multipage=true
timeout=5000

[render]
scaler=none

[config]
= this prevents Windows 2.1x from complaining that HMA is in use
dos=low

[autoexec]
echo off
mount c .
c:

echo Please visit our website:
echo 
echo         _                __
echo        (_)____      ____/ /___  _____ _________  ____ ___
echo       / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
echo      / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
echo   __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
echo  /___/
echo on
# 
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
#
`.replace(/\n/g, "\r\n"),
}, {
    name: "Win 3.0",
    contents: `
[sdl]
autolock=true

[dosbox]
title=Windows 3.0
memsize=16
machine=svga_et4000

[dos]
hard drive data rate limit=0
floppy drive data rate limit=0

[cpu]
cputype=pentium
core=normal

[sblaster]
sbtype=sbpro1

[pci]
voodoo=false

[ide, primary]
int13fakeio=true
int13fakev86io=false

[render]
scaler=none

[autoexec]
echo off
mount c .
c:

echo Please visit our website:
echo 
echo         _                __
echo        (_)____      ____/ /___  _____ _________  ____ ___
echo       / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
echo      / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
echo   __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
echo  /___/
echo on
# 
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
#
`.replace(/\n/g, "\r\n"),
}, {
    name: "Win 3.11",
    contents: `
[sdl]
autolock=true

[dosbox]
title=Windows 3.1x
memsize=256

[dos]
hard drive data rate limit=0
floppy drive data rate limit=0

[cpu]
cputype=pentium
core=normal

[pci]
voodoo=false

[ide, primary]
int13fakeio=true
int13fakev86io=false

[render]
scaler=none

[autoexec]
echo off
mount c .
c:

echo Please visit our website:
echo 
echo         _                __
echo        (_)____      ____/ /___  _____ _________  ____ ___
echo       / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
echo      / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
echo   __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
echo  /___/
echo on
# 
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
#
`.replace(/\n/g, "\r\n"),
},
];
