---
layout: post
title: Action Fighter
showcase: true
keywords: action fighter,pc,game,javscript
description: Play in the action fighter in browser.
permalink: action fighter/
---

Play in the legendary game **Action Fighter** in browser. (Uploaded by: dapperdann)

{% include dosbox.html version="2" width="640" height="400" bg="action fighter.png" game="action_fighter" archive="/cdn/upload/action fighter-dapperdann.zip" exe="./afighter/ACT_EGA.EXE" %}

<!--more-->

{% include details.html name="Action Fighter" createdat="1989" publisher="Sega" category="Racing,Shooter" %}



### Source

{% highlight html linenos %}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>action fighter</title>
    <style type="text/css">
      .dosbox-container { width: 640px; height: 400px; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/action fighter.png); }
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
          dosbox.run("upload/action fighter-dapperdann.zip", "./actionfighter.com");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{% endhighlight %}
