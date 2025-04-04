#!/usr/bin/env python3

import os
import subprocess
from pathlib import Path

def brotli_compress_file(file_path):
    try:
        subprocess.run(['brotli', '-Zf', file_path], check=True)
        os.remove(file_path)
        if (file_path.endswith(".js") or file_path.endswith(".wasm") or file_path.endswith(".css")):
            os.rename(file_path + '.br', file_path + ".ea")
        else:
            os.rename(file_path + '.br', file_path)
        print(f"Compressed {file_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error compressing {file_path}: {e}")

def main():
    dist_dir = Path('dist')
    
    if not dist_dir.exists():
        print("Error: dist directory not found")
        return

    # Walk through all files in dist directory
    for root, dirs, files in os.walk(dist_dir):
        # Skip types subfolder
        if 'types' in root:
            continue
            
        for file in files:
            file_path = os.path.join(root, file)
            # Skip if file is already brotli compressed
            if not file_path.endswith('.br'):
                brotli_compress_file(file_path)
if __name__ == '__main__':
    main()
