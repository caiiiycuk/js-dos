# js-dos v8
[![Build](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml/badge.svg)](https://github.com/caiiiycuk/js-dos/actions/workflows/build.yml)

The next major version of js-dos.

[![Watch the video](https://img.youtube.com/vi/lhFrAe5YrJE/hqdefault.jpg)](https://youtu.be/lhFrAe5YrJE)

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
