---
id: create-dosbox
title: npx create-dosbox
---
import useBaseUrl from '@docusaurus/useBaseUrl';

create-dosbox
=============

`create-dosbox` is an npx command to fast setup js-dos v7 web page with no build configuration.

create-dosbox works on macOS, Windows, and Linux.
If something doesn’t work, please [file an issue](https://github.com/caiiiycuk/js-dos/issues/new).

## Quick Overview

```sh
npx create-dosbox my-app
cd my-app
npm install
npm start
---
Open localhost:8080 in browser
```

You will be prompted to select game that you want bootstrap.

Then open [http://localhost:8080/](http://localhost:8080/) to see your app.

<img alt="Result" src={useBaseUrl('img/npx-create-dosbox.gif')} />


It will create a directory called `my-app` inside the current folder.
Inside that directory, it will generate the initial project structure:

```
my-app
├── package.json
└── _site
    ├── js-dos
    ├── bundle.jsdos
    └── index.html
```

No configuration or complicated folder structures, only the files you need to build your app.

* **js-dos** - contains last release version of js-dos that you can download from [Releases](https://github.com/caiiiycuk/js-dos/releases) page
* **bundle.jsdos** - is a bundle with game to start [read more](https://js-dos.com/v7/build/docs/jsdos-bundle)
* **index.html** - is a web page template

So, you can host `_site `on static web server no other dependincies is needed.

Once the installation is done, you can open your project folder:

```sh
cd my-app
```

Inside the newly created project, you can run some built-in commands:

```sh
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080) to view it in the browser.
