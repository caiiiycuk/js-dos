---
layout: post
title: Digger
showcase: true
keywords: digger,pc,game,javscript
description: Play the legendary game Digger in browser.
permalink: getting-started/
showfull: true
---

In getting started tutorial we will launch [Digger]({% post_url 2015-10-14-getting-started %}) game in browser.

<div id="digger"></div>

<script type="text/javascript" src="http://js-dos.com/cdn/js-dos-api.js"></script>
<script type="text/javascript">
  var dosbox = new Dosbox({
    id: "digger",
    onload: function (dosbox) {
      dosbox.run("http://js-dos.com/cdn/digger.zip", "./DIGGER.COM");
    },
    onrun: function (dosbox, app) {
      console.log("App '" + app + "' is runned");
    }
  });
</script>

<!--more-->

### Details

<div itemscope itemtype="http://schema.org/VideoGame">
  <meta itemprop="playMode" content="SinglePlayer">
  <ul>
    <li><span itemprop="name">Digger</span> was created in 1983</li>
    <li><span class="gray">Creator</span> <span itemtype="http://schema.org/publisher">Windmill Software</span></li>
    <li><span class="gray">Category</span> Arcade</li>
    <li itemscope itemtype="http://schema.org/AggregateRating" itemprop="aggregateRating"><span class="gray">Age rating</span> +<span itemprop="ratingValue">0</span></li>
    <li itemprop="gamePlatform"><span class="gray">Platform</span> PC</li>
  </ul>
</div>

Digger is one of the first PC game. The game was created in 1983. Let`s try to bring this legendary game in our time.

To run this game in browser you will need a zip archive with game, and a server that can host static web page. You can start with the [plunker template](http://plnkr.co/edit/yoEIKQ?p=preview):

```html
  <!doctype html>
  <html lang="en-us">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>js-dos api</title>
      <style type="text/css">
        .dosbox-container { width: 640px; height: 400px; }
      </style>
    </head>
    <body>
      <div id="dosbox"></div>
      <br/>
      <button onclick="dosbox.requestFullScreen();">Make fullscreen</button>
      
      <script type="text/javascript" src="http://js-dos.com/cdn/js-dos-api.js"></script>
      <script type="text/javascript">
        var dosbox = new Dosbox({
          id: "dosbox",
          onload: function (dosbox) {
            dosbox.run("http://js-dos.com/cdn/digger.zip", "./DIGGER.COM");
          },
          onrun: function (dosbox, app) {
            console.log("App '" + app + "' is runned");
          }
        });
      </script>
    </body>
  </html>
```

First of all we should prepare viewport where dosbox will render the game. Look at line 8 we set the `dosbox-container` size to 640x400 px. This means that Digger will runs in screen with resolution 640x400 px.

At line 16 the `js-dos-api.js` was included. After processing this line, browser will download js-dos internals and prepare js-dos engine to work.

Finally we should bootstrap Digger game in browser.

```js
  var dosbox = new Dosbox({
    id: "dosbox",
    onload: function (dosbox) {
      dosbox.run("http://js-dos.com/cdn/digger.zip", "./DIGGER.COM");
    },
    onrun: function (dosbox, app) {
      console.log("App '" + app + "' is runned");
    }
  });
```

* *id* - a HTML element id where dosbox will create the dosbox canvas
* *onload* - a callback that was called when dosbox is initialized
* *onrun* - a callback that was called when dos application was runned

On line 4 we actually start the game:

```js
  dosbox.run("http://js-dos.com/cdn/digger.zip", "./DIGGER.COM");
```

* First argument is the place where archive with digger is located
* Second argument is a executable file name

Now you can run Digger or any other dos game in browser.

Have fun!