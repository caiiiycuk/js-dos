---
id: dos-worker 
title: DOS Worker
---

DOS Worker is worker version of [DOS Direct](dos-direct.md) backend. It runs in own browser thread, so it's never 
block the browser. **This version is recommended to use in most cases.**

You can create it like this:
```js
const ci = await emulators.dosWorker(bundle);
```

Read [Estimating perfomrance](estimating-performance.md) if you want to compare perfomances of Direct and Worker versions/
