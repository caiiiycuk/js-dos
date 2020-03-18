





  

```
#ifndef _JSDOS_JSON_H_
#define _JSDOS_JSON_H_

#include <string>


```







JsonStream
==========








As communcation protocol we use json objects
to simplify c++ code, we use only string fields
for all types (int, long, etc.)


  

```

class jsonstream {
  bool keyNext;
  std::string contents;

public:
  jsonstream();

  jsonstream &operator<<(const std::string &str);
  jsonstream &operator<<(int v);

  const char *c_str() const;
  const std::string &std_str() const;
};

#endif // _JSDOS_JSON_H_

```




