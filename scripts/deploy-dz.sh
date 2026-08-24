#!/bin/bash

set -ex

rm -rf dist

yarn run vite build --base /js-dos/latest --sourcemap true --minify terser

rm dist/emulators/sockdrive*
python scripts/brotli-dist.py

rclone copy dist br-bundles:68bbc47d0de7-br-bundles/js-dos/latest \
  --s3-acl public-read --size-only --transfers 32 --checkers 32 --fast-list \
  --stats 30s --stats-one-line --stats-log-level NOTICE
