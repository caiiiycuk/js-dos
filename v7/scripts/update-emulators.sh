#!/bin/bash

yarn add emulators emulators-ui
rm -rf static/releases/latest
mkdir static/releases/latest
mkdir static/releases/latest/emulators
mkdir static/releases/latest/emulators-ui
cp -r node_modules/emulators/dist/* static/releases/latest/emulators
cp -r node_modules/emulators-ui/dist/* static/releases/latest/emulators-ui
