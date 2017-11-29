---
layout: post
title: Duke Nukem 3D
showcase: true
keywords: Duke Nukem 3d,pc,game,javscript
description: Play in the Duke Nukem 3d in browser.
permalink: Duke Nukem 3d/
---

Play in the legendary game **Duke Nukem 3D** in browser. (Uploaded by: @digitalwalt)

{% include dosbox.html version="2" width="640" height="400" bg="Duke Nukem 3d.png" game="Duke_Nukem_3d" archive="/cdn/upload/Duke Nukem 3d-@digitalwalt.zip" exe="./DUKE3D/DUKE3D.EXE" %}

<!--more-->

{% include details.html name="Duke Nukem 3D" createdat="1996" publisher="3D Realms" category="FPS" %}



### Source

{% highlight html linenos %}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Duke Nukem 3d</title>
    <style type="text/css">
      .dosbox-container { width: 640px; height: 400px; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/Duke Nukem 3d.png); }
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
          dosbox.run("upload/Duke Nukem 3d-@digitalwalt.zip", "/DUKE3D.EXE");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{% endhighlight %}
