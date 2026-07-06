# dos/

Drop your DOS game folders here — one folder per game.

Each subfolder should contain the game's executable (`.exe`, `.com`, or `.bat`)
plus its data files, for example:

```
dos/
  zone66/
    zone66.exe
    title.z66
    data/...
  doom/
    DOOM.EXE
    setup.bat
    data/doom.wad
```

On deploy, the build step (`worker/scripts/build-bundles.mjs`) turns every
folder here into a ready-to-run `.jsdos` bundle:

- `dos/zone66/` → `worker/public/games/zone66.jsdos`
- listed on the Worker landing page and downloadable at `/games/zone66.jsdos`

The main executable is auto-detected (a file matching the folder name first,
then a `.bat`, then the first `.exe`). Folders without an executable at their
root are skipped with a warning.

The generated bundles live in `worker/public/` and are **not** committed — they
are rebuilt from these folders on every deploy.
