/**
 * Cloudflare Worker: serve and build js-dos (.jsdos) bundles.
 *
 * A .jsdos bundle is a ZIP archive with:
 *   - the game files at the archive root (DOSBox mounts this as drive C:)
 *   - a `.jsdos/dosbox.conf` whose [autoexec] section runs the game executable
 *
 * Two ways to get bundles:
 *   1. Commit game folders under the repo's `dos/` directory. The build step
 *      (scripts/build-bundles.mjs) turns each one into a static `.jsdos` asset,
 *      served from `/games/<name>.jsdos` and listed on `/`.
 *   2. Upload a folder ad hoc via the page at `/upload` (POST /bundle).
 *
 * Routes:
 *   GET  /               -> landing page listing the committed games
 *   GET  /upload         -> drag-and-drop folder-upload page
 *   POST /bundle         -> multipart form with game files, returns <name>.jsdos
 *   GET  /games/*.jsdos  -> static bundle assets (served by the ASSETS binding)
 *   GET  /games.json     -> index of committed games (static asset)
 */

// @ts-ignore - shared plain-JS module, bundled by wrangler/esbuild
import { EXECUTABLE_EXTS, extname, buildBundle } from "./jsdos.mjs";

interface Env {
    // Static assets binding (the generated bundles in ./public). Optional so the
    // Worker still runs if assets are not configured.
    ASSETS?: { fetch(request: Request): Promise<Response> };
}

interface GameEntry {
    name: string;
    file: string;
    exe: string;
    size: number;
}

/** Normalise a path to forward slashes and drop the leading game-folder segment. */
function toArchivePath(rawPath: string): { folder: string; arc: string } {
    const parts = rawPath.replace(/\\/g, "/").split("/").filter(Boolean);
    if (parts.length > 1) {
        return { folder: parts[0], arc: parts.slice(1).join("/") };
    }
    return { folder: "", arc: parts[0] ?? "" };
}

async function handleUpload(request: Request): Promise<Response> {
    const form = await request.formData();
    // Workers types model getAll() as string[], but file fields arrive as File
    // objects at runtime; cast so we can narrow to the uploaded files.
    const entries = form.getAll("file") as unknown as (File | string)[];
    const files = entries.filter((f): f is File => typeof f !== "string");
    if (files.length === 0) {
        return new Response("No files uploaded", { status: 400 });
    }

    let paths: string[];
    try {
        const raw = form.get("paths");
        paths = typeof raw === "string" ? JSON.parse(raw) : [];
    } catch {
        paths = [];
    }

    const gameFiles: Record<string, Uint8Array> = {};
    const rootNames = new Set<string>();
    let bundleName = (form.get("name") as string) || "";

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { folder, arc } = toArchivePath(paths[i] || file.name);
        if (!arc || arc.endsWith("/")) {
            continue;
        }
        if (folder) {
            rootNames.add(folder);
            if (!bundleName) {
                bundleName = folder;
            }
        }
        gameFiles[arc] = new Uint8Array(await file.arrayBuffer());
    }

    if (Object.keys(gameFiles).length === 0) {
        return new Response("No usable files in upload", { status: 400 });
    }
    if (!bundleName) {
        bundleName = rootNames.size === 1 ? [...rootNames][0] : "bundle";
    }

    let zip: Uint8Array;
    let exe: string;
    try {
        ({ zip, exe } = buildBundle(gameFiles, bundleName));
    } catch (e: any) {
        return new Response(e?.message ?? "Failed to build bundle", { status: 422 });
    }

    const safeName = bundleName.replace(/[^a-zA-Z0-9._-]/g, "_") || "bundle";
    return new Response(zip, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${safeName}.jsdos"`,
            "X-Bundle-Executable": exe,
        },
    });
}

async function loadGames(env: Env, url: URL): Promise<GameEntry[]> {
    if (!env.ASSETS) {
        return [];
    }
    try {
        const res = await env.ASSETS.fetch(new Request(new URL("/games.json", url)));
        if (!res.ok) {
            return [];
        }
        return (await res.json()) as GameEntry[];
    } catch {
        return [];
    }
}

function landingPage(games: GameEntry[]): string {
    const rows = games.length
        ? games
              .map(
                  (g) =>
                      `<li><a href="/games/${encodeURIComponent(g.file)}" download>${g.name}</a>` +
                      ` <small>(${g.exe}, ${(g.size / 1024).toFixed(0)} KB)</small></li>`,
              )
              .join("\n")
        : `<li><em>No games yet — drop folders into the repo's <code>dos/</code> directory and redeploy.</em></li>`;

    return PAGE_SHELL(
        "js-dos bundles",
        `<h1>js-dos game bundles</h1>
<p>Ready-to-run <code>.jsdos</code> bundles built from the <code>dos/</code> folder
in the repository. Add a game by committing its folder there and redeploying.</p>
<ul class="games">
${rows}
</ul>
<p><a class="btn" href="/upload">Or upload a folder now →</a></p>`,
    );
}

async function fetchHandler(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/bundle") {
        try {
            return await handleUpload(request);
        } catch (e: any) {
            return new Response("Failed to build bundle: " + (e?.message ?? e), { status: 500 });
        }
    }

    if (request.method === "GET" && url.pathname === "/upload") {
        return new Response(UPLOAD_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    }

    // Static bundle assets (/games/*.jsdos, /games.json) come from the binding.
    if (request.method === "GET" && (url.pathname.startsWith("/games/") || url.pathname === "/games.json")) {
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }
        return new Response("Assets not configured", { status: 404 });
    }

    if (request.method === "GET" && url.pathname === "/") {
        const games = await loadGames(env, url);
        return new Response(landingPage(games), {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    }

    return new Response("Not found", { status: 404 });
}

export default {
    fetch: fetchHandler,
};

// Re-export for tooling that expects named symbols (harmless at runtime).
export { EXECUTABLE_EXTS, extname };

function PAGE_SHELL(title: string, body: string): string {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 16px/1.5 system-ui, sans-serif; max-width: 640px; margin: 3rem auto; padding: 0 1rem; }
  h1 { font-size: 1.4rem; }
  ul.games { padding-left: 1.2rem; }
  ul.games li { margin: .3rem 0; }
  small { opacity: .7; }
  #drop { border: 2px dashed currentColor; border-radius: 12px; padding: 3rem 1rem;
          text-align: center; opacity: .8; cursor: pointer; transition: opacity .15s; }
  #drop.over { opacity: 1; background: rgba(127,127,127,.12); }
  #log { margin-top: 1rem; white-space: pre-wrap; font-family: ui-monospace, monospace; }
  input[type=file] { display: none; }
  a.btn { display: inline-block; margin-top: 1rem; padding: .5rem 1rem;
          border: 1px solid currentColor; border-radius: 8px; text-decoration: none; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

const UPLOAD_HTML = PAGE_SHELL(
    "Make a .jsdos bundle",
    `<h1>Package a DOS game folder into a .jsdos bundle</h1>
<p>Pick a folder containing a DOS game (its .exe/.com/.bat plus data files).
It is zipped into a ready-to-run <code>.jsdos</code> bundle for
<a href="https://js-dos.com">js-dos</a>. <a href="/">← back to library</a></p>

<label id="drop">
  <input type="file" id="picker" webkitdirectory multiple>
  Click to choose a folder — or drag &amp; drop it here
</label>
<div id="log"></div>

<script>
const drop = document.getElementById("drop");
const picker = document.getElementById("picker");
const log = document.getElementById("log");

picker.addEventListener("change", () => upload([...picker.files]));

drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", async (e) => {
  e.preventDefault();
  drop.classList.remove("over");
  const files = await filesFromDataTransfer(e.dataTransfer);
  upload(files);
});

async function filesFromDataTransfer(dt) {
  const out = [];
  const walk = async (entry, prefix) => {
    if (entry.isFile) {
      const file = await new Promise((res) => entry.file(res));
      file._rel = prefix + entry.name;
      out.push(file);
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries = await new Promise((res) => reader.readEntries(res));
      for (const child of entries) await walk(child, prefix + entry.name + "/");
    }
  };
  const items = [...dt.items].map((i) => i.webkitGetAsEntry()).filter(Boolean);
  for (const item of items) await walk(item, "");
  return out;
}

async function upload(files) {
  if (!files.length) return;
  log.textContent = "Uploading " + files.length + " file(s)…";
  const form = new FormData();
  const paths = [];
  for (const f of files) {
    const rel = f.webkitRelativePath || f._rel || f.name;
    paths.push(rel);
    form.append("file", f, f.name);
  }
  form.append("paths", JSON.stringify(paths));

  try {
    const res = await fetch("/bundle", { method: "POST", body: form });
    if (!res.ok) { log.textContent = "Error: " + (await res.text()); return; }
    const blob = await res.blob();
    const dispo = res.headers.get("Content-Disposition") || "";
    const name = (dispo.match(/filename="([^"]+)"/) || [])[1] || "bundle.jsdos";
    const exe = res.headers.get("X-Bundle-Executable");
    const href = URL.createObjectURL(blob);
    log.innerHTML = "Bundle ready" + (exe ? " (runs " + exe + ")" : "") +
      '.<br><a class="btn" href="' + href + '" download="' + name + '">Download ' + name + "</a>";
  } catch (err) {
    log.textContent = "Error: " + err;
  }
}
</script>`,
);
