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
rm -rf dist && \
    yarn run vite build --base /latest --sourcemap true --minify terser && \
    AWS_SHARED_CREDENTIALS_FILE="$HOME/.aws.yandex/credentials" AWS_CONFIG_FILE="$HOME/.aws.yandex/config" aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read \
    dist s3://jsdos/latest --delete 
```

Clear the CDN cache (v8.js-dos.com) in dashboard, pattern:
```
/latest,/latest/*
```

## DOS.Zone (early access) version


### Move latest version to named version

```sh
VERSION=<version-number>
mkdir /tmp/$VERSION
aws s3 --endpoint-url=https://storage.yandexcloud.net sync s3://br-bundles/js-dos/latest /tmp/$VERSION
aws s3 --endpoint-url=https://storage.yandexcloud.net sync --acl public-read /tmp/$VERSION s3://br-bundles/js-dos/8.xx/$VERSION
rm -rf /tmp/$VERSION
```

### Deploy new one
```
./scripts/deploy-dz.sh
```

Clear the CDN cache (br.cdn.js-dos.com) in dashboard, pattern:
```
/js-dos/latest/js-dos.js.ea
/js-dos/latest/js-dos.js.map
/js-dos/latest/js-dos.css
/js-dos/latest/emulators/emulators.js.ea
/js-dos/latest/emulators/emulators.js.map
/js-dos/latest/emulators/file-explorer.css.ea
/js-dos/latest/emulators/file-explorer.js.ea
/js-dos/latest/emulators/fileexplorer_actions.woff
/js-dos/latest/emulators/fileexplorer_sprites.png
/js-dos/latest/emulators/wdosbox-x-jspi.js.ea
/js-dos/latest/emulators/wdosbox-x-jspi.js.symbols
/js-dos/latest/emulators/wdosbox-x-jspi.wasm.ea
/js-dos/latest/emulators/wdosbox-x-dbg.js.ea
/js-dos/latest/emulators/wdosbox-x-dbg.js.symbols
/js-dos/latest/emulators/wdosbox-x-dbg.wasm.ea
/js-dos/latest/emulators/wdosbox-x.js.ea
/js-dos/latest/emulators/wdosbox-x.js.symbols
/js-dos/latest/emulators/wdosbox-x.wasm.ea
/js-dos/latest/emulators/wdosbox.js.ea
/js-dos/latest/emulators/wdosbox.js.symbols
/js-dos/latest/emulators/wdosbox.wasm.ea
/js-dos/latest/emulators/webrtcnet.mjs.ea
/js-dos/latest/emulators/webrtcnet.wasm.ea
/js-dos/latest/emulators/wlibzip.js.ea
/js-dos/latest/emulators/wlibzip.js.symbols
/js-dos/latest/emulators/wlibzip.wasm.ea
```

### Deploy nigthly

```
./scripts/deploy-dz-nightly.sh
```

Clear the CDN cache (br.cdn.js-dos.com) in dashboard, pattern:
```
/js-dos/nightly,/js-dos/nightly/*
```
