use strict;
use warnings;
use diagnostics;

use Cwd;
use FindBin qw($Bin);
use Template;
use File::Basename;
use File::Glob qw(:globally :nocase);
use File::Slurp qw(read_dir);

my $repo = $Bin;
my $build = getcwd;

my $usage = <<"USAGE";
Usage:
  mkdir build
  cd build
  perl ../build.pl <drive-root>
USAGE

if ($build eq $repo) {
    print <<"ERROR";
Do not call this script from root directory.

$usage
ERROR
    exit 1;
}

if (@ARGV < 1) {
    print $usage;
    exit 2;
}

my $drive = $ARGV[0];

print <<"ENV";
Welcome to js-doc build script.

Environment:
  Build directory '$build'
  Repository '$repo'
  Drive root directory '$drive'

All data in build directory will be erased, continue?
y/n [y]
ENV

my $answer = getc;

if ($answer eq 'n') {
    exit 3;
}

system("rm -rf $build/*") == 0 || die "system failed: $?";
system("cp -r $repo/assets $build/") == 0 || die "system failed: $?";
system("cp -r $repo/dosbox/* $build/") == 0 || die "system failed: $?";

my @dirs = grep {-d "$drive/$_" && ! /^\.{1,2}$/} read_dir($drive);

my $tt = Template->new({
    INCLUDE_PATH => "$repo/templates",
    INTERPOLATE  => 1,
    EVAL_PERL => 1
}) || die "$Template::ERROR\n";

$tt->process("index.tt", { dirs => \@dirs }, "$build/index.html") || die $tt->error(), "\n";

foreach my $dir (@dirs) {
    my $path = "$drive/$dir";
    my $target = "$build/".lc($dir);

    system("mkdir -p $target") == 0 || die "system failed: $?";
    #system("cp $repo/dosbox/dosbox.html.mem $target/") == 0 || die "system failed: $?";

    my @execs = searchExecutables($path);
    my @links = map { buildJS($dir, $target, $_); }  @execs;
    my @sorted = sort(@links);

    $tt->process("ls.tt", { dir => $dir, links => \@sorted }, "$target/index.html") || die $tt->error(), "\n";
}

print "Well done...\n";

sub searchExecutables {
    my $root = shift;
    my @execs = glob "$root/**/*.exe";
    my @coms =  glob "$root/**/*.com";

    my @found = ();

    foreach my $file ((@execs, @coms)) {
        my $name = basename($file);
        my $folder = dirname($file);
        my $folderName = basename($folder);

        if (lc($name) eq lc($folderName)) {
            push @found, { file => $name, folder => $folder };
        }
    }
    
    return @found;
}

sub buildJS {
    my $dir = shift;
    my $target = shift;
    my $executable = shift;
    my $file = $executable->{file};
    my $folder = $executable->{folder};
    my $targetFile = lc("$target/$file");

    $tt->process("dosbox.tt", { dir => $dir, title => $file}, "$build/dosbox.html") || die $tt->error(), "\n";

    system("python $repo/dosbox/packager.py \"$targetFile\" \"$folder\" \"$file\"\n") == 0 || die "system failed: $?";
    return $file;
}