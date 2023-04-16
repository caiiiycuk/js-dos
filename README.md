# Deployment

```
yarn run vite build --base latest --sourcemap true --minify terser && \
    aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read dist s3://jsdos/latest --delete 
```