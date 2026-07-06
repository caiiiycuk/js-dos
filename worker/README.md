# jsdos-bundle-worker

A Cloudflare Worker that turns DOS game folders into ready-to-run
[js-dos](https://js-dos.com) `.jsdos` bundles — entirely in the cloud, so you
never run anything on your own machine.

There are two ways to produce bundles:

1. **Commit folders** under the repo's [`dos/`](../dos) directory (one folder
   per game). On deploy they become static `.jsdos` assets, listed on the
   landing page and downloadable at `/games/<name>.jsdos`.
2. **Upload a folder** ad hoc from the page at `/upload`.

A `.jsdos` bundle is a ZIP with the game files at the root and a generated
`.jsdos/dosbox.conf` whose `[autoexec]` launches the game. The main executable
is auto-detected: a file matching the folder name first (`zone66` →
`zone66.exe`), then a `.bat`, then the first `.exe`/`.com`.

## Routes

| Method | Path                | Purpose                                            |
| ------ | ------------------- | -------------------------------------------------- |
| GET    | `/`                 | landing page listing the committed games           |
| GET    | `/upload`           | drag-and-drop folder-upload page                   |
| POST   | `/bundle`           | multipart upload → returns `<name>.jsdos`          |
| GET    | `/games/*.jsdos`    | static bundle assets (built from `dos/`)           |
| GET    | `/games.json`       | index of committed games                           |

## Develop & deploy

```bash
cd worker
npm install
npm run build    # build .jsdos assets from ../dos into ./public
npm run dev      # build + local dev server (http://localhost:8787)
npm run deploy   # build + publish to Cloudflare (needs `wrangler login`)
```

`npm run dev`/`deploy` run the build first, so the bundles are always generated
from the current contents of `dos/`. Zipping uses
[fflate](https://github.com/101arrowz/fflate), which runs in the Workers
runtime with no Node built-ins.

## Deploying from Git (Cloudflare Workers Builds)

If you connect this repo to Cloudflare for automatic deploys, point the build at
this subdirectory — otherwise Cloudflare tries to install the whole js-dos app
at the repo root (which uses Yarn) and fails on the lockfile:

- **Root directory:** `worker`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

With the root directory set to `worker`, Cloudflare detects `package-lock.json`
and installs with npm; the build script still reaches the game folders at
`../dos`.

> Uploads and served bundles go through a single request, so very large games
> may hit the Worker request-size limit. For those, split the upload or move
> packaging to an R2-backed flow.
