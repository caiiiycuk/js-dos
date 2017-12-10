#!/usr/bin/python3.5

import sys
import os
import re
import paramiko
import fileinput
import subprocess
import shutil

with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'auth'), 'r') as f:
  auth = f.read().split("\n")

username = auth[0]
hostname = auth[1]
password = auth[2]
port = 22

root = '/var/www/js-dos.com.git/backend'
upload = os.path.join(root, 'upload')
_upload = os.path.join(root, '..', '_upload')
_posts = os.path.join(root, '..', '_posts')
_cdn = os.path.join(root, '..', 'cdn')

def extract_meta_from_md(contents):
  title = re.search(r'title: (.*)', contents).group(1)
  width = re.search(r'width: (\d+)px', contents).group(1)
  height = re.search(r'height: (\d+)px', contents).group(1)
  exe = re.search(r'exe="(.*?)"', contents).group(1)
  archive = os.path.join(upload, os.path.basename(re.search(r'archive="(.*?)"', contents).group(1)))
  bg = os.path.join(_cdn, re.search(r'background: url\(https://js-dos\.com/cdn/(.*\.png)\)', contents).group(1))

  print('=== vars')
  print('title', title)
  print('_upload', _upload)
  print('archive', archive)
  print('width', width)
  print('height', height)
  print('bg', bg)
  print('exe', exe)

  return {
    "archive": archive,
    "bg": bg,
    "title": title,
    "width": width,
    "height": height,
    "exe": exe
  }

def findexe(dir):
  execs = []
  for root, dirs, files in os.walk(dir):
    for file in files:
      if file.lower().endswith('.exe') or file.lower().endswith('.com') or file.lower().endswith('.bat'):
        execs.append(os.path.join(root, file))
  return execs

def select_option(options):
  index = 0
  for option in options:
    print(str(index) + ':', option)
    index += 1
  print('e: exit')
  command = input('What do you want?\n')
  if command == 'e':
    exit(0)
  else:
    index = int(command)
    return (index, options[index])

print('Connecting to', hostname, username)

try:
  client = paramiko.SSHClient()
  client.load_system_host_keys()
  client.set_missing_host_key_policy(paramiko.WarningPolicy)
  
  client.connect(hostname, port=port, username=username, password=password)
  sftp = client.open_sftp()

  def read(rfile):
    print('Reading:', rfile)
    command = 'cat "' + rfile + '"'
    stdin, stdout, stderr = client.exec_command(command)
    error = stderr.read().decode("utf-8") 
    if len(error) != 0:
      raise Exception('Unable to execute command: ' + command + " out: " + error)
    return stdout.read()
    # file = sftp.file(rfile)
    # data = file.read()
    # return data

  def write(contents, rfile):
    print('Writing:', rfile)
    command = 'cat > "' + rfile + '"'
    stdin, stdout, stderr = client.exec_command(command)
    try:
      stdin.write(contents)
      stdin.close()
    except:
      print('Unable to execute command:', command)
      raise

  def download(rfile, lfile):
    print('Downloading', rfile, '->', lfile)
    def progress(curr, total):
      print('Progress', curr * 100 / total, '%')
    sftp.get(rfile, lfile, callback=progress)
    # data = read(rfile)
    # print('Store ', lfile)
    # with open(lfile, 'wb') as f:
    #   f.write(data)

  def execute(command, ignore_err = False):
    print('Executing: ', command)
    stdin, stdout, stderr = client.exec_command(command)
    error = stderr.read().decode("utf-8") 
    if len(error) != 0 and not ignore_err:
      raise Exception('Unable to execute command: ' + command + " out: " + error)
    out = stdout.read().decode("utf-8") 
    print(out)
    if ignore_err:
      print(error)
    return out

  def jekyll():
    execute('/bin/bash --login -c "cd js-dos.com.git && rvm use 2.3.1 && jekyll build"', True)

  def ls(folder):
    return execute('ls -1 ' + folder).split("\n")

  def select_game():
    games = ls(upload + "/*.md")

    index, game = select_option(games)

    game = games[index]
    md = read(game).decode('utf-8')
    meta = extract_meta_from_md(md)
    
    while True:
      command = input('Select what to do (d: delete, p: publish, t: test, i: upload image, e: exit)\n')

      if command == 'e':
        break
      elif command == 'd':
        execute('rm -rfv "' + os.path.join(meta['archive']) + '" "' + game + '"')
        break        
      elif command == 't':
        try:
          os.remove('/tmp/game.zip')
        except:
          pass

        try:
          shutil.rmtree('/tmp/game')
        except:
          pass

        download(meta['archive'], '/tmp/game.zip')
        
        if subprocess.run(["unzip", "/tmp/game.zip", "-d", "/tmp/game"], stdout=subprocess.PIPE).returncode != 0:
          raise Exception("Can't extract /tmp/game.zip")

        execs = findexe('/tmp/game')
        execs.append('repack')
        execs.append('done')

        while True:
          index, executable = select_option(execs)
          
          if executable == 'repack':
            result = subprocess.run(["zip", "-rv", "/tmp/game.zip", ".", "-i", "*"], stdout=subprocess.PIPE,  stderr=subprocess.STDOUT, cwd="/tmp/game/")
            print(result.stdout)
            if result.returncode != 0:
              raise Exception("Can't compress /tmp/game.zip")
            print("Sending...")
            with open('/tmp/game.zip', 'rb') as f:
              write(f.read(), meta['archive'])
            print("Ok")
          elif executable == 'done':
            break
          else:
            subprocess.run(['dosbox', executable])
      elif command == 'p':
        archive = meta['archive']
        bg = meta['bg']
        title = meta['title']
        width = 640 #meta['width']
        height = 400 #meta['height']
        exe = meta['exe']
        contents = md

        contents = re.sub(r'include dosbox\.html', 'include dosbox.html version="2" width="%s" height="%s" bg="%s"' %
          (width, height, os.path.basename(bg)), contents)

        new_title = input('New title?\n')
        if len(new_title) > 0:
          contents = re.sub(r'title:.*', 'title: ' + new_title, contents)
          contents = re.sub(r'\*\*%s\*\*' % title, '**' + new_title + '**', contents)
          contents = re.sub(r'name="%s"' % title, 'name="' + new_title + '"', contents)

        contents = re.sub(r'game="%s*"' % title, 'game="' + title.replace(" ", "_") + '"', contents)


        def askreplace(template, contents, yml = False):
          value = re.search(template, contents).group(2)
          new = input(template + ' == ' + value + ' enter new value:\n')
          if new and yml:
            return re.sub(template, r'\1: %s' % new, contents)
          elif new:
            return re.sub(template, r'\1="%s"' % new, contents)
          return contents

        contents = askreplace(r'(exe)="(.*?)"', contents)
        contents = askreplace(r'(createdat)="(\?\?\?)"', contents)
        contents = askreplace(r'(publisher)="(\?\?\?)"', contents)
        contents = askreplace(r'(category)="(\?\?\?)"', contents)
        contents = re.sub(r'\?\?\?', '', contents)

        print(contents)

        write(contents, os.path.join(_posts, os.path.basename(game)))
        execute('cp "' + os.path.join(archive) + '" "' + os.path.join(_upload, os.path.basename(archive)) + '"')
        jekyll()
      elif command == 'i':
        bg = meta['bg']
        print('Publish image')
        print('document.write(\'<img src="\'+document.getElementsByTagName(\'canvas\')[0].toDataURL(\'image/png\')+\'"/>\');')
        ready = input('ready for cp (~/Загрузки/index.png)? y(enter)/n\n')
        
        if ready == 'y' or ready == '':
          # print('scp ~/Загрузки/image.png root@epicport.com:' + os.path.abspath(os.path.join(_cdn, bg)) + ' ./')
          with open('/home/caiiiycuk/Загрузки/index.png', 'rb') as f:
            write(f.read(), bg)
          jekyll()

  def loop():
    command, name = select_option(['select_game', 'jekyll'])
    if command == 0:
      select_game()
    elif command == 1:
      jekyll();

  while True:
    loop()

finally:
  client.close()