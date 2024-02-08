# js-dos v8
[![Build](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml/badge.svg?branch=8.xx)](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml)

The **next** major version of js-dos. 

**Not production ready. [Please use 7.xx for production.](https://github.com/caiiiycuk/js-dos/tree/7.xx)**

[![Watch the video](https://github.com/caiiiycuk/js-dos/assets/1727152/a2b481cb-43b1-44aa-8b71-2181d351bb1a)](https://youtu.be/lhFrAe5YrJE)

# Requirments

You need to put `emulators@beta` into `public/emulators`.

```
cp -rv node_modules/emulators/dist/* public/emulators
```

# Deployment

```
yarn run vite build --base /latest --sourcemap true --minify terser && \
    aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read \
    dist s3://jsdos/latest --delete 
```
