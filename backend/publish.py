#!/usr/bin/python

import os
import sys
import fileinput
import re
from shutil import copyfile

root = os.path.dirname(sys.argv[0])
upload = os.path.join(root, 'upload')
_upload = os.path.join(root, '..', '_upload')
_posts = os.path.join(root, '..', '_posts')
_cdn = os.path.join(root, '..', 'cdn')

print('Searching in', upload)

files = os.listdir(upload)

index = -1
for file in files:
    index += 1
    if file.endswith('.md'):
       print(index, file)

publish_idx = raw_input('Select md to publish (or {num}d to delete):\n')
delete = False

if (publish_idx[len(publish_idx) - 1] == 'd'):
  delete = True
  publish_idx = publish_idx[0: len(publish_idx) - 1]

publish_idx = int(publish_idx)

file = os.path.join(upload, files[publish_idx])
filename = files[publish_idx]
print('==', file)
with open(file, 'r') as f:
    contents = f.read()

title = re.search(r'title: (.*)', contents).group(1)
archive = os.path.basename(re.search(r'archive="(.*?)"', contents).group(1))
width = re.search(r'width: (\d+)px', contents).group(1)
height = re.search(r'height: (\d+)px', contents).group(1)
bg = re.search(r'background: url\(https://js-dos\.com/cdn/(.*\.png)\)', contents).group(1)

print('=== vars')
print('title', title)
print('_upload', _upload)
print('archive', archive)
print('width', width)
print('height', height)
print('bg', bg)

print('scp root@epicport.com:' + os.path.abspath(os.path.join(upload, archive)) + ' ./')
print('document.write(\'<img src="\'+document.getElementsByTagName(\'canvas\')[0].toDataURL(\'image/png\')+\'"/>\');')
print('scp image.png root@epicport.com:' + os.path.abspath(os.path.join(_cdn, bg)) + ' ./')

if delete:
  os.remove(os.path.join(upload, archive))
  os.remove(file)
  print("Deleted")
else:
  contents = re.sub(r'include dosbox\.html', 'include dosbox.html version="2" width="%s" height="%s" bg="%s"' %
    (width, height, bg), contents)

  new_title = raw_input('New title?\n')
  if len(new_title) > 0:
    contents = re.sub(r'title:.*', 'title: ' + new_title, contents)
    contents = re.sub(r'\*\*%s\*\*' % title, '**' + new_title + '**', contents)
    contents = re.sub(r'name="%s"' % title, 'name="' + new_title + '"', contents)

  contents = re.sub(r'game="%s*"' % title, 'game="' + title.replace(" ", "_") + '"', contents)


  def askreplace(template, contents, yml = False):
    value = re.search(template, contents).group(2)
    new = raw_input(template + ' == ' + value + ' enter new value:\n')
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

  with open(os.path.join(_posts, filename), 'w') as f:
    f.write(contents)
  copyfile(os.path.join(upload, archive), os.path.join(_upload, archive))

  print('scp root@epicport.com:' + os.path.abspath(os.path.join(upload, archive)) + ' ./')
  print('scp image.png root@epicport.com:' + os.path.abspath(os.path.join(_cdn, bg)))
