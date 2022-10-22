#!/bin/bash

yarn add emulators@latest emulators-ui@latest js-dos@latest
rm -rf static/releases/latest
mkdir static/releases/latest
mkdir static/releases/latest/emulators
mkdir static/releases/latest/emulators-ui
mkdir static/releases/latest/js-dos

cp -r node_modules/emulators/dist/* static/releases/latest/emulators
cp -r node_modules/emulators-ui/dist/* static/releases/latest/emulators-ui
cp -r node_modules/js-dos/dist/* static/releases/latest/js-dos
