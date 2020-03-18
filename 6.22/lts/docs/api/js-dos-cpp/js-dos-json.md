



JsonStream
==========










  

```

#include <js-dos-json.h>

jsonstream::jsonstream() : keyNext(true) {}

jsonstream &jsonstream::operator<<(int v) { return *this << std::to_string(v); }

const char *jsonstream::c_str() const { return contents.c_str(); }

const std::string &jsonstream::std_str() const { return contents; }

jsonstream &jsonstream::operator<<(const std::string &str) {
  if (keyNext) {
    contents += "\"" + str + "\":";
  } else {
    contents += "\"" + str + "\",";
  }
  keyNext = !keyNext;
  return *this;
}

```




