# jsdos-bundle-worker

A Cloudflare Worker that packages a DOS game folder into a ready-to-run
[js-dos](https://js-dos.com) `.jsdos` bundle — entirely in the cloud, so you
never have to run anything on your own machine.

Drop a folder like `zone66/` (its `.exe`/`.com`/`.bat` plus data files) and the
Worker returns `zone66.jsdos`: a ZIP with the game files at the root and a
generated `.jsdos/dosbox.conf` whose `[autoexec]` launches the game.

## How it works

- **`GET /`** serves a small drag-and-drop page (choose or drop a folder).
- **`POST /bundle`** takes a multipart form with the game files (plus a `paths`
  JSON array of their relative paths) and streams back `<name>.jsdos`.

The main executable is auto-detected:

1. an executable whose name matches the folder (`zone66` → `zone66.exe`), else
2. a `.bat` launcher, else
3. the first `.exe`/`.com` alphabetically.

The chosen one is reported in the `X-Bundle-Executable` response header.

## Develop & deploy

```bash
cd worker
npm install
npm run dev      # local dev server (http://localhost:8787)
npm run deploy   # publish to your Cloudflare account (needs `wrangler login`)
```

Zipping is done in-Worker with [fflate](https://github.com/101arrowz/fflate),
which runs in the Workers runtime with no Node built-ins.

> Uploads go through a single request, so very large games may hit the Worker
> request-size limit. For those, split the upload or move packaging to an
> R2-backed flow.
