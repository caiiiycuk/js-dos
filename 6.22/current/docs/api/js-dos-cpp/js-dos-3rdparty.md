





  

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

int EMSCRIPTEN_KEEPALIVE extract_zip(const void *data, zip_uint64_t length)
{
    struct zip *za;
    struct zip_file *zf;
    struct zip_stat sb;
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

    if ((za = zip_open("archive.zip", 0, &err)) == NULL)
    {
        zip_error_to_str(buf, sizeof(buf), err, errno);
        fprintf(stderr, "extract-zip: can't open zip archive 'archive.zip': %s\n", buf);
        return 1;
    }
    for (i = 0; i < zip_get_num_entries(za, 0); i++)
    {
        if (zip_stat_index(za, i, 0, &sb) == 0)
        {
            len = strlen(sb.name);
            printf("extracting: '%s', ", sb.name);
            printf("size: %llu, ", (long long unsigned int) sb.size);
            printf("mtime: %u\n", (unsigned int)sb.mtime);
            if (sb.name[len - 1] == '/')
            {
                safe_create_dir(sb.name);
            }
            else
            {
                zf = zip_fopen_index(za, i, 0);
                if (!zf)
                {
                    fprintf(stderr, "boese, boese\n");
                    exit(100);
                }
                fd = open(sb.name, O_RDWR | O_TRUNC | O_CREAT, 0644);
                if (fd < 0)
                {
                    fprintf(stderr, "boese, boese\n");
                    exit(101);
                }
                sum = 0;
                while (sum != sb.size)
                {
                    len = zip_fread(zf, buf, 100);
                    if (len < 0)
                    {
                        fprintf(stderr, "boese, boese\n");
                        exit(102);
                    }
                    write(fd, buf, len);
                    sum += len;
                }
                close(fd);
                zip_fclose(zf);
            }
        }
        else
        {
            printf("File[%s] Line[%d]\n", __FILE__, __LINE__);
        }
    }
    if (zip_close(za) == -1)
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




