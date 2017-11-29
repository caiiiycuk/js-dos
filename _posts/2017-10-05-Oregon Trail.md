---
layout: post
title: Oregon Trail
showcase: true
keywords: Oregon Trail,pc,game,javscript
description: Play in the Oregon Trail in browser.
permalink: Oregon Trail/
---

Play in the legendary game **Oregon Trail** in browser. (Uploaded by: @dirtydanisreal)

{% include dosbox.html version="2" width="640" height="480" bg="Oregon Trail.png" game="Oregon_Trail" archive="/cdn/upload/Oregon Trail-@dirtydanisreal.zip" exe="oregon-trail-deluxe/oregondlx/OREGON.EXE" %}

<!--more-->

{% include details.html name="Oregon Trail" createdat="1992" publisher="MECC" category="Travel" %}



### Source

{% highlight html linenos %}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Oregon Trail</title>
    <style type="text/css">
      .dosbox-container { width: 640px; height: 400px; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/Oregon Trail.png); }
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
          dosbox.run("upload/Oregon Trail-@dirtydanisreal.zip", "./OREGONTRAIL.COM");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{% endhighlight %}
