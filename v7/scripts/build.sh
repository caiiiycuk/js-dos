#!/bin/bash

#./scripts/update-emulators.sh
NODE_ENV=production yarn build
./scripts/copy.sh