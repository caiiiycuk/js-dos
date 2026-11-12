use anyhow::{Context, Result, bail, ensure};
use std::{
    collections::HashSet,
    fs,
    io::{Cursor, Read, Write},
    path::{Path, PathBuf},
};
use zip::{ZipArchive, ZipWriter, write::SimpleFileOptions};

pub const MAX_ZIP: usize = 64 * 1024 * 1024;
pub const MAX_EXPANDED: u64 = 256 * 1024 * 1024;
pub const MAX_FILES: usize = 4096;

pub fn relative(name: &str) -> Result<()> {
    ensure!(
        !name.is_empty() && name.len() <= 1024,
        "Invalid path length"
    );
    ensure!(
        !name.contains(['\\', ':', '\0']) && !name.starts_with('/'),
        "Absolute or invalid path"
    );
    ensure!(
        name.split('/').all(|part| !part.is_empty()
            && part != "."
            && part != ".."
            && !part.ends_with(['.', ' '])
            && !part.chars().any(char::is_control)
            && !matches!(
                part.split('.')
                    .next()
                    .unwrap()
                    .to_ascii_uppercase()
                    .as_str(),
                "CON"
                    | "PRN"
                    | "AUX"
                    | "NUL"
                    | "COM1"
                    | "COM2"
                    | "COM3"
                    | "COM4"
                    | "COM5"
                    | "COM6"
                    | "COM7"
                    | "COM8"
                    | "COM9"
                    | "LPT1"
                    | "LPT2"
                    | "LPT3"
                    | "LPT4"
                    | "LPT5"
                    | "LPT6"
                    | "LPT7"
                    | "LPT8"
                    | "LPT9"
            )),
        "Unsafe path component"
    );
    Ok(())
}

pub fn validate(bytes: &[u8]) -> Result<serde_json::Value> {
    ensure!(bytes.len() <= MAX_ZIP, "ZIP exceeds 64 MiB transfer limit");
    let mut archive = ZipArchive::new(Cursor::new(bytes)).context("Invalid ZIP")?;
    ensure!(archive.len() <= MAX_FILES, "ZIP exceeds 4096 entries");
    archive.validate_header_consistency()?;
    let mut total = 0u64;
    let mut names = HashSet::new();
    let mut files = HashSet::new();
    let mut config = None;
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index)?;
        let name = entry.name()?.trim_end_matches('/').to_owned();
        relative(&name)?;
        ensure!(
            names.insert(name.to_ascii_lowercase()),
            "Duplicate or case-conflicting ZIP path: {name}"
        );
        if let Some(mode) = entry.unix_mode() {
            ensure!(
                matches!(mode & 0o170000, 0 | 0o100000 | 0o040000),
                "ZIP links and special files are forbidden"
            );
        }
        total = total
            .checked_add(entry.size())
            .context("ZIP size overflow")?;
        ensure!(total <= MAX_EXPANDED, "ZIP exceeds 256 MiB expanded limit");
        if !entry.is_dir() {
            files.insert(name.to_ascii_lowercase());
        }
        let mut content = Vec::new();
        entry
            .by_ref()
            .take(MAX_EXPANDED + 1)
            .read_to_end(&mut content)?;
        ensure!(
            content.len() as u64 == entry.size(),
            "Invalid ZIP entry size"
        );
        if name == ".jsdos/dosbox.conf" {
            config = Some(String::from_utf8(content).context("dosbox.conf must be UTF-8")?);
        } else if name == ".jsdos/jsdos.json" {
            let config: serde_json::Value =
                serde_json::from_slice(&content).context("Invalid jsdos.json")?;
            ensure!(
                config["version"].is_string(),
                "jsdos.json requires a version string"
            );
        }
    }
    for name in &names {
        for (index, _) in name.match_indices('/') {
            ensure!(!files.contains(&name[..index]), "File/directory collision");
        }
    }
    let config = config.context("Missing .jsdos/dosbox.conf")?;
    ensure!(!config.trim().is_empty(), "Empty dosbox.conf");
    Ok(
        serde_json::json!({"status":"valid", "entries": names.len(), "expandedBytes":total,
        "externalResources": config.to_ascii_lowercase().contains("sockdrive") || config.to_ascii_lowercase().contains(".qcow2")}),
    )
}

pub fn read(path: &Path) -> Result<Vec<u8>> {
    ensure!(
        !fs::symlink_metadata(path)?.file_type().is_symlink(),
        "Selected source is a link"
    );
    let root = fs::canonicalize(path)?;
    if root.is_file() {
        ensure!(
            fs::metadata(&root)?.len() <= MAX_ZIP as u64,
            "Source exceeds transfer limit"
        );
        let mut bytes = Vec::new();
        fs::File::open(root)?
            .take(MAX_ZIP as u64 + 1)
            .read_to_end(&mut bytes)?;
        validate(&bytes)?;
        return Ok(bytes);
    }
    ensure!(root.is_dir(), "Source must be a ZIP or directory");
    let mut entries = Vec::new();
    collect(&root, &root, &mut entries, &mut 0, &mut 0)?;
    let mut zip = ZipWriter::new(Cursor::new(Vec::new()));
    let mut total = 0;
    for (name, path) in entries {
        zip.start_file(name, SimpleFileOptions::default())?;
        total += std::io::copy(
            &mut fs::File::open(path)?.take(MAX_EXPANDED - total + 1),
            &mut zip,
        )?;
        ensure!(
            total <= MAX_EXPANDED,
            "Directory grew beyond expanded limit while packing"
        );
    }
    let bytes = zip.finish()?.into_inner();
    validate(&bytes)?;
    Ok(bytes)
}

fn collect(
    root: &Path,
    path: &Path,
    entries: &mut Vec<(String, PathBuf)>,
    size: &mut u64,
    count: &mut usize,
) -> Result<()> {
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.path().symlink_metadata()?;
        ensure!(
            !metadata.file_type().is_symlink(),
            "Directory links are forbidden"
        );
        let name = entry
            .path()
            .strip_prefix(root)?
            .to_str()
            .context("Non-UTF-8 path")?
            .replace('\\', "/");
        relative(&name)?;
        *count += 1;
        ensure!(*count <= MAX_FILES, "Directory exceeds 4096 entries");
        if metadata.is_dir() {
            collect(root, &entry.path(), entries, size, count)?;
        } else if metadata.is_file() {
            *size = size
                .checked_add(metadata.len())
                .context("Directory size overflow")?;
            ensure!(*size <= MAX_EXPANDED, "Directory exceeds expanded limit");
            entries.push((name, entry.path()));
        } else {
            bail!("Special files are forbidden");
        }
    }
    entries.sort_by(|left, right| left.0.cmp(&right.0));
    Ok(())
}

pub fn create(config: &str) -> Result<Vec<u8>> {
    ensure!(
        !config.trim().is_empty() && config.len() <= 1024 * 1024,
        "Invalid config size"
    );
    let mut zip = ZipWriter::new(Cursor::new(Vec::new()));
    zip.start_file(".jsdos/dosbox.conf", SimpleFileOptions::default())?;
    zip.write_all(config.as_bytes())?;
    zip.start_file(".jsdos/jsdos.json", SimpleFileOptions::default())?;
    zip.write_all(br#"{"version":"8.5.3"}"#)?;
    Ok(zip.finish()?.into_inner())
}

pub fn publish(path: &Path, bytes: &[u8], replace: bool) -> Result<PathBuf> {
    let parent = fs::canonicalize(
        path.parent()
            .context("Destination requires a parent directory")?,
    )?;
    let destination = parent.join(
        path.file_name()
            .context("Destination requires a filename")?,
    );
    if let Ok(metadata) = fs::symlink_metadata(&destination) {
        ensure!(
            metadata.is_file() && !metadata.file_type().is_symlink(),
            "Destination is not a regular file"
        );
        ensure!(replace, "Destination exists; explicit replace is required");
    }
    let mut staging = tempfile::NamedTempFile::new_in(&parent)?;
    staging.write_all(bytes)?;
    staging.as_file().sync_all()?;
    if replace {
        staging.persist(&destination)?;
    } else {
        staging.persist_noclobber(&destination)?;
    }
    Ok(destination)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn safe_paths_and_archives() {
        for path in [
            "../escape",
            "/absolute",
            "C:/file",
            "a\\b",
            "a/../b",
            "a//b",
            "con.txt",
            "a.",
        ] {
            assert!(relative(path).is_err(), "{path}");
        }
        assert!(validate(b"not zip").is_err());
        let bytes = create("[autoexec]\necho READY").unwrap();
        assert!(validate(&bytes).is_ok());
        let root = tempfile::tempdir().unwrap();
        fs::create_dir(root.path().join(".jsdos")).unwrap();
        fs::write(root.path().join(".jsdos/dosbox.conf"), "[autoexec]").unwrap();
        fs::write(root.path().join("hello.txt"), "hello").unwrap();
        assert!(read(root.path()).is_ok());
        let destination = root.path().join("bundle.jsdos");
        publish(&destination, &bytes, false).unwrap();
        assert!(publish(&destination, b"bad", false).is_err());
        assert_eq!(fs::read(&destination).unwrap(), bytes);
        publish(&destination, b"replacement", true).unwrap();
        assert_eq!(fs::read(destination).unwrap(), b"replacement");
    }
    #[test]
    fn rejects_conflicts_links_and_bombs() {
        for names in [
            vec![".jsdos/dosbox.conf", "X", "x"],
            vec![".jsdos/dosbox.conf", "../x"],
            vec![".jsdos/dosbox.conf", "x", "x/y"],
        ] {
            let mut zip = ZipWriter::new(Cursor::new(Vec::new()));
            for name in names {
                zip.start_file(name, SimpleFileOptions::default()).unwrap();
                zip.write_all(b"data").unwrap();
            }
            assert!(validate(&zip.finish().unwrap().into_inner()).is_err());
        }
        let mut zip = ZipWriter::new(Cursor::new(Vec::new()));
        zip.add_symlink("link", "../outside", SimpleFileOptions::default())
            .unwrap();
        assert!(validate(&zip.finish().unwrap().into_inner()).is_err());
        assert!(validate(&vec![0; MAX_ZIP + 1]).is_err());
    }
    #[test]
    fn rejects_expansion_corruption_and_missing_config() {
        let mut bytes = create("[autoexec]\necho READY").unwrap();
        let central = bytes
            .windows(4)
            .position(|value| value == b"PK\x01\x02")
            .unwrap();
        bytes[22..26].copy_from_slice(&(MAX_EXPANDED as u32 + 1).to_le_bytes());
        bytes[central + 24..central + 28].copy_from_slice(&(MAX_EXPANDED as u32 + 1).to_le_bytes());
        assert!(
            validate(&bytes)
                .unwrap_err()
                .to_string()
                .contains("expanded limit")
        );
        let mut zip = ZipWriter::new(Cursor::new(Vec::new()));
        zip.start_file(
            ".jsdos/dosbox.conf",
            SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored),
        )
        .unwrap();
        zip.write_all(b"CRC_CHECK").unwrap();
        let mut bytes = zip.finish().unwrap().into_inner();
        let content = bytes
            .windows(9)
            .position(|value| value == b"CRC_CHECK")
            .unwrap();
        bytes[content] = b'X';
        assert!(validate(&bytes).is_err());
        let mut zip = ZipWriter::new(Cursor::new(Vec::new()));
        zip.start_file("hello.txt", SimpleFileOptions::default())
            .unwrap();
        zip.write_all(b"hello").unwrap();
        assert!(
            validate(&zip.finish().unwrap().into_inner())
                .unwrap_err()
                .to_string()
                .contains("Missing .jsdos/dosbox.conf")
        );
    }
    #[test]
    fn rejects_mismatched_local_and_central_paths() {
        let mut bytes = create("[autoexec]").unwrap();
        assert_eq!(&bytes[30..48], b".jsdos/dosbox.conf");
        bytes[30..48].copy_from_slice(b"../bad/dosbox.conf");
        assert!(validate(&bytes).is_err());
    }
    #[test]
    fn failed_publication_preserves_existing_data() {
        let root = tempfile::tempdir().unwrap();
        let destination = root.path().join("bundle.jsdos");
        let bytes = create("[autoexec]").unwrap();
        publish(&destination, &bytes, false).unwrap();
        let blocker = root.path().join("not-a-directory");
        fs::write(&blocker, b"original").unwrap();
        assert!(publish(&blocker.join("bundle.jsdos"), b"partial", true).is_err());
        assert_eq!(fs::read(&destination).unwrap(), bytes);
        assert_eq!(fs::read(&blocker).unwrap(), b"original");
        assert_eq!(fs::read_dir(root.path()).unwrap().count(), 2);
    }
}
