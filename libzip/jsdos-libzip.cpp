#include <zip.h>
#include <jsdos-libzip.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cerrno>
#include <unistd.h>
#include <sys/stat.h>
#include <dirent.h>
#include <fcntl.h>
#include <string>

#include <fstream>

std::string libzipTempArchive = "libzip-temp-archive.zip";

ZipArchive* readZipArchiveFile(const std::string &path) {
    std::ifstream file(path,
                       std::ifstream::ate | std::ifstream::binary | std::ifstream::in);

    int32_t length;

    file.is_open();
    length = file.tellg();

    if (length <= 0) {
        fprintf(stderr, "zip_from_fs: archive is empty\n");
        return nullptr;
    }

    char *buffer = (char*) malloc(length + 4);
    file.seekg(0, std::ios::beg);
    file.read(buffer + 4, length);
    file.close();

    ((uint32_t*) buffer)[0] = (uint32_t) length;
    return (ZipArchive*) buffer;
}

void safe_create_dir(const char *dir) {
    if (mkdir(dir, 0755) < 0) {
        if (errno != EEXIST) {
            perror(dir);
            exit(1);
        }
    }
}

static bool is_dir(const std::string& dir) {
    struct stat st;
    ::stat(dir.c_str(), &st);
    return S_ISDIR(st.st_mode);
}


bool zip_recursively(zip *zipArchive, const char* directory) {
    DIR *dp = opendir(directory);
    if (dp == nullptr) {
        fprintf(stderr, "zip_from_fs: can't open directory %s\n", directory);
        return false;
    }

    struct dirent *dirp;
    while ((dirp = readdir(dp)) != nullptr) {
        if (dirp->d_name != std::string(".") && dirp->d_name != std::string("..") &&
            dirp->d_name != libzipTempArchive) {
            std::string nameInFs = std::string(directory) + "/" + dirp->d_name;
            std::string nameInArchive = nameInFs.substr(2);
            if (is_dir(nameInFs)) {
                if (zip_dir_add(zipArchive, nameInArchive.c_str(), ZIP_FL_ENC_UTF_8) == -1) {
                    fprintf(stderr, "zip_from_fs: can't create directory %s, cause %s\n", nameInFs.c_str(), zip_strerror(zipArchive));
                    return false;
                }
                if (!zip_recursively(zipArchive, nameInFs.c_str())) {
                    return false;
                }
            } else {
                zip_source_t *source = zip_source_file(zipArchive, nameInArchive.c_str(), 0, 0);
                if (source == nullptr) {
                    fprintf(stderr, "zip_from_fs: can't create file %s, cause %s\n", nameInFs.c_str(), zip_strerror(zipArchive));
                    return false;
                }
                auto index = zip_file_add(zipArchive, nameInArchive.c_str(), source, ZIP_FL_ENC_UTF_8);
                if (index == -1) {
                    zip_source_free(source);
                    fprintf(stderr, "zip_from_fs: can't create file %s, cause %s\n", nameInFs.c_str(), zip_strerror(zipArchive));
                    return false;
                } else {
                    if (zip_set_file_compression(zipArchive, index, ZIP_CM_DEFLATE, 9) == -1) {
                        fprintf(stderr, "zip_from_fs: can't set compression level for %s, cause %s\n", nameInFs.c_str(), zip_strerror(zipArchive));
                        return false;
                    }
                }
            }
        }
    }
    ::closedir(dp);
    return true;
}

ZipArchive* EMSCRIPTEN_KEEPALIVE zip_from_fs() {
    struct zip *zipArchive;
    char buf[100];
    int err;

    if ((zipArchive = zip_open(libzipTempArchive.c_str(), ZIP_CREATE | ZIP_TRUNCATE, &err)) == NULL) {
        zip_error_to_str(buf, sizeof(buf), err, errno);
        fprintf(stderr, "zip_from_fs: can't open zip archive: %s\n", buf);
        return nullptr;
    }


    bool success = zip_recursively(zipArchive, ".");
    if (zip_close(zipArchive) == -1) {
        fprintf(stderr, "zip_to_fs: can't close zip archive\n");
        return nullptr;
    }

    if (!success) {
        return nullptr;
    }

    ZipArchive* archive = readZipArchiveFile(libzipTempArchive);

    if (remove(libzipTempArchive.c_str()) != 0) {
        fprintf(stderr, "fs_to_zip: unable to delete archive\n");
    }

    return archive;
}

int EMSCRIPTEN_KEEPALIVE zip_to_fs(const void *data, uint32_t length) {
    struct zip *zipArchive;
    struct zip_file *zipFile;
    struct zip_stat zipStat;
    char buf[100];
    int err;
    int i, len;
    int fd;
    long long sum;

    FILE *archive = fopen(libzipTempArchive.c_str(), "wb");
    if (!archive) {
        fprintf(stderr, "zip_to_fs: unable to create archive file\n");
        return 1;
    }
    fwrite(data, length, 1, archive);
    fclose(archive);

    if ((zipArchive = zip_open(libzipTempArchive.c_str(), 0, &err)) == nullptr) {
        zip_error_to_str(buf, sizeof(buf), err, errno);
        fprintf(stderr, "zip_to_fs: can't open zip archive: %s\n", buf);
        return 1;
    }

    for (i = 0; i < zip_get_num_entries(zipArchive, 0); i++) {
        if (zip_stat_index(zipArchive, i, 0, &zipStat) == 0) {
            len = strlen(zipStat.name);
            printf("extracting: '%s', ", zipStat.name);
            printf("size: %llu, ", (long long unsigned int) zipStat.size);
            printf("mtime: %u\n", (unsigned int) zipStat.mtime);
            if (zipStat.name[len - 1] == '/') {
                safe_create_dir(zipStat.name);
            } else {
                zipFile = zip_fopen_index(zipArchive, i, 0);
                if (!zipFile) {
                    fprintf(stderr, "zip_to_fs: %s\n", zip_strerror(zipArchive));
                    fprintf(stderr, "zip_to_fs: Try to repack archive with default zip program, error: '%s'\n",
                            zip_strerror(zipArchive));
                    exit(100);
                }
                fd = open(zipStat.name, O_RDWR | O_TRUNC | O_CREAT, 0644);
                if (fd < 0) {
                    fprintf(stderr, "zip_to_fs: %s\n", zip_file_strerror(zipFile));
                    exit(101);
                }
                sum = 0;
                while (sum != zipStat.size) {
                    len = zip_fread(zipFile, buf, 100);
                    if (len < 0) {
                        fprintf(stderr, "zip_to_fs: %s\n", zip_file_strerror(zipFile));
                        exit(102);
                    }
                    write(fd, buf, len);
                    sum += len;
                }
                close(fd);
                zip_fclose(zipFile);
            }
        } else {
            printf("File[%s] Line[%d]\n", __FILE__, __LINE__);
        }
    }
    if (zip_close(zipArchive) == -1) {
        fprintf(stderr, "zip_to_fs: can't close zip archive\n");
        return 1;
    }

    if (remove(libzipTempArchive.c_str()) != 0) {
        fprintf(stderr, "zip_to_fs: unable to delete archive\n");
        return 1;
    }

    return 0;
}

void EMSCRIPTEN_KEEPALIVE libzip_exit() {
#ifdef EMSCRIPTEN
    emscripten_force_exit(0);
#endif
}
