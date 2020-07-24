---
id: estimating-performance
title: Esitmating emulators performance
---

## Performance testing

To measure performance we used variant of Dhrystone 2 Test originally taken from this [page](http://www.roylongbottom.org.uk/dhrystone%20results.htm). Original version used `clock()` to calculate delta time. Which is good for real pc, but does not very accurate for dosbox emulator. When `clock()` call happened modified version send `~>dtime` marker to stdout which intercepted by test page and used to calculate delta time with `performance.now()` from browser. Source code of modified test is [here](https://github.com/caiiiycuk/js-dos/tree/6.22/programms/dhry2).

Basically this test produce a lot of int operations and measure amount of operations (Dhrystones) produced per second. Output is a `VAX MIPS RATING` which is Drhystones per second divided by 1757 (is as DEC VAX 11/780 result).

## Creating js-dos bundle

To use this test progam we need to create `js-dos bundle`.
Please open in new tab [bundle generator](https://dos.zone/en/studio). 
Click on `Browse` button, and choose [program archive](../bundles/dhry2.zip).

![Browser button](../img/bundle_guide_1.jpg)

Next, you need to select executable that will be runned when DOS emulator starts. Please select `dhry_2.exe`.

![Select executable](../img/bundle_guide_2.jpg)

On next step you can change various of dosbox options, but usually defaults is pretty good. But for this guide we need 
to set cpu emulation to maximum speed, please scroll down to cpu section and set `max` option.

![Cpu maximum](../img/bundle_guide_5.jpg)

Then scroll down and press `create archive`.

![Create archive](../img/bundle_guide_3.jpg)

Finally, you can download `js-dos bundle`.

![Download archive](../img/bundle_guide_4.jpg)

You can download [precreated bundle](../bundles/dhry2.jsdos) for test.
## Running the test

To run this test we need import `emulators.js` and use our `js-dos bundle` to start test.

```js live
declare const emulators: any;

function EstimateTest() {
  // we need to set prefix where emulator wasm is located
  emulators.pathPrefix = "/v7/build/releases/latest/emulators/";

  let runId = 0;
  function runBundle(bundle) {
    const id = runId++;
    const stdout = document.getElementById("stdout");

    // here you can use also dosDirect
    emulators.dosWorker(bundle)
      // promise is resolved when emulator is started 
      .then((ci) => {
        const time = [0, 0];
        let timeIndex = 0;
        let runs = 10000; 
        // listen program outpus for `~>dtime` marker
        ci.events().onStdout((message) => {
          if (message.indexOf("~>dtime") === -1) {
            return;
          }
          
          time[timeIndex++] = performance.now();
          if (timeIndex === 2) {
            const delta = time[1] - time[0];
            stdout.innerHTML += (id) + ": " + runs + " runs, browser time " + delta + " ms, " +
                 "VAX rating " + (runs * 1000 / delta / 1757) + "\n";
            runs *= 2;
            timeIndex = 0;
               
            if (delta > 3000) {
              //properly exit
              ci.exit();
             }
            }
        });
      });
  }

  function onClick() {
    const bundleUrl = "../bundles/dhry2.jsdos";

    // we need to download bundle, emulators accept only Uint8Array
    const xhr = new XMLHttpRequest();
    xhr.open("GET", bundleUrl, true);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // do not forget to create Uint8Array, 
        // arraybuffer will not work!
        runBundle(new Uint8Array(xhr.response));
      }
    };
    xhr.send();
  };
  
  return (
    <div>
      <button onClick={onClick}>Start</button>
      <pre id="stdout"></pre>
    </div>
  );
}
```


Try to change `dosWorker` to `dosDirect` and see how result is changing.
In worker mode each test will run in new worker. If you press `Start` multiple times,
then you will see output from multiple threads. In direct mode browser will probably hangs.

