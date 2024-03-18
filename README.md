# js-dos v8
[![Build](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml/badge.svg?branch=8.xx)](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml)

The **next** major version of js-dos. 

**Not production ready. [Please use 7.xx for production.](https://github.com/caiiiycuk/js-dos/tree/7.xx)**

[![Watch the video](https://github.com/caiiiycuk/js-dos/assets/1727152/a2b481cb-43b1-44aa-8b71-2181d351bb1a)](https://youtu.be/lhFrAe5YrJE)

# Development

## Install dependencies

You need to install node dependencies and put `emulators@beta` into `public/emulators`.

```
yarn
cp -rv node_modules/emulators/dist/* public/emulators
```

## Development

Frontend is written in preact + vite.
Run `yarn run vite` and open [http://localhost:3000](http://localhost:3000) js-dos is ready!
