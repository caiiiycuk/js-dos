---
id: react
title: In React (TypeScript)
---

## Bootstrapping application

In this example we will create react component that can start any [js-dos bundle](jsdos-bundle).

Let's start with creating TypeScript react app. Execute following command:
```sh
yarn create react-app my-app --template typescript
cd my-app
```

Next we need to download Digger [jsdos bundle](jsdos-bundle) into `public` directory:
```sh
curl https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos -o public/digger.jsdos
```

To run DOS program we need to install `emulators` and `emulators-ui` packages, and copy their `dist` folders
to `public` directory.
```sh
yarn add emulators emulators-ui
cp -r node_modules/emulators/dist public/emulators
cp -r node_modules/emulators-ui/dist public/emulators-ui
```

Resulting folder structure should be:
```sh
public/digger.jsdos    - digger js-dos bundle
public/emulators/*     - emulators package contents
public/emulators-ui/*  - emulators-ui package contents
```

Next we need to modify `public/index.html` of react app to add js-dos scripts and styles.
```html
  <head>
    <!-- ... -->
    <script src="%PUBLIC_URL%/emulators/emulators.js"></script>
    <script src="%PUBLIC_URL%/emulators-ui/emulators-ui.js"></script>
    <link rel="stylesheet" href="%PUBLIC_URL%/emulators-ui/emulators-ui.css">
    <script>
       emulators.pathPrefix = "%PUBLIC_URL%/emulators/";
    </script>
```

:::note

Currently js-dos v7 packages provides only types information, you can't import actual implementation as 
js module.

You need to set `emulators.pathPrefix` to point actual path to emulators, you can do this in `index.html` or in 
react component.

:::

## Creating DOS component

Now we can implement a React component that can play DOS program. Let's edit file `src/dos-player.tsx`.

Importing type information and emulators in component module:

```tsx
import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";

declare const Dos: DosFactoryType;
```

Props of the component will have only url to `js-dos bundle`. To embed js-dos we need to create root div
component:

```tsx
interface PlayerProps {
    bundleUrl: string;
}

export default function DosPlayer(props: PlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    return <div ref={rootRef} style={{ width: "100%", height: "100%" }}>
    </div>;
}
```

When root div will be ready we will create a `DosInstance` in it:
```tsx
    const [dos, setDos] = useState<DosInstance | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;

        const instance = Dos(root, {
            emulatorFunction: "dosWorker",
        });

        setDos(instance);

        return () => {
            instance.stop();
        };
    }, [rootRef]);
```

:::note

Do not forget to free resources by calling instance.stop at the end.

:::

Finally we should run our program when dos is set:

```tsx
    useEffect(() => {
        if (dos !== null) {
            dos.run(props.bundleUrl); // ci is returned
        }
    }, [dos, props.bundleUrl]);
```

Full component code:
```tsx
import React, { useRef, useEffect, useState } from "react";

import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";

declare const Dos: DosFactoryType;

interface PlayerProps {
    bundleUrl: string;
}

export default function DosPlayer(props: PlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [dos, setDos] = useState<DosInstance | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;

        const instance = Dos(root, {
            emulatorFunction: "dosWorker",
        });

        setDos(instance);

        return () => {
            instance.stop();
        };
    }, [rootRef]);

    useEffect(() => {
        if (dos !== null) {
            dos.run(props.bundleUrl); // ci is returned
        }
    }, [dos, props.bundleUrl]);

    return <div ref={rootRef} style={{ width: "100%", height: "100%" }}>
    </div>;
}
```

## Using DosPlayer component

You can use this component as any other React component. Let's replace `src/app.tsx` contents with our player:

```tsx
import React from 'react';
import './App.css';

import DosPlayer from "./dos-player";

function App() {
  return (
    <div className="App" style={{ width: "640px", height: "400px" }}>
        <DosPlayer bundleUrl="digger.jsdos" />
    </div>
  );
}

export default App;
```


Now you can run the app and play Digger! Just type `yarn start`.
