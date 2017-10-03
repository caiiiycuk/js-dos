---
layout: post
title: The Elder Scrolls Arena
showcase: true
keywords: Elderscrolls Arena,pc,game,javscript
description: Play in the Elderscrolls Arena in browser.
permalink: Elderscrolls Arena/
---

Play in the legendary game **The Elder Scrolls Arena** in browser. (Uploaded by: @GL1TCH43V3R)

{% include dosbox.html version="2" width="640" height="400" bg="Elderscrolls Arena.png" game="Elderscrolls_Arena" archive="/cdn/upload/Elderscrolls Arena-@GL1TCH43V3R.zip" exe="arena.bat" %}

<!--more-->

{% include details.html name="The Elder Scrolls Arena" createdat="1994" publisher="Bethesda Softworks" category="Action RPG" %}



### Source

{% highlight html linenos %}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Elderscrolls Arena</title>
    <style type="text/css">
      .dosbox-container { width: 640px; height: 400px; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/Elderscrolls Arena.png); }
    </style>
  </head>
  <body>
    <div id="dosbox"></div>
    <br/>
    <button onclick="dosbox.requestFullScreen();">Make fullscreen</button>
    
    <script type="text/javascript" src="https://js-dos.com/cdn/js-dos-api.js"></script>
    <script type="text/javascript">
      var dosbox = new Dosbox({
        id: "dosbox",
        onload: function (dosbox) {
          dosbox.run("upload/Elderscrolls Arena-@GL1TCH43V3R.zip", "arena.bat");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{% endhighlight %}
