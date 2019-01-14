#!/usr/bin/sh

mkdir travis-build
cd travis-build
emcmake cmake ..
make
mkdir ../build
cp wdosbox.* ../build