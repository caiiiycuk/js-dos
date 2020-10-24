---
id: estimating-performance
title: Esitmating emulators performance
---
import useBaseUrl from '@docusaurus/useBaseUrl';

## Performance testing

To measure performance we used variant of Dhrystone 2 Test originally taken from this [page](http://www.roylongbottom.org.uk/dhrystone%20results.htm). Original version used `clock()` to calculate delta time. Which is good for real pc, but does not very accurate for dosbox emulator. When `clock()` call happened modified version send `~>dtime` marker to stdout which intercepted by test page and used to calculate delta time with `performance.now()` from browser. Source code of modified test is [here](https://github.com/caiiiycuk/js-dos/tree/6.22/programms/dhry2).

Basically this test produce a lot of int operations and measure amount of operations (Dhrystones) produced per second. Output is a `VAX MIPS RATING` which is Drhystones per second divided by 1757 (is as DEC VAX 11/780 result).

`js-dos bundle` with this test can be found on [Test](https://talks.dos.zone/t/dhrystone-2-test-jul-2020/37086) page.

## Running the test


You can estimate performance of your device [here](https://dos.zone/en/my).

Example output:

<img alt="Result" src={useBaseUrl('img/emulators-logo.jpg')} />

## Implementing the test

To run this test we should use `emulators.js` (from emulators) and use our `js-dos bundle` to start test.

```html
<script src="/v7/build/releases/latest/emulators/emulators.js"></script>
// ...
<script>
  emulators.pathPrefix = "/v7/build/releases/latest/emulators/";
```

You can start test in [worker](dos-worker.md) or [direct](dos-direct.md) mode:
```js
// promise is resolved when emulator is started
const ci = await (options.worker ?
  emulators.dosWorker(bundle) :
  emulators.dosDirect(bundle));
```

In worker mode each test will run in new worker. If you press `Start Worker` multiple times,
then you will see output from multiple threads. In direct mode browser will probably hangs.
In theory direct mode is faster, but browser will be unstable. Our recomendation is to use worker
mode all time.

Complete example:

```html title="examples/dhry2.html"
{}
```


