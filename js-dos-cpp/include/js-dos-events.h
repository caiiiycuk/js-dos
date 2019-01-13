#ifndef _JSDOS_EVENTS_H_
#define _JSDOS_EVENTS_H_

// Events
// ======
// Is abstraction for communcation between C++ and JS
class Events {
private:
    friend class CommandInterface;
    Events();
public:
// C++ --> JS
// ----------
// **ready** - triggered when runtime is ready
    void ready();

// JS --> C++
// ----------
// **exit** - if tirggered then runtime will be stopped
    void registerExit();
};

#endif // _JSDOS_EVENTS_H_