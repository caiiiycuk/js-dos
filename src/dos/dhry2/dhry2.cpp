//
// Created by caiiiycuk on 26.10.2020.
//
#include <protocol.h>

#include <cstdio>
#include <iostream>
#include <sstream>
#include <sys/stat.h>

#include "dhry_2_exe.h"
#include "dos4gw_exe.h"
#include "dosbox_conf.h"

void client_frame_set_size(int width, int height) {}
void client_frame_update_lines(uint32_t* lines, uint32_t count, void* rgba) {}
void client_sound_init(int freq) {}
void client_sound_push(const float* samples, int num_samples) {}
void client_stdout(const char* data, uint32_t amount) {
  if (amount > 4 &&
      data[0] == 'd' && data[1] == 'h' &&
      data[2] == 'r' && data[3] == 'y' &&
      data[4] == '2') {
      std::string result(data + 7, amount - 7);
      std::istringstream stream(result);

      int runs;
      double time;

      stream >> runs;
      stream >> time;

      std::cout << std::string(data, amount) << std::endl;

      if (time >= 3000) {
        server_exit();
      }
  }
}

void writeFile(const char* fileName, unsigned char *data, int len) {
  FILE* file = fopen(fileName, "wb");
  if (!file) {
    std::cerr << "Can't create file " << fileName << std::endl;
    exit(1);
  }
  if (len != fwrite(data, sizeof(unsigned char), len, file)) {
    std::cerr << "Can't write to file " << fileName << std::endl;
    exit(2);
  }
  fclose(file);
}

void prepare_fs() {
  writeFile("dhry_2.exe", _tmp_dhry_2_exe, _tmp_dhry_2_exe_len);
  writeFile("dos4gw.exe", _tmp_dos4gw_exe, _tmp_dos4gw_exe_len);

  mkdir(".jsdos", 0700);
  writeFile(".jsdos/dosbox.conf", _tmp_dosbox_conf, _tmp_dosbox_conf_len);
}

int main(int argc, char *argv[]) {
  prepare_fs();
  return server_run();
}
