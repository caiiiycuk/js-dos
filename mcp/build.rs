use sha2::{Digest, Sha256};
use std::{env, fs, path::PathBuf};

fn main() {
    println!("cargo:rerun-if-changed=assets");
    let root = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("assets");
    let manifest = fs::read(root.join("manifest.json"))
        .expect("Missing web assets: run npm run build:mcp-assets in the repository root first");
    let manifest: serde_json::Value =
        serde_json::from_slice(&manifest).expect("Invalid asset manifest");
    let mut assets = String::from("pub static ASSETS: &[(&str, &[u8])] = &[\n");
    let mut names = Vec::new();
    for file in manifest["files"].as_array().expect("Manifest files") {
        let name = file["path"].as_str().expect("Asset path");
        assert!(!name.starts_with('/') && !name.contains("..") && !name.contains('\\'));
        let path = root.join(name);
        let bytes = fs::read(&path).expect("Missing manifest asset");
        assert_eq!(file["size"].as_u64(), Some(bytes.len() as u64));
        assert_eq!(
            file["sha256"].as_str().unwrap(),
            format!("{:x}", Sha256::digest(&bytes))
        );
        assets.push_str(&format!(
            "({name:?}, include_bytes!({:?})),\n",
            path.to_str().unwrap()
        ));
        names.push(name);
    }
    for required in [
        "index.html",
        "studio.js",
        "js-dos.js",
        "js-dos.css",
        "emulators/emulators.js",
        "emulators/wdosbox.js",
        "emulators/wdosbox.wasm",
        "emulators/wdosbox-x.js",
        "emulators/wdosbox-x.wasm",
        "emulators/wlibzip.js",
        "emulators/wlibzip.wasm",
    ] {
        assert!(
            names.contains(&required),
            "Missing required resource: {required}"
        );
    }
    assets.push_str(&format!(
        "(\"manifest.json\", include_bytes!({:?})),\n];",
        root.join("manifest.json").to_str().unwrap()
    ));
    fs::write(
        PathBuf::from(env::var("OUT_DIR").unwrap()).join("assets.rs"),
        assets,
    )
    .unwrap();
}
