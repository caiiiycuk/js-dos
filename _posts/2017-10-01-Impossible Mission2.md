---
layout: post
title: Impossible Mission 2
showcase: true
keywords: Impossible Mission2,pc,game,javscript
description: Play in the Impossible Mission2 in browser.
permalink: Impossible Mission2/
---

Play in the legendary game **Impossible Mission 2** in browser. (Uploaded by: @cole)

{% include dosbox.html version="2" width="640" height="400" bg="Impossible Mission2.png" game="Impossible_Mission2" archive="/cdn/upload/Impossible Mission2-@cole.zip" exe="./impossible-mission-ii/IM2_EGA.EXE" %}

<!--more-->

{% include details.html name="Impossible Mission 2" createdat="1988" publisher="Epyx" category="Action" %}



### Source

{% highlight html linenos %}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Impossible Mission2</title>
    <style type="text/css">
      .dosbox-container { width: 640px; height: 400px; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/Impossible Mission2.png); }
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
          dosbox.run("upload/Impossible Mission2-@cole.zip", "./IM.COM");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{% endhighlight %}
