# Deployment

## Move latest version to named version

```sh
VERSION=<version-number>
mkdir /tmp/$VERSION
aws s3 --endpoint-url=https://storage.yandexcloud.net sync s3://jsdos/latest /tmp/$VERSION
aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read /tmp/$VERSION s3://jsdos/8.xx/$VERSION
rm -rf /tmp/$VERSION
```

## Release version

```
rm -rf build && \
    yarn run vite build --base /latest --sourcemap true --minify terser && \
    aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read \
    dist s3://jsdos/latest --delete 
```

Clear the CDN cache (v8.js-dos.com) in dashboard, pattern:
```
/latest,/latest/*
```

## DOS.Zone (early access) version

```
rm -rf build && \
    yarn run vite build --base /js-dos/latest --sourcemap true --minify terser && \
    python scripts/brotli-dist.py && \
    aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read \
    dist s3://br-bundles/js-dos/latest --delete 
```

Clear the CDN cache (br.cdn.js-dos.com) in dashboard, pattern:
```
/js-dos/latest,/js-dos/latest/*
```