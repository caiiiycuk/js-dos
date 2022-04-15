# js-dos 7.xx
[![Build](https://github.com/caiiiycuk/js-dos/workflows/Build/badge.svg)](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml)

js-dos is a javascript library that allows you to run DOS programs in browser. It was designed from the ground up to be easily installed and used to get your DOS program up and running in browser quickly.

```js
    Dos(element).run("game.jsdos")
```

[Documentation](https://js-dos.com/)

## Quick start with create-dosbox

Create js-dos web page with no build configuration.

```sh
npx create-dosbox my-app
cd my-app
npm install
npm start
---
Open localhost:8080 in browser
```

You will be prompted to select game that you want bootstrap.

If you've previously installed `create-dosbox` globally via `npm install -g create-dosbox`, we recommend you uninstall the package using `npm uninstall -g create-dosbox` or `yarn global remove create-dosbox` to ensure that npx always uses the latest version.

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

Then open [http://localhost:8080/](http://localhost:8080/) to see your app.<br>

<p align='center'>
<img src='https://github.com/js-dos/create-dosbox/raw/master/npx-create-dosbox.gif' width='600' alt='npm start'>
</p>

It will create a directory called `my-app` inside the current folder.<br>
Inside that directory, it will generate the initial project structure:

```
my-app
├── package.json
└── _site
    ├── js-dos
    ├── bundle.jsdos
    └── index.html
```

No configuration or complicated folder structures, only the files you need to build your app.<br>

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

## Community

Ask a technical question in [Q&A](https://talks.dos.zone/c/questions-answers/).

* [Discord](https://discord.com/invite/hMVYEbG)
* [Twitter](https://twitter.com/intent/user?screen_name=doszone_db)
* [Telegram](https://t.me/doszone)

## Building

To build whole project do:
```
yarn
NODE_ENV=production yarn run gulp
```

Also, you can build js and css separately:

```
yarn run gulp js
yarn run gulp css
```

## Example

To run built-in example do:

```
hs .
firefox examples/digger/index.html
```

# Older releases

* [js-dos 6.22](https://js-dos.com/index_6.22.html)
* [js-dos 3.xx](https://js-dos.com/index_v3.html)
