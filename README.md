# Deployment

```
yarn run vite build --base latest && \
    aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read dist s3://jsdos/latest --delete 
```