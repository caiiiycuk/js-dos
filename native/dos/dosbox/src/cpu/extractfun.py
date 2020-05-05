from __future__ import print_function
import sys
import re
import hashlib

def error(s):
    print('ERROR:', s, file=sys.stderr)
    sys.exit(1)

# Functions are stored here, removing duplicates. Then they are printed.
class FunctionStore:
    def __init__(self, namer):
        self.functions = []
        self.hash2idx = {}
        self.namer = namer
        self.name2idx = {}
        self.idx2name = []
        self.idnum2str = []

    def findname(self, fcases):
        for case in fcases:
            naming = namer.getname(case)
            if naming:
                return naming
        error('no name found for ' + str(fcases))

    NAMINGS = (
        lambda self, x : self.idnum2str[x[0]] + x[2][1],
        lambda self, x : self.idnum2str[x[0]] + x[2][0] + x[2][1],
        lambda self, x : self.idnum2str[x[0]] + hex(x[1][0]) + x[2][1],
        lambda self, x : error('cannot fix name collision at ' + str(x[2]))
    )
    def name_function(self, idx):
        colidx = -1
        namingidx = 0
        while True:
            tryname = self.NAMINGS[namingidx](self,
                                              self.functions[idx])
            if tryname in self.name2idx:
                # Name collision, use next name format
                namingidx += 1
                colidx = self.name2idx[tryname]
                if colidx >= 0:
                    # Rename colliding function
                    newname = self.NAMINGS[namingidx](self,
                                                      self.functions[colidx])
                    if namingidx == 2:
                        print(self.functions[idx])
                        print(self.functions[colidx])
                    self.idx2name[colidx] = newname
                    self.name2idx[newname] = colidx
                    # Reserve old name so it can't be used
                    self.name2idx[tryname] = -1;
                # New function will be renamed in next iteration of loop
            else:
                # Use this name
                self.idx2name[idx] = tryname
                self.name2idx[tryname] = idx
                break

    # Add new function to function store. If function body is identical
    # to another, only a pointer to that function is stored.
    def add(self, fset, fcases, ftext):
        self.idx2name.append(0);
        ftexthash = hashlib.sha1(ftext.encode('UTF-8')).hexdigest()
        if ftexthash in self.hash2idx:
            dupeidx = self.hash2idx[ftexthash]
            dupe = self.functions[dupeidx]
            if ftext == dupe[3]:
                # Tuple provides information needed to generate name
                # for referring to already existing function.
                self.functions.append((fset, fcases, dupeidx))
            else:
                error('hash collision')
        else:
            idx = len(self.functions)
            self.hash2idx[ftexthash] = idx
            naming = self.findname(fcases)
            self.functions.append((fset, fcases, naming, ftext))
            self.name_function(idx)

    # Return ID number for ID string
    def getfileid(self, fileid):
        self.idnum2str.append(fileid)
        return len(self.idnum2str) - 1

    # Print out all functions
    def output_fun(self, f):
        for i, fun in enumerate(self.functions):
            if len(fun) == 4:
                # This is a real function, not a reference to another one
                f.write('static int ' + self.idx2name[i] + '(void) {\n')
                f.write(fun[3])
                f.write('\n}\n\n')

    ARRAYLEN = 1024
    def populate_arrays(self):
        # Create empty arrays
        self.funptrarr = [];
        for i in range(0, len(self.idnum2str)):
            self.funptrarr.append([-1] * self.ARRAYLEN)
        # Initialize them
        for i, fun in enumerate(self.functions):
            if len(fun) == 4:
                # This is a real function with its own name
                idx = i
            else:
                # This is a reference to another function
                idx = fun[2]
            # Point all cases to idx
            for case in fun[1]:
                self.funptrarr[fun[0]][case] = idx

    # Replace duplicate arrays with index of earlier matching array
    def deduplicate_arrays(self):
        for i in range(0, len(self.idnum2str)):
            for j in range(0, i - 1):
                if self.funptrarr[i] == self.funptrarr[j]:
                    self.funptrarr[i] = j

    def output_array(self, f, defname, i):
        f.write('\nint (* const ' + self.idnum2str[i] +
                'funptr[' + str(self.ARRAYLEN) + '])(void) = {\n')
        line = ''
        linelen = 0
        defnamel = len(defname)
        for idx in self.funptrarr[i]:
            if idx >= 0:
                # Function has a name
                funname = self.idx2name[idx]
                funnamel = len(funname)
            else:
                # No function here, output default
                funname = defname
                funnamel = defnamel
            if linelen + funnamel + 3 > self.MAXLEN:
                # Can't fit on line, output line, start next
                f.write(line + ',\n')
                line = funname
                linelen = funnamel
            else:
                # Can fit on line, so add to line
                if line != '':
                    line += ', '
                    linelen += 2
                line += funname
                linelen += funnamel
        f.write(line)
        f.write('\n};\n')

    MAXLEN = 79
    def output_arrays(self, f, defname):
        self.populate_arrays()
        self.deduplicate_arrays()
        for i in range(0, len(self.idnum2str)):
            if isinstance(self.funptrarr[i], list):
                self.output_array(f, defname, i)
            else:
                f.write('\n/* Omitting ' + self.idnum2str[i] +
                        'funptr because it matches ' +
                        self.idnum2str[self.funptrarr[i]] + 'funptr */\n')


# Reads case statement bodies from a file, transforms them,
# and stores them in a FunctionStore.
class FunctionReader:
    def __init__(self, store):
        self.functionstore = store

    # This replaces the matched string
    def replace_match(self, m, r):
        return (m.string[:m.start()] + r + m.string[m.end():],
                m.start() + len(r))

    # This regular expression identifies relevant strings to search for.
    # Particular parts are processed using functions below, via REFUNMAP.
    FUNRE = re.compile('({)|(})|(switch)|(break)|(continue)|'
                       '(goto restart_opcode)|(goto illegal_opcode)|'
                       '(goto decode_end)');

    def re_openbrace(self, match):
        self.bracelevel += 1
        return (match.string, match.end())

    def re_closebrace(self, match):
        self.bracelevel -= 1
        if self.bracelevel == self.entrylevel:
            # Back to outermost level, where break statements become returns
            self.entrylevel = -1
        return (match.string, match.end())

    def re_startlevel(self, match):
        # Entering deeper level, where break statements need to remain
        if self.entrylevel == -1:
            self.entrylevel = self.bracelevel
        return (match.string, match.end())

    # Only break statements that exit the case that is converted into a
    # function need to be converted. Other break statements only exit inner
    # levels and need to remain unaltered.
    def re_break(self, match):
        if self.entrylevel == -1:
            return self.replace_match(match, 'return CASERET_BREAK')
        else:
            return (match.string, match.end())

    REFUNMAP = {
        1 : re_openbrace,
        2 : re_closebrace,
        3 : re_startlevel,
        4 : re_break,
        5 : lambda self, match : self.replace_match(match,
                                                    'return CASERET_CONTINUE'),
        6 : lambda self, match : self.replace_match(match,
                                                    'return CASERET_RESTART'),
        7 : lambda self, match : self.replace_match(match,
                                                    'return CASERET_ILLEGAL'),
        8 : lambda self, match : self.replace_match(match,
                                                    'return CASERET_END')
    }

    # Process a line which should contain part of a case statement body
    def pr_funcline(self, l):
        loc = 0
        while True:
            match = self.FUNRE.search(l, loc)
            if match:
                (l, loc) = self.REFUNMAP[match.lastindex](self, match)
            elif self.bracelevel >= 0:
                self.funtext += l
                return True
            else:
                # Negative bracelevel means closing brace of case.
                # Assume it is on its own line so line can be discarded.
                return False

    # Strip leading lines and trailing whitespace.
    # Don't strip indentation on first line with text.
    LEADINGBLANK = re.compile('\s*\n')
    def strip_func(self, funtext):
        match = self.LEADINGBLANK.match(self.funtext)
        if match:
            startidx = match.end()
        else:
            startidx = 0
        return self.funtext[startidx:].rstrip()

    # Add function to function store and prepare for next one.
    def end_func(self):
        self.funtext = self.strip_func(self.funtext)
        if len(self.cases) == 0 and self.funtext != '':
            error('no case for: ' + self.funtext)
        elif len(self.cases) > 0:
            if self.funtext == '':
                # This would be legal C, but should be dealt with elsewhere
                error('no code for: ' + str(self.cases))
            else:
                self.functionstore.add(self.fileid, self.cases, self.funtext)

        self.cases = []
        self.funtext = ''

    # Try to parse a line as one or more case statements.
    # If this returns False, that means this is not a line of case statements,
    # and the previous case statement body continues.
    CASERE = re.compile('\s*case\s+([^:]+):');
    def pr_caseline(self, line):
        idx = 0
        l = len(line)
        newcases = []
        # Loop for multiple case statements on one line
        while idx < l:
            match = self.CASERE.match(line, idx)
            if match:
                try:
                    # Case value could be a C expression
                    newcases.append(eval(match.group(1)))
                except:
                    error('evaluating case: ' + match.group(1))
                idx = match.end()
            elif idx == 0:
                # This could be a function line
                return False
            elif line.strip != '':
                # It was just trailing whitespace
                break
            else:
                error('parsing case: ' + line)

        if self.funtext.strip() == '':
            self.cases += newcases
        else:
            self.end_func()
            self.cases = newcases

        return True

    # Load functions from a file
    # The fileid is later used for naming
    STRIP_DEFAULT = re.compile('\n\s*default:.*', re.DOTALL)
    def from_file(self, fileid, filename):
        self.entrylevel = -1
        self.bracelevel = 0
        self.funtext = ''
        self.cases = []
        self.fileid = self.functionstore.getfileid(fileid)
        inswitch = False
        with open(filename) as f:
            for line in f.readlines():
                if line.startswith('#'):
                    continue
                if not inswitch:
                    # Reading up to start of CPU core switch statement
                    if line.startswith('  switch (core.opcode_index'):
                        inswitch = True
                elif self.bracelevel != 0 or not self.pr_caseline(line):
                    if not self.pr_funcline(line):
                        self.funtext = self.STRIP_DEFAULT.sub('',
                                                              self.funtext, 1)
                        self.end_func()
                        break

class FunctionNamer:
    names = {}

    # Create a name that is a legal function name in C.
    # Underscore is rejected to avoid having multiple underscores side by side.
    NAMECLEANRE = re.compile('[^0-9A-Za-z]+')
    def cleanup_name(self, name):
        n = self.NAMECLEANRE.sub('_', name)
        nend = len(n) - 1
        if n[nend] == '_':
            return n[:nend]
        else:
            return n

    # Calculate number corresponding to this CASE #define
    OPCODE_NONE = 0
    OPCODE_SIZE = 0x200
    OPCODE_0F = 0x100
    NAMEMAP = { 'W': OPCODE_NONE,
                'D': OPCODE_SIZE,
                'B': OPCODE_NONE, # Also OPCODE_SIZE
                '0F_W': OPCODE_0F|OPCODE_NONE,
                '0F_D': OPCODE_0F|OPCODE_SIZE,
                '0F_B': OPCODE_0F|OPCODE_NONE # Also OPCODE_0F|OPCODE_SIZE
              }
    def calculate_case(self, opcode_type, idx):
        return self.NAMEMAP[opcode_type]+int(idx, 16)

    # Read instruction names from comments in header file
    NAMINGRE = re.compile('\s*CASE_([^\(]+)\(([^\)]+)\)\s*/\*(.*)\*/\s*')
    def from_file(self, filename):
        with open(filename) as f:
            for line in f.readlines():
                match = self.NAMINGRE.match(line)
                if match:
                    self.names[self.calculate_case(match.group(1),
                                                   match.group(2).strip())] = (
                        match.group(1),
                        self.cleanup_name(match.group(3).strip())
                    )

    def getname(self, case):
        if case in self.names:
            return self.names[case]
        else:
            return False

CPP_HEADER = '''
static int x86_illegal(void) {
    return CASERET_ILLEGAL;
}
'''
def print_cpp(store, filename):
    with open(filename, 'w') as f:
        f.write('/* DOSBox x86 opcode functions file generated by ' +
                sys.argv[0] + ' */\n')
        f.write(CPP_HEADER)
        store.output_fun(f)
        store.output_arrays(f, 'x86_illegal')

namer = FunctionNamer()
namer.from_file('core_normal/prefix_none.h')
namer.from_file('core_normal/prefix_66.h')
namer.from_file('core_normal/prefix_0f.h')
namer.from_file('core_normal/prefix_66_0f.h')

# TODO: More deduplication is possible by reading all functions into one
# single store. However, that has to take into account the differing
# environments set up in the core_*.cpp files before the case statement.
PROCESSINGS = (
    ('x86_', 'core_normal_fun.'),
    ('x86s_', 'core_simple_fun.'),
    ('x86p_', 'core_prefetch_fun.')
)

for p in PROCESSINGS:
    store = FunctionStore(namer)
    reader = FunctionReader(store)
    reader.from_file(p[0], p[1] + 'ii')
    print_cpp(store, p[1] + 'h')
