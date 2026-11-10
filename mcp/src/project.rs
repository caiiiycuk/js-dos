use crate::{files, runtime::ASSETS};
use anyhow::{Context, Result, ensure};
use serde_json::{Value, json};
use std::{fs, path::Path};

pub fn generate(destination: &Path, preset: &str, bundle: &[u8]) -> Result<Value> {
    ensure!(
        ["html", "vite", "react", "vue", "angular"].contains(&preset),
        "Unknown project preset"
    );
    let validation = files::validate(bundle)?;
    ensure!(
        !destination.exists(),
        "Project destination already exists; select a new directory"
    );
    let parent = fs::canonicalize(
        destination
            .parent()
            .context("Destination requires a parent")?,
    )?;
    let destination = parent.join(
        destination
            .file_name()
            .context("Destination requires a name")?,
    );
    let staging = tempfile::tempdir_in(&parent)?;
    let project = staging.path().join("project");
    fs::create_dir(&project)?;
    let public = if preset == "html" {
        project.clone()
    } else {
        project.join("public")
    };
    fs::create_dir_all(public.join("runtime"))?;
    let manifest: Value = serde_json::from_slice(
        ASSETS
            .iter()
            .find(|(name, _)| *name == "manifest.json")
            .context("Missing embedded manifest")?
            .1,
    )?;
    let mut runtime_files = Vec::new();
    for file in manifest["files"].as_array().context("Invalid manifest")? {
        if file["runtime"] != true {
            continue;
        }
        let name = file["path"].as_str().context("Missing asset path")?;
        files::relative(name)?;
        let bytes = ASSETS
            .iter()
            .find(|(path, _)| *path == name)
            .context("Missing embedded resource")?
            .1;
        fs::create_dir_all(public.join("runtime").join(name).parent().unwrap())?;
        fs::write(public.join("runtime").join(name), bytes)?;
        runtime_files.push(file.clone());
    }
    fs::write(
        public.join("runtime/manifest.json"),
        serde_json::to_vec_pretty(
            &json!({"jsdos":manifest["jsdos"],"emulators":manifest["emulators"],"files":runtime_files}),
        )?,
    )?;
    fs::write(public.join("bundle.jsdos"), bundle)?;
    fs::write(
        project.join("runtime.js"),
        include_str!("../templates/runtime.js"),
    )?;
    let mut html = include_str!("../templates/index.html").to_owned();
    let mut package = json!({"name":"local-jsdos-project","version":"1.0.0","private":true,"type":"module",
        "scripts":{"dev":"vite --host 127.0.0.1","build":"vite build","preview":"vite preview --host 127.0.0.1"},
        "devDependencies":{"vite":"5.4.21"}});
    let source = match preset {
        "react" => {
            package["dependencies"] = json!({"react":"18.3.1","react-dom":"18.3.1"});
            html = html.replace("./main.js", "./main.jsx");
            fs::write(
                project.join("main.jsx"),
                include_str!("../templates/react.jsx"),
            )?;
            None
        }
        "vue" => {
            package["dependencies"] = json!({"vue":"3.5.24"});
            Some(include_str!("../templates/vue.js"))
        }
        "angular" => {
            package = json!({"name":"local-jsdos-project","version":"1.0.0","private":true,
                "scripts":{"dev":"ng serve --host 127.0.0.1","build":"ng build","preview":"python3 -m http.server 8080 --directory dist/player/browser"},
                "dependencies":{"@angular/common":"19.2.15","@angular/compiler":"19.2.15","@angular/core":"19.2.15","@angular/platform-browser":"19.2.15","rxjs":"7.8.2","zone.js":"0.15.1"},
                "devDependencies":{"@angular-devkit/build-angular":"19.2.19","@angular/cli":"19.2.19","@angular/compiler-cli":"19.2.15","typescript":"5.8.3"}});
            html = html
                .replace("<div id=\"app\"></div>", "<app-root></app-root>")
                .replace("<script type=\"module\" src=\"./main.js\"></script>", "");
            html = html.replace("<title>", "<base href=\"/\"><title>");
            fs::write(
                project.join("main.ts"),
                include_str!("../templates/angular.ts"),
            )?;
            fs::write(
                project.join("tsconfig.json"),
                serde_json::to_vec_pretty(
                    &json!({"compilerOptions":{"target":"ES2022","module":"ES2022","moduleResolution":"bundler","experimentalDecorators":true,"skipLibCheck":true,"allowJs":true,"strict":true,"useDefineForClassFields":false},"angularCompilerOptions":{"strictTemplates":true},"files":["main.ts"]}),
                )?,
            )?;
            fs::write(
                project.join("angular.json"),
                serde_json::to_vec_pretty(
                    &json!({"version":1,"projects":{"player":{"projectType":"application","root":"","sourceRoot":".","architect":{
                        "build":{"builder":"@angular-devkit/build-angular:application","options":{"outputPath":"dist/player","index":"index.html","browser":"main.ts","polyfills":["zone.js"],"tsConfig":"tsconfig.json","assets":[{"glob":"**/*","input":"public"}]}},
                        "serve":{"builder":"@angular-devkit/build-angular:dev-server","options":{"buildTarget":"player:build"}}
                    }}}}),
                )?,
            )?;
            None
        }
        _ => Some(include_str!("../templates/vanilla.js")),
    };
    if let Some(source) = source {
        fs::write(project.join("main.js"), source)?;
    }
    fs::write(project.join("index.html"), &html)?;
    if matches!(preset, "vite" | "react" | "vue") {
        fs::write(
            project.join("vite.config.js"),
            include_str!("../templates/vite.config.js"),
        )?;
    }
    if preset == "angular" {
        fs::write(
            project.join("diagnostic-zone.js"),
            include_str!("../templates/angular-diagnostics.js"),
        )?;
        fs::write(
            project.join("index.diagnostic.html"),
            html.replace(
                "<head>",
                "<head><script src=\"/__jsdos_diagnostics.js\"></script>",
            ),
        )?;
        let mut angular: Value = serde_json::from_slice(&fs::read(project.join("angular.json"))?)?;
        angular["projects"]["player"]["architect"]["build"]["configurations"] = json!({"development":{"optimization":false,"sourceMap":true},"diagnostic":{"index":"index.diagnostic.html","polyfills":["zone.js","./diagnostic-zone.js"],"optimization":false,"sourceMap":true}});
        angular["projects"]["player"]["architect"]["serve"]["options"]["buildTarget"] =
            json!("player:build:development");
        angular["projects"]["player"]["architect"]["serve"]["configurations"] = json!({"diagnostic":{"buildTarget":"player:build:diagnostic","hmr":false,"liveReload":false}});
        fs::write(
            project.join("angular.json"),
            serde_json::to_vec_pretty(&angular)?,
        )?;
    }
    if preset != "html" {
        fs::write(
            project.join("package.json"),
            serde_json::to_vec_pretty(&package)?,
        )?;
    }
    fs::write(
        project.join("jsdos-project.json"),
        serde_json::to_vec_pretty(
            &json!({"preset":preset,"runtime":if preset == "html" {"runtime"} else {"public/runtime"},"validation":validation}),
        )?,
    )?;
    let instructions = if preset == "html" {
        "Serve this directory with any HTTP server, for example: python3 -m http.server 8080 --bind 127.0.0.1. Node.js is not required."
    } else {
        "Install Node.js 22.12+ (or 20.19+), then explicitly run npm install, npm run dev, npm run build and npm run preview. No packages were installed or scripts executed by generation. Angular uses its local CLI; no global CLI is required."
    };
    fs::write(
        project.join("README.md"),
        format!(
            "# Local js-dos project\n\n{instructions}\n\nOpen the HTTP URL, never file://. Production serves dist/ (Angular: dist/player/browser).\n\nThe runtime and bundle are local. No MCP process or Studio bridge is needed. See runtime/notices (public/runtime/notices in source) for licenses and sources. External sockdrive/qcow2 resources, if used by your bundle, are not embedded. Game correctness and browser autoplay/background behavior are not guaranteed.\n"
        ),
    )?;
    fs::rename(&project, &destination)?;
    Ok(
        json!({"path":destination,"preset":preset,"instructions":instructions,"buildStatus":"not-run","warnings":validation}),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn projects_are_local_and_do_not_overwrite() {
        let root = tempfile::tempdir().unwrap();
        let bundle = files::create("[autoexec]\necho GENERATED").unwrap();
        for preset in ["html", "vite", "react", "vue", "angular"] {
            let destination = root.path().join(preset);
            generate(&destination, preset, &bundle).unwrap();
            assert!(generate(&destination, preset, &bundle).is_err());
            let index = fs::read_to_string(destination.join("index.html")).unwrap();
            assert!(
                !index.contains("studio.js")
                    && !index.contains("/bridge")
                    && !index.contains("127.0.0.1:")
            );
            assert!(!destination.join("node_modules").exists());
        }
        assert!(generate(&root.path().join("invalid"), "invalid", &bundle).is_err());
        assert!(!root.path().join("invalid").exists());
        assert_eq!(fs::read_dir(root.path()).unwrap().count(), 5);
    }
}
