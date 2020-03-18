





  

```
#ifndef _JSDOS_API_H_
#define _JSDOS_API_H_

#include <js-dos-events.h>
#include <memory>
#include <string>


```







CommandInterace
==========








This interface is used to communicate between js and c++ layers
You can't instaniate this calss directly, please use ci() method;


  

```
class CommandInterface {
private:
  friend CommandInterface *ci();

  std::unique_ptr<Events> m_events;
  CommandInterface();

public:
  ~CommandInterface();
  Events *events();
};


```







Returns singleton of CommandInterface class


  

```
CommandInterface *ci();

#endif


```




