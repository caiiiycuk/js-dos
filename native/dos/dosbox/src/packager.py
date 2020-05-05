#!/usr/bin/python
from __future__ import print_function
import sys, os, subprocess

if len(sys.argv) < 3:
    print('To package a single file:')
    print('    python %s PACKAGE_NAME FILE' % sys.argv[0])
    print('To package a directory tree:')
    print('    python %s PACKAGE_NAME DIRECTORY FILE_TO_RUN' % sys.argv[0])
    print()
    print('Requires dosbox.html as template.')
    print('Creates PACKAGE_NAME.data and PACKAGE_NAME.html.')
    sys.exit(1)

def error(s):
    print(s, file=sys.stderr)
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
    except Exception as e:
        error('Error reading file: %s' % (str(e)))
    f.close
    return txt

try:
  exec(getfiletext(os.path.expanduser('~/.emscripten')))
except Exception as e:
  error('Error evaluating Emscripten configuration: %s' % (str(e)))

# Find folder in PATH environment variable which contains specified file
def find_in_path(fn):
    for d in os.environ["PATH"].split(os.pathsep):
        if os.path.isfile(os.path.join(d, fn)):
            return d
    return None

# Find Emscripten from EMSCRIPTEN_ROOT or by searching via PATH
def find_emscripten():
    if 'EMSCRIPTEN_ROOT' in globals():
        em_path = EMSCRIPTEN_ROOT
    else:
        em_path = find_in_path('emcc');

    if em_path is None or not os.path.isdir(em_path):
        error("Can't find Emscripten. Add it to PATH or set EMSCRIPTEN_ROOT.");

    return em_path;

# Find Emscripten's file packager
def find_packager():
    p = os.path.join(find_emscripten(), "tools", "file_packager.py");
    if not os.path.isfile(p):
        error('Emscripten file_packager.py not found.')
    return p;

# Run Emscripten's file packager from the appropriate directory
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

    packager_path = find_packager();

    if 'PYTHON' in globals():
        python_path = PYTHON
    elif sys.version_info.major != 2:
        python_path = 'python2' # Emscripten requires Python 2
    else:
        python_path = sys.executable

    try:
        res = subprocess.check_output([python_path, packager_path,
                                       datafile,
                                       "--no-heap-copy",
                                       "--preload",
                                       PACKAGE_ARG], universal_newlines=True)
    except:
        error('Error reported by Emscripten packager.')

    if BASE_DIR != '':
        os.chdir(cwd)

    return res

def inject_files(f):
    f.write('<script type="text/javascript">')
    f.write(run_packager())
    if EXECUTABLE.upper().endswith(('.EXE', '.COM', '.BAT')):
        cmdline = '\'./' + EXECUTABLE + '\''
    else:
        # DOS can't execute it, so assume it is a bootable disk image
        print('Packaging file as bootable disk image.')
        cmdline = '\'-c\', \'mount a .\', \'-c\', \'boot a:' + EXECUTABLE + '\''
    f.write("Module['arguments'] = [ " + cmdline + " ];\n</script>\n")

try:
    outf = open(OUTPUT_HTML, 'w')
except Exception as e:
    error('Error opening %s for writing: %s' %( OUTPUT_HTML, (str(e)) ))

with open('dosbox.html') as f:
    have_injected = False
    for line in iter(f.readline, ''):
        if '</script>' in line and not have_injected:
            outf.write(line)
            inject_files(outf)
            have_injected = True
        elif '<title>' in line:
            outf.write('    <title>')
            outf.write(sys.argv[1]);
            outf.write('</title>\n')
        else:
            outf.write(line)

outf.close()
