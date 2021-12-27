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

To run DOS program we need to install `js-dos` package, and copy contents of `dist` folders
to `public/js-dos` directory.
```sh
yarn add js-dos
cp -r node_modules/js-dos/dist public/js-dos
```

Resulting folder structure should be:
```sh
public/digger.jsdos    - digger js-dos bundle
public/js-dos/*        - js-dos package contents
```

js-dos package is built on top of emulators-ui package, because of that to have correct types in TypeScript you also need to install emulators-ui package (it will be used only for type checking).

```sh
yarn add emulators-ui
```

Next we need to modify `public/index.html` of react app to add js-dos scripts and styles.
```html
  <head>
    <!-- ... -->
    <script src="%PUBLIC_URL%/js-dos/js-dos.js"></script>
    <link rel="stylesheet" href="%PUBLIC_URL%/js-dos/js-dos.css">
    <script>
       emulators.pathPrefix = "%PUBLIC_URL%/js-dos/";
    </script>
```

<br/>

:::info

Currently, js-dos v7 packages provides only types information, you can't import actual implementation as 
js module.

You need to set `emulators.pathPrefix` to point actual path to emulators, you can do this in `index.html` or in 
react component.

:::

## Creating DOS component

Let's implement a React component that can run a DOS program. Create file `src/dos-player.tsx`.

Import type information and declare emulators in component module:

```tsx
import { DosPlayer as Instance, DosPlayerFactoryType } from "js-dos";

declare const Dos: DosPlayerFactoryType;
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
    const [dos, setDos] = useState<Instance | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;
        const instance = Dos(root);

        setDos(instance);

        return () => {
            instance.stop();
        };
    }, [rootRef]);
```

:::info

Do not forget to free resources by calling instance.stop at the end.

:::

Finally, we should run our program when dos are set:

```tsx
    useEffect(() => {
        if (dos !== null) {
            dos.run(props.bundleUrl); // ci is returned
        }
    }, [dos, props.bundleUrl]);
```

Full component code:
```tsx
import React, { useEffect, useRef, useState } from "react";

import { DosPlayer as Instance, DosPlayerFactoryType } from "js-dos";

declare const Dos: DosPlayerFactoryType;

interface PlayerProps {
    bundleUrl: string;
}

export default function DosPlayer(props: PlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    const [dos, setDos] = useState<Instance | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;
        const instance = Dos(root);

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
