# Requirments

You need to put `emulators@beta` into `public/emulators`.


```
aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read \
    s3://jsdos/latest/emulators public/emulators
```

# Deployment

```
yarn run vite build --base /latest --sourcemap true --minify terser && \
    aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read \
    dist s3://jsdos/latest --delete 
```
