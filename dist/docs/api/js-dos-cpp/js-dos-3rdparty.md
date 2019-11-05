





  

```
#include <js-dos-3rdparty.h>

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <dirent.h>
#include <limits.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <dirent.h>
#include <fcntl.h>
#include <limits.h>
#include <sys/resource.h>
#include <sys/types.h>

void EMSCRIPTEN_KEEPALIVE safe_create_dir(const char *dir)
{
    if (mkdir(dir, 0755) < 0)
    {
        if (errno != EEXIST)
        {
            perror(dir);
            exit(1);
        }
    }
}

extern int EMSCRIPTEN_KEEPALIVE extract_zip(const void *data, zip_uint64_t length)
{
    struct zip *zipArchive;
    struct zip_file *zipFile;
    struct zip_stat zipStat;
    char buf[100];
    int err;
    int i, len;
    int fd;
    long long sum;

    FILE *archive = fopen("archive.zip", "wb");
    if (!archive) {
        fprintf(stderr, "extract-zip: unable to create `archive.zip`\n");
        return 1;
    }
    fwrite(data, length, 1, archive);
    fclose(archive);

    if ((zipArchive = zip_open("archive.zip", 0, &err)) == NULL)
    {
        zip_error_to_str(buf, sizeof(buf), err, errno);
        fprintf(stderr, "extract-zip: can't open zip archive 'archive.zip': %s\n", buf);
        return 1;
    }
    for (i = 0; i < zip_get_num_entries(zipArchive, 0); i++)
    {
        if (zip_stat_index(zipArchive, i, 0, &zipStat) == 0)
        {
            len = strlen(zipStat.name);
            printf("extracting: '%s', ", zipStat.name);
            printf("size: %llu, ", (long long unsigned int) zipStat.size);
            printf("mtime: %u\n", (unsigned int)zipStat.mtime);
            if (zipStat.name[len - 1] == '/')
            {
                safe_create_dir(zipStat.name);
            }
            else
            {
                zipFile = zip_fopen_index(zipArchive, i, 0);
                if (!zipFile)
                {
                    fprintf(stderr, "extract-zip: %s\n", zip_strerror(zipArchive));
                    fprintf(stderr, "extract-zip: Try to repack archive with default zip program, error: '%s'\n", zip_strerror(zipArchive));
                    exit(100);
                }
                fd = open(zipStat.name, O_RDWR | O_TRUNC | O_CREAT, 0644);
                if (fd < 0)
                {
                    fprintf(stderr, "extract-zip: %s\n", zip_file_strerror(zipFile));
                    exit(101);
                }
                sum = 0;
                while (sum != zipStat.size)
                {
                    len = zip_fread(zipFile, buf, 100);
                    if (len < 0)
                    {
                        fprintf(stderr, "extract-zip: %s\n", zip_file_strerror(zipFile));
                        exit(102);
                    }
                    write(fd, buf, len);
                    sum += len;
                }
                close(fd);
                zip_fclose(zipFile);
            }
        }
        else
        {
            printf("File[%s] Line[%d]\n", __FILE__, __LINE__);
        }
    }
    if (zip_close(zipArchive) == -1)
    {
        fprintf(stderr, "extract-zip: can't close zip 'archive.zip'\n");
        return 1;
    }
    if (remove("archive.zip") != 0) {
        fprintf(stderr, "extract-zip: unable to delete 'archive.zip'\n");
        return 1;
    }
    return 0;
}

```




