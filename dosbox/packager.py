#!/usr/bin/python
import sys, os, subprocess

if len(sys.argv) < 3:
    print 'To package a single file:'
    print '    python %s PACKAGE_NAME FILE' % sys.argv[0];
    print 'To package a directory tree:'
    print '    python %s PACKAGE_NAME DIRECTORY FILE_TO_RUN' % sys.argv[0];
    print ''
    print 'Requires dosbox.html as template.'
    print 'Creates PACKAGE_NAME.data and PACKAGE_NAME.html.'
    sys.exit(1)

def error(s):
    print >> sys.stderr, s
    sys.exit(1)

OUTPUT_HTML = sys.argv[1] + '.html'
OUTPUT_DATA = sys.argv[1] + '.data'

if os.path.isfile(sys.argv[2]):
    ( BASE_DIR, PACKAGE_ARG ) = os.path.split(sys.argv[2])
    EXECUTABLE = PACKAGE_ARG
elif os.path.isdir(sys.argv[2]):
    BASE_DIR = sys.argv[2];
    PACKAGE_ARG = '.'
    if (len(sys.argv) < 4):
        error('When packaging directory, supply file to run as 3rd argument.')
    else:
        p = os.path.join(sys.argv[2], sys.argv[3])
        if os.path.isfile(p):
            EXECUTABLE = sys.argv[3]
        else:
            error("Did not find executable at %s" % p)
elif not os.path.exists(sys.argv[2]):
    error("Can't find %s" % sys.argv[2])
else:
    error("Don't know how to package %s" % sys.argv[2])

def getfiletext(fn):
    try:
        f = open(fn, 'r')
        txt = f.read()
    except Exception, e:
        error('Error reading file: %s' % (str(e)))
    f.close
    return txt

try:
  exec(getfiletext(os.path.expanduser('~/.emscripten')))
except Exception, e:
  error('Error evaluating Emscripten configuration: %s' % (str(e)))

def run_packager():
    if BASE_DIR != '':
        # Need to change directory because paths in package are
        # relative to directory where Emscripten packager is run.
        cwd = os.getcwd()
        os.chdir(BASE_DIR)
        if os.path.isabs(OUTPUT_DATA):
            datafile = OUTPUT_DATA
        else:
            datafile = os.path.join(cwd, OUTPUT_DATA)
    else:
        datafile = OUTPUT_DATA

    try:
        res = subprocess.check_output([PYTHON,
                                       os.path.join(EMSCRIPTEN_ROOT, "tools",
                                                    "file_packager.py"),
                                       datafile,
                                       "--no-heap-copy",
                                       "--preload",
                                       PACKAGE_ARG])
    except:
        error('Error reported by Emscripten packager.')

    if BASE_DIR != '':
        os.chdir(cwd)

    return res

def inject_files(f):
    f.write('<script type="text/javascript">')
    f.write(run_packager())
    f.write("Module['arguments'] = [ '-conf', './dosbox.conf', './" + EXECUTABLE + "' ];\n</script>\n")

try:
    outf = open(OUTPUT_HTML, 'w')
except Exception, e:
    error('Error opening %s for writing: %s' %( OUTPUT_HTML, (str(e)) ))

with open('dosbox.html') as f:
    for line in iter(f.readline, ''):
        if 'src="/dosbox.js"' in line:
            inject_files(outf)
            outf.write(line)
        else:
            outf.write(line)

outf.close
