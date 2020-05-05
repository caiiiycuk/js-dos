#!/usr/bin/python
from __future__ import print_function
import sys, os, shutil, re

def js_escape(s):
    return s.replace("'", "\\'")

# start: offset of first byte of input file in .data file
# end: offset of last byte plus one
def format_request(name, start, end):
    return 'new DataRequest(' + str(start) + \
           ', ' + str(end) + \
           ', 0, 0).open(\'GET\', \'' + \
           name + '\');\n'

def format_onload(name):
    return 'DataRequest.prototype.requests[\'' + name + '\'].onload();\n'

# Package a single file (really just copy it to .data)
def data_from_file(name, src):
    shutil.copy(src, name + '.data')
    dosname = '/' + js_escape(os.path.split(src)[1])
    requests = [ format_request(dosname, 0, os.stat(src).st_size + 1) ]
    onloads = [ format_onload(dosname) ]
    return [], requests, onloads

# Package a directory into a .data file
def data_from_dir(name, src):
    # JavaScript commands are built up in these strings.
    mkdirs = []
    requests = []
    onloads = []

    # Length of path to root directory of package
    pathlen = -1
    # Offset of next file in data file
    offset = 0

    with open(name + '.data', 'wb') as outf:

        for subdir, dirs, files in os.walk(src, True):
            # Construct prefix for Emscripten path of files in this
            # directory.
            if pathlen < 0:
                # 1st directory in top-down walk will be root of package
                pathlen = len(subdir) + 1
                emudir = '/'
            else:
                emudir = '/' + subdir[pathlen:] + '/'
                if os.sep != '/':
                    # Make path separators into forward slashes
                    emudir = emudir.replace(os.sep, '/');
                emudir = js_escape(emudir)

            # Loop through all subdirectories of this directory,
            # creating JS lines for creating those directories.
            for dir in dirs:
                mkdirs.append('Module[\'FS_createPath\'](\'' + \
                              emudir + '\', \'' + js_escape(dir) + \
                              '\', true, true);\n')

            # Loop through all files in this directory
            for fname in files:
                with open(os.path.join(subdir, fname), 'rb') as f:
                    # Concatenate file to end of data file
                    shutil.copyfileobj(f, outf)
                    offsend = outf.tell()

                    # Create JS lines for loading the file
                    dosname = emudir + js_escape(fname)
                    requests.append(format_request(dosname, offset, offsend))
                    onloads.append(format_onload(dosname))

                    offset = offsend

    return mkdirs, requests, onloads

# Create HTML file using template and lines returned by create_data
def create_html(template, name, mkdirs, requests, onloads, cmdline):
    basename = os.path.basename(name)

    # Print new lines to file with indent of old line
    create_html.indentre = re.compile('^\s*')
    def indent_line(outf, old, new):
        ws = create_html.indentre.match(old).group()
        for line in new:
            if ws != '':
                outf.write(ws)
            outf.write(line)

    # Add to list of line replacements, which will be used later
    create_html.replacelist = []
    def add_replist(old, new):
        create_html.replacelist += [[ old, new, False ]]
    def add_rep(old, new):
        add_replist(old, [ new ])

    add_rep('<title>', '<title>' + basename + '</title>\n')

    # For old-style HTML
    add_rep('fetchRemotePackage(\'', \
            'fetchRemotePackage(\'' + basename + '.data\', function(data) {\n')

    # For new HTML
    add_rep('var REMOTE_PACKAGE_BASE =', \
            'var REMOTE_PACKAGE_BASE = \'' + basename + '.data\';\n')
    add_rep('var REMOTE_PACKAGE_SIZE =', \
            'var REMOTE_PACKAGE_SIZE = ' +
            str(os.stat(name + '.data').st_size) + ';\n')

    add_replist('Module[\'FS_createPath\']',  mkdirs)
    add_replist('new DataRequest(', requests)
    add_replist('DataRequest.prototype.requests', onloads)

    add_rep('Module[\'arguments\'] = [',
            'Module[\'arguments\'] = [ ' + cmdline + ' ];\n')

    with open(template, 'r') as inf, \
         open(name + '.html', 'w') as outf:
        for line in iter(inf.readline, ''):
            replaced = False;
            i = 0
            # Check if any replacement pattern matches this line
            while i < len(create_html.replacelist):
                if create_html.replacelist[i][0] in line:
                    # Always remove the old matching line, but
                    # only write replacement if it hasn't been printed.
                    if not create_html.replacelist[i][2]:
                        indent_line(outf, line, create_html.replacelist[i][1])
                        create_html.replacelist[i][2] = True;
                    break
                i += 1
            # If no matching replacement, print old line
            if i == len(create_html.replacelist):
                outf.write(line)

if len(sys.argv) == 4:
    mkdirs, requests, onloads = data_from_dir(sys.argv[1], sys.argv[2])
    exeh = os.path.join(sys.argv[2], sys.argv[3])
    # Verify executable exists and fix up path separators if needed
    if not os.path.isfile(exeh):
        print("Did not find file to run at %s" % exeh)
        sys.exit(1)
    if os.sep == '/':
        exee = sys.argv[3]
    else :
        exee = sys.argv[3].replace(os.sep, '/');
    cmdline = '\'./' + exee + '\''
elif len(sys.argv) == 3:
    mkdirs, requests, onloads = data_from_file(sys.argv[1], sys.argv[2])
    cmdline = os.path.split(sys.argv[2])[1];
    if cmdline.upper().endswith(('.EXE', '.COM', '.BAT')):
        cmdline = '\'./' + cmdline + '\''
    else:
        # DOS can't execute it, so assume it is a bootable disk image
        print('Packaging file as bootable disk image.')
        cmdline = '\'-c\', \'mount a .\', \'-c\', \'boot a:' + cmdline + '\''
else:
    print('This is a stand-alone packager for EM-DOSBox. Using a packager-generated')
    print('HTML file as a template, it can create new packages without Emscripten.')
    print()
    print('To package a single file:')
    print('    python %s BASENAME FILE_TO_RUN' % sys.argv[0])
    print('To package a directory tree:')
    print('    python %s OUTPUT_NAME DIR FILE_TO_RUN' % sys.argv[0])
    print()
    print('Creates PACKAGE_NAME.data and PACKAGE_NAME.html.')
    print('Single files without executable extensions assumed to be bootable disk image.')
    sys.exit(1)

template = os.path.join(os.path.split(sys.argv[0])[0], 'template.html')
if not os.path.isfile(template):
    print('HTML template file needed at: ' + template)
    sys.exit(1)

create_html(template, sys.argv[1], mkdirs, requests, onloads, cmdline)
