#!/usr/bin/env python3
"""Package DOS game folders into js-dos (.jsdos) bundles.

Given a source directory that contains one or more DOS game folders (a folder
holding an executable plus its data files, e.g. .../300GAMES/zone66/), this
script walks the tree, detects every game folder and writes a ready-to-run
`<name>.jsdos` bundle for each one into a single destination folder.

A .jsdos bundle is just a ZIP archive with:
  - the game files at the archive root (DOSBox mounts this as drive C:)
  - a `.jsdos/dosbox.conf` whose [autoexec] section runs the game executable

Usage:
    python3 scripts/make-jsdos-bundles.py SOURCE_DIR [OUTPUT_DIR]

    SOURCE_DIR   directory to scan for DOS game folders
    OUTPUT_DIR   folder that will hold the generated .jsdos bundles
                 (default: ./jsdos-bundles)

Example:
    python3 scripts/make-jsdos-bundles.py /media/nirvana/300GAMES ./bundles
"""

import os
import sys
import zipfile
from pathlib import Path

# Extensions that mark a folder as a runnable DOS program.
EXECUTABLE_EXTS = {".exe", ".com", ".bat"}

# dosbox.conf template. The {exec} placeholder is replaced by the command that
# launches the game. Line endings are normalised to CRLF (DOS convention).
DOSBOX_CONF_TEMPLATE = """[sdl]
autolock=false
[dosbox]
machine=svga_s3
captures=capture
memsize=16
[cpu]
core=auto
cputype=auto
cycles=auto
[mixer]
nosound=false
rate=44100
[sblaster]
sbtype=sb16
sbbase=220
irq=7
dma=1
hdma=5
oplmode=auto
oplrate=44100
[speaker]
pcspeaker=true
[dos]
xms=true
ems=true
umb=true
keyboardlayout=auto
[autoexec]
echo off
mount c .
c:
{exec}
echo on

# Generated using scripts/make-jsdos-bundles.py (https://js-dos.com)
"""


def pick_executable(exe_names, folder_name):
    """Choose the most likely "main" executable for a game folder.

    Heuristics, in order of preference:
      1. an executable whose stem matches the folder name (zone66 -> zone66.exe)
      2. a .bat file (often the intended launcher)
      3. the first .exe / .com alphabetically
    """
    lowered = {name.lower(): name for name in exe_names}
    folder_key = folder_name.lower()

    # 1. exact folder-name match
    for ext in (".exe", ".com", ".bat"):
        if folder_key + ext in lowered:
            return lowered[folder_key + ext]

    # 2. any .bat launcher
    bats = sorted(name for name in exe_names if name.lower().endswith(".bat"))
    if bats:
        return bats[0]

    # 3. first executable alphabetically
    return sorted(exe_names, key=str.lower)[0]


def make_exec_command(exe_name):
    """Build the DOS command that launches the executable."""
    stem, ext = os.path.splitext(exe_name)
    if ext.lower() == ".bat":
        # `call` so control returns to the shell after the batch finishes
        return "call " + exe_name
    return stem  # DOS runs FOO.EXE / FOO.COM by typing FOO


def build_bundle(game_dir: Path, output_dir: Path):
    """Zip a single game folder into <output_dir>/<name>.jsdos.

    Returns the path of the written bundle, or None if the folder holds no
    executable.
    """
    executables = [
        entry.name
        for entry in os.scandir(game_dir)
        if entry.is_file() and os.path.splitext(entry.name)[1].lower() in EXECUTABLE_EXTS
    ]
    if not executables:
        return None

    exe = pick_executable(executables, game_dir.name)
    conf = DOSBOX_CONF_TEMPLATE.format(exec=make_exec_command(exe))
    conf = conf.replace("\r\n", "\n").replace("\n", "\r\n")

    output_dir.mkdir(parents=True, exist_ok=True)
    bundle_path = output_dir / (game_dir.name + ".jsdos")

    with zipfile.ZipFile(bundle_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add every file under the game folder, at the archive root.
        for root, _dirs, files in os.walk(game_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                arc_path = os.path.relpath(abs_path, game_dir)
                zf.write(abs_path, arc_path)
        # Add the js-dos config.
        zf.writestr(".jsdos/dosbox.conf", conf)

    print(f"  -> {bundle_path.name}  (runs: {exe})")
    return bundle_path


def is_game_folder(path: Path):
    """True if `path` directly contains a DOS executable."""
    try:
        for entry in os.scandir(path):
            if entry.is_file() and os.path.splitext(entry.name)[1].lower() in EXECUTABLE_EXTS:
                return True
    except (PermissionError, FileNotFoundError):
        pass
    return False


def find_game_folders(source: Path):
    """Yield every folder under `source` that looks like a DOS game.

    A folder qualifies when it directly holds an executable. Once a folder is
    treated as a game its subfolders are skipped, so nested data directories are
    not packaged as separate bundles.
    """
    if is_game_folder(source):
        yield source
        return

    for root, dirs, _files in os.walk(source):
        root_path = Path(root)
        if is_game_folder(root_path):
            yield root_path
            dirs[:] = []  # don't descend into a game folder's subdirs
            continue
        dirs.sort()


def main(argv):
    if len(argv) < 2 or argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0 if len(argv) >= 2 else 1

    source = Path(argv[1]).expanduser()
    output_dir = Path(argv[2]).expanduser() if len(argv) > 2 else Path("jsdos-bundles")

    if not source.is_dir():
        print(f"Error: source directory not found: {source}")
        return 1

    count = 0
    for game_dir in find_game_folders(source):
        print(f"Packaging {game_dir}")
        if build_bundle(game_dir, output_dir):
            count += 1

    if count == 0:
        print(f"No DOS game folders found under {source}")
    else:
        print(f"\nDone. {count} bundle(s) written to {output_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
