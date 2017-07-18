#!/usr/bin/python3.5
import re
import os
import datetime
from bottle import request, post, run, HTTPResponse

MAX_SIZE = 10 * 1024 * 1024 # 10MB
BUF_SIZE = 8192

def successpage(message):
  template = """
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Successful</title>
  </head>
  <body>
    <h1>Successful...</h1>
    If all ok with archive, game will appear on site in short time.
    If you want to get feedback about publishing process, then please
    fill issue on github with this message: <br/>
    <b>%s</b>
  </body
</html>
"""

  return template % message

def errorpage(message):
  template = """
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>400 (Bad Request)</title>
  </head>
  <body>
    <h1>Sorry, but...</h1>
    %s
  </body
</html>
"""

  return template % message


@post('/uploadgame')
def do_uploadgame():
  targetzip = None
  targetmd = None
  today = datetime.date.today()
  try:
    author = request.forms.get('author')
    game = request.forms.get('game')
    executable = request.forms.get('executable')
    resolution = request.forms.get('resolution')
    archive = request.files.get('archive')

    if (any(len(item) == 0 for item in [author, game, executable, resolution]) or
            archive == None):
      raise Exception("All fileds are required")

    name, ext = os.path.splitext(archive.filename)
    if ext != '.zip':
      return "Archive should be a Zip file"

    targetzip = "upload/%s-%s.zip" % (game, author)
    targetmd = "upload/%s-%s.md" % (today.strftime('%Y-%m-%d'), game)
    content = generate(author, game, executable, resolution, targetzip)

    with open(targetmd, 'w') as f:
      f.write(content)

    with open(targetzip, 'wb') as f:
      data_blocks = []
      byte_count = 0

      buf = archive.file.read(BUF_SIZE)
      while buf:
        byte_count += len(buf)

        if byte_count > MAX_SIZE:
          raise Exception("Request entity too large (max: %s bytes)" % str(MAX_SIZE))

        f.write(buf)
        buf = archive.file.read(BUF_SIZE)

    return successpage("Feedback for %s" % targetmd)
  except Exception as e:
    if os.path.isfile(targetzip): os.remove(targetzip)
    if os.path.isfile(targetmd): os.remove(targetmd)

    return HTTPResponse(status=400, body=errorpage(e.args[0]))


def generate(author, game, executable, resolution, archive):
  match = re.search(r'(\d+)x(\d+)', resolution)
  if match == None:
    raise Exception("Resolution should be WIDTHxHEIGHT")

  width = match.group(1)
  height = match.group(2)

  template = """---
layout: post
title: %s
showcase: true
keywords: %s,pc,game,javscript
description: Play in the %s in browser.
permalink: %s/
---

Play in the legendary game **%s** in browser. (Uploaded by: %s)

{%% include dosbox.html game="%s" archive="/cdn/%s" exe="%s" %%}

<!--more-->

{%% include details.html name="%s" createdat="???" publisher="???" category="???" %%}

???

### Source

{%% highlight html linenos %%}
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>%s</title>
    <style type="text/css">
      .dosbox-container { width: %spx; height: %spx; }
      .dosbox-container > .dosbox-overlay { background: url(https://js-dos.com/cdn/%s.png); }
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
          dosbox.run("%s", "%s");
        },
        onrun: function (dosbox, app) {
          console.log("App '" + app + "' is runned");
        }
      });
    </script>
  </body>
</html>
{%% endhighlight %%}
"""

  return template % (game, game, game, game, game, author, game, archive, executable,
                     game, game, width, height, game, archive, executable)

run(host='localhost', port=9000, debug=False)
