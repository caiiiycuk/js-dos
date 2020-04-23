//
// Created by caiiiycuk on 13.04.2020.
//
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

#include "logging.h"

#ifdef EMSCRIPTEN
#include <emscripten.h>
// clang-format off
EM_JS(void, jsdos_log, (const char* tag, const char* message), {
    Module.log("[native:   log]", UTF8ToString(tag), UTF8ToString(message));
  });
EM_JS(void, jsdos_warn, (const char* tag, const char* message), {
    Module.log("[native: warn]", UTF8ToString(tag), UTF8ToString(message));
  });
EM_JS(void, jsdos_error, (const char* tag, const char* message), {
    Module.log("[native:error]", UTF8ToString(tag), UTF8ToString(message));
  });
// clang-format on
#else
void jsdos_log(const char* tag, const char* message) {
  printf("[%s] %s\n", tag, message);
}
void jsdos_warn(const char* tag, const char* message) {
  printf("WARN! [%s] %s\n", tag, message);
}
void jsdos_error(const char* tag, const char* message) {
  printf("ERR! [%s] %s\n", tag, message);
}
#endif

const char* LOG_TYPE_NAMES[] = {
    "LOG_ALL", "LOG_VGA",        "LOG_VGAGFX", "LOG_VGAMISC", "LOG_INT10",
    "LOG_SB",  "LOG_DMACONTROL", "LOG_FPU",    "LOG_CPU",     "LOG_PAGING",
    "LOG_FCB", "LOG_FILES",      "LOG_IOCTL",  "LOG_EXEC",    "LOG_DOSMISC",
    "LOG_PIT", "LOG_KEYBOARD",   "LOG_PIC",    "LOG_MOUSE",   "LOG_BIOS",
    "LOG_GUI", "LOG_MISC",       "LOG_IO",     "LOG_PCI",     "LOG_MSG",
    "LOG_MAX"};

Logger::Logger(LOG_TYPES type, LOG_SEVERITIES severity)
    : d_type(type), d_severity(severity) {}

void Logger::operator()(char const* format, ...) {
  if (d_severity != LOG_ERROR) {
    return;
  }

  static char buf[1024];

  va_list msg;
  va_start(msg, format);
  vsprintf(buf, format, msg);
  va_end(msg);

  switch (d_severity) {
    case LOG_ERROR:
      jsdos_error(LOG_TYPE_NAMES[d_type], buf);
      break;
    case LOG_WARN:
      jsdos_warn(LOG_TYPE_NAMES[d_type], buf);
      break;
    default:
      jsdos_log(LOG_TYPE_NAMES[d_type], buf);
  }
}

Logger** initLoggers() {
  int count = LOG_MAX * LOG_SEVERITY_MAX;
  Logger** logger = new Logger*[count];

  for (int type = 0; type < LOG_MAX; ++type) {
    for (int severity = 0; severity < LOG_SEVERITY_MAX; ++severity) {
      logger[severity * LOG_MAX + type] =
          new Logger((LOG_TYPES)type, (LOG_SEVERITIES)severity);
    }
  }

  return logger;
}

Logger& getLogger(LOG_TYPES type, LOG_SEVERITIES severity) {
  static Logger** loggers = initLoggers();
  return *loggers[severity * LOG_MAX + type];
};
