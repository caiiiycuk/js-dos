/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

let emulators = {};
if (typeof window !== 'undefined') {
    emulators = window.emulators;
    emulators.pathPrefix = "/v7/build/releases/latest/emulators/";
}

// Add react-live imports you need here
const ReactLiveScope = {
    React,
    ...React,
    emulators
};

export default ReactLiveScope;
