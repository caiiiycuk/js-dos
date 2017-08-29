---
layout: post
title: Donkey Kong
showcase: true
keywords: Donkey Kong,pc,game,javscript
description: Play in the Donkey Kong in browser.
permalink: Donkey Kong/
---

Play in the legendary game **Donkey Kong** in browser. (Uploaded by: @megalanya)

{% include dosbox.html game="donkey_kong" version="2" width="640" height="400" bg="Donkey Kong 1983.png" archive="/cdn/upload/Donkey Kong 1983-@megalanya.zip" exe="./dkong.exe" %}

<!--more-->

{% include details.html name="Donkey Kong" createdat="1981" publisher="Nintendo" category="Arcade" %}


### Source

{% highlight html linenos %}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Donkey Kong 1983</title>
    <style type="text/css">
      .dosbox-container { width: 640px; height: 400px; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/Donkey Kong 1983.png); }
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
          dosbox.run("upload/Donkey Kong 1983-@megalanya.zip", "./dkong.exe");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{% endhighlight %}
