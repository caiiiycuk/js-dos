(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultOptions = {
  keysCode: {
    left: 37,
    right: 39,
    up: 38,
    down: 40
  }
};

function Move(zone, consumer, options) {
  if (options === void 0) {
    options = defaultOptions;
  }

  var moveTreshold = 15;
  var keysCode = options.keysCode;
  var keysState = {
    left: "up",
    right: "up",
    up: "up",
    down: "up"
  };

  var updateKeyState = function updateKeyState(direction, state) {
    if (keysState[direction] === state) {
      return;
    }

    keysState[direction] = state;

    for (var _i = 0, _a = Object.keys(keysState); _i < _a.length; _i++) {
      var next = _a[_i];

      if (next !== direction && keysState[next] === "down") {
        keysState[next] = "up";
        consumer.onRelease(keysCode[next]);
      }
    }

    if (state === "down") {
      consumer.onPress(keysCode[direction]);
    }
  };

  var touchInfo = {};

  var onTouchStart = function onTouchStart(finger, x, y) {
    // console.log("start", finger, x, y);
    touchInfo[finger] = {
      x: x,
      y: y
    };
  };

  var onTouchMove = function onTouchMove(finger, x, y) {
    if (touchInfo[finger] === undefined) {
      return;
    }

    var dx = touchInfo[finger].x - x;
    var dy = touchInfo[finger].y - y;

    if (Math.abs(dx) < moveTreshold && Math.abs(dy) < moveTreshold) {
      return;
    }

    var direction;

    if (Math.abs(dx) >= Math.abs(dy)) {
      dx < 0 ? direction = "right" : direction = "left";
    } else {
      dy < 0 ? direction = "down" : direction = "up";
    }

    touchInfo[finger].x = x;
    touchInfo[finger].y = y;
    updateKeyState(direction, "down");
    delete touchInfo[finger];
  };

  var onTouchEnd = function onTouchEnd(finger, x, y) {
    onTouchMove(finger, x, y);
    delete touchInfo[finger];
  };

  zone.addEventListener("touchstart", function (event) {
    event.preventDefault();
    var touches = event.changedTouches; // tslint:disable-next-line:prefer-for-of

    for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
      var main = touches[touchIndex];
      onTouchStart(main.identifier, main.pageX, main.pageY);
    }
  }, true);
  zone.addEventListener("touchmove", function (event) {
    event.preventDefault();
    var touches = event.changedTouches; // tslint:disable-next-line:prefer-for-of

    for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
      var main = touches[touchIndex];
      onTouchMove(main.identifier, main.pageX, main.pageY);
    }
  }, true);
  zone.addEventListener("touchend", function (event) {
    event.preventDefault();
    var touches = event.changedTouches; // tslint:disable-next-line:prefer-for-of

    for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
      var main = touches[touchIndex];
      onTouchEnd(main.identifier, main.pageX, main.pageY);
    }
  }, true);
  zone.addEventListener("mousedown", function (event) {
    event.preventDefault();
    onTouchStart(-1, event.pageX, event.pageY);
  }, true);
  zone.addEventListener("mousemove", function (event) {
    event.preventDefault();
    onTouchMove(-1, event.pageX, event.pageY);
  }, true);
  zone.addEventListener("mouseup", function (event) {
    event.preventDefault();
    onTouchEnd(-1, event.pageX, event.pageY);
  }, true);
  zone.addEventListener("mouseleave", function (event) {
    event.preventDefault();
    onTouchEnd(-1, event.pageX, event.pageY);
  }, true);
}

exports.default = Move;

},{"core-js/modules/es6.array.iterator":117,"core-js/modules/es6.object.keys":123,"core-js/modules/es6.object.to-string":125,"core-js/modules/web.dom.iterable":138}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DosDom = require("../js-dos-dom");

var defaultOptions = {
  uppercase: true
};

function Qwerty(zone, consumer, options) {
  if (options === void 0) {
    options = defaultOptions;
  }

  DosDom.applyCss("lqwerty-css", css + "\n\n" + (options.cssText || ""));

  var sendFn = function sendFn() {
    var value = options.uppercase ? input.value.toUpperCase() : input.value;
    input.value = "";
    input.blur();
    container.style.visibility = "hidden";

    if (value.length === 0) {
      return;
    }

    var i = 0;
    var id = setInterval(function () {
      if (i >= value.length * 2) {
        clearInterval(id);
        return;
      }

      if (i % 2 === 0) {
        consumer.onPress(value.charCodeAt(i / 2));
      } else {
        consumer.onRelease(value.charCodeAt((i - 1) / 2));
      }

      i++;
    }, 100);
  };

  var container = DosDom.createDiv("qwerty-container");
  container.innerHTML = "\n        <div>ENTER CHARS:</div>\n\n        <div class=\"qwerty-input-row\">\n            <div>:>&nbsp;</div>\n            <input class=\"qwerty-input\" value=\"\">\n            <!-- <div class=\"qwerty-cursor\"></div> -->\n            <div class=\"qwerty-send\">Send</div>\n        </div>\n    ";
  container.style.visibility = "hidden";

  var noPropagationFn = function noPropagationFn(e) {
    e.stopPropagation();
  };

  container.addEventListener("keydown", noPropagationFn);
  container.addEventListener("keyup", noPropagationFn);
  container.addEventListener("keypress", function (e) {
    if (e.keyCode === 13) {
      sendFn();
    }
  });
  container.addEventListener("keypress", noPropagationFn);
  var input = container.getElementsByTagName("input")[0];

  var resizeFn = function resizeFn() {
    input.style.width = Math.max(2, input.value.length + 1) + "ch";
  };

  input.tabIndex = 1;
  input.addEventListener("input", resizeFn);
  input.addEventListener("blur", sendFn);
  var send = container.getElementsByClassName("qwerty-send")[0];
  DosDom.addButtonListener(send, function () {}, sendFn);
  var key = DosDom.createDiv("qwerty-key");
  DosDom.addButtonListener(key, function () {// nothing
  }, function () {
    if (container.style.visibility === "hidden") {
      resizeFn();
      container.style.visibility = "visible";
      input.focus();
    } else {
      container.style.visibility = "hidden";
    }
  });
  zone.appendChild(key);
  zone.appendChild(container);
}

exports.default = Qwerty;
var css = "\n    .qwerty-container {\n        position: absolute;\n        left: 0;\n        top: 0;\n        right: 0;\n\n        display: flex;\n        flex-direction: column;\n\n        padding: 10px 20px;\n\n        font-size: 1em;\n        background: #000000e3;\n        border-bottom: 2px solid white;\n        font-family: monospace;\n        color: white;\n\n        line-height: 1.4em;\n    }\n\n    .qwerty-input-row {\n        display: flex;\n        flex-grow: 1;\n        align-items: center;\n    }\n\n    .qwerty-input, .qwerty-input:focus {\n        padding: 0;\n        margin: 0;\n        border: none;\n        background: black;\n        color: white;\n        font: inherit;\n        display: inline-block;\n        outline: none;\n    }\n\n    .qwerty-send {\n        color: black;\n        padding: 5px 0.5em;\n        margin-left: 0.5em;\n\n        padding: 5px;\n        background: lightgray;\n        border-left: 1px solid white;\n        border-top: 1px solid white;\n        border-right: 1px solid darkgray;\n        border-bottom: 1px solid darkgray;\n    }\n\n    .qwerty-key {\n        display: flex;\n        position: absolute;\n        left: 10px;\n        bottom: 10px;\n\n        align-items: center;\n        justify-content: center;\n        color: black;\n        font-size: 2em;\n\n        width: 48px;\n        height: 48px;\n        background: lightgray url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAZRJREFUWIXtlr9KA0EQxn9ngmBroY0W/k0stZbYKFqICD6DYCFiLfgIgtG8iGIkRcBGsLGx8Q+JYAhcwDdQE8/iZsncesgpeCuYDw72+2bmZnZ3bhLooYf/Dg8YBIYc5X/2gDcg66iAtgcEjpID3Z0vAo2Uc08AFVNAA6inXEAWoM8SN4ASsKm0omg54QXhe8pnX7R54TPCi8pnS7R1u5IAmJR1SfiZZQ+AFeG7wu+VT120beGrKs6gIvxQeB4I7O6/AcrAldJOgQzQUsnKRHumKgU9CvfFp23vNg76BH4TsSdg90DqsAs4ont3AdBRtnPRDoRPK78xK/5Exb2LtpykgK+4WWdibLaWUTYvLrE2BsAUYXPl6O4GwiaqynoWGCZstBowACyI7QJ4UfEtwoYGWLIKMvF54A7Sa0IbsZ9hAZgjPA0zC3b4fDVJ0QGOZb0GjAPXwKV2SjqIfvoYJBpEPvBAdMjcEr3D70APoid5t287Oe0B54PIfIZN4DXl3P3AqPN/RB7h7/OIo/xNR3l7+EP4AJe/eBF8vW9QAAAAAElFTkSuQmCC) no-repeat center center;\n        border-left: 1px solid white;\n        border-top: 1px solid white;\n        border-right: 1px solid darkgray;\n        border-bottom: 1px solid darkgray;\n    }\n\n    .qwerty-cursor {\n        background: white;\n        width: 0.5em;\n        height: 1em;\n        animation: qwerty-blink 1s;\n        -moz-animation: qwerty-blink 1s infinite;\n        -webkit-animation: qwerty-blink 1s infinite;\n    }\n\n    @-moz-keyframes qwerty-blink {\n        0% {background:white;}\n        50% {background:black;}\n        100% {background:white;}\n    }\n\n    @-webkit-keyframes qwerty-blink {\n        0% {background:white;}\n        50% {background:black;}\n        100% {background:white;}\n    }\n";

},{"../js-dos-dom":9}],3:[function(require,module,exports){
"use strict"; // Autogenerated
// -------------
// gulpfile.js --> generateBuildInfo

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Build = {
  version: "6.22.59 (41e421b7818042bda0cd05c85fd24394)",
  jsVersion: "0329a6636601ab8227a503d39715874e236caf49",
  wasmJsSize: 189751,
  wasmVersion: "fb6d6cf569eb6b131117507da32415ce",
  wasmSize: 1809269,
  jsSize: 6656135,
  buildSeed: 1577289108299
};

},{}],4:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var CacheDb =
/** @class */
function () {
  function CacheDb(version, onready, onerror) {
    var _this = this;

    this.storeName = "files";
    this.db = null;
    this.version = version;
    this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    if (!this.indexedDB) {
      onerror("Indexed db is not supported on this host");
      return;
    }

    var openRequest = this.indexedDB.open("js-dos-cache (" + version + ")", 1);

    openRequest.onerror = function (event) {
      onerror("Can't open cache database");
    };

    openRequest.onsuccess = function (event) {
      _this.db = openRequest.result;
      onready(_this);
    };

    openRequest.onupgradeneeded = function (event) {
      try {
        _this.db = openRequest.result;

        _this.db.onerror = function (event) {
          onerror("Can't upgrade cache database");
        };

        _this.db.createObjectStore(_this.storeName);
      } catch (e) {
        onerror("Can't upgrade cache database");
      }
    };
  }

  CacheDb.prototype.put = function (key, data, onflush) {
    if (this.db === null) {
      onflush();
      return;
    }

    var transaction = this.db.transaction(this.storeName, "readwrite");

    transaction.oncomplete = function () {
      return onflush();
    };

    transaction.objectStore(this.storeName).put(data, key);
  };

  CacheDb.prototype.get = function (key, ondata, onerror) {
    if (this.db === null) {
      onerror("db is not initalized");
      return;
    }

    var transaction = this.db.transaction(this.storeName, "readonly");
    var request = transaction.objectStore(this.storeName).get(key);

    request.onerror = function () {
      return onerror("Can't read value for key '" + key + "'");
    };

    request.onsuccess = function () {
      if (request.result) {
        ondata(request.result);
      } else {
        onerror("Result is empty for key '" + key + "', result: " + request.result);
      }
    };
  };

  CacheDb.prototype.forEach = function (each, onend) {
    if (this.db === null) {
      onend();
      return;
    }

    var transaction = this.db.transaction(this.storeName, "readonly");
    var request = transaction.objectStore(this.storeName).openCursor();

    request.onerror = function () {
      return onend();
    };

    request.onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        each(cursor.key.toString(), cursor.value);
        cursor.continue();
      } else {
        onend();
      }
    };
  };

  return CacheDb;
}();

exports.default = CacheDb;

},{"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.regexp.to-string":132}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var CacheNoop =
/** @class */
function () {
  function CacheNoop() {}

  CacheNoop.prototype.put = function (key, data, onflush) {// nothing
  };

  CacheNoop.prototype.get = function (key, ondata, onerror) {
    onerror("Cache is not supported on this host");
  };

  CacheNoop.prototype.forEach = function (each, onend) {
    onend();
  };

  return CacheNoop;
}();

exports.default = CacheNoop;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var js_dos_cache_db_1 = require("./js-dos-cache-db");

var js_dos_cache_noop_1 = require("./js-dos-cache-noop");

function openCache(module, onready) {
  new js_dos_cache_db_1.default(module.version, onready, function (msg) {
    if (module.log !== undefined) {
      module.log("ERR! Can't initalize cache, cause: " + msg);
    }

    onready(new js_dos_cache_noop_1.default());
  });
}

exports.default = openCache;

},{"./js-dos-cache-db":4,"./js-dos-cache-noop":5}],7:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DosCommandInterface =
/** @class */
function () {
  function DosCommandInterface(dos, onready) {
    var _this = this;

    this.shellInputQueue = [];
    this.shellInputClients = [];
    this.onstdout = undefined;
    this.keyEventConsumer = {
      onPress: function onPress(keyCode) {
        return _this.simulateKeyEvent(keyCode, true);
      },
      onRelease: function onRelease(keyCode) {
        return _this.simulateKeyEvent(keyCode, false);
      }
    };
    this.dos = dos;
    this.em = dos;
    this.api = dos;

    this.api.ping = function (msg) {
      var args = [];

      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }

      _this.onping(msg, args);
    };

    this.onready = onready;
  } // * `width()` - return dosbox window width in pixels


  DosCommandInterface.prototype.width = function () {
    return this.dos.canvas.width;
  }; // * `height()` - return dosbox window height in pixels


  DosCommandInterface.prototype.height = function () {
    return this.dos.canvas.height;
  }; // * `fullscreen()` - enters fullscreen mode
  // This function can be called anywhere, but for web security reasons its associated request can only be raised
  // inside the event handler for a user-generated event (for example a key, mouse or touch press/release).


  DosCommandInterface.prototype.fullscreen = function () {
    var _this = this;

    var requestFn = function requestFn(element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.webkitEnterFullscreen) {
        element.webkitEnterFullscreen();
      } else {
        _this.fullscreenInitialCssStyle = element.style.cssText;
        element.style.cssText = "\n                    position: fixed;\n                    left: 0;\n                    top: 0;\n                    bottom: 0;\n                    right: 0;\n                    background: black;\n                    z-index: 999;\n                ";
      }
    };

    var parent = this.getParentDiv();

    if (parent !== null && parent.className === "dosbox-container") {
      requestFn(parent);
    } else {
      requestFn(this.dos.canvas);
    }
  }; // * `exitFullscreen()` allows you to leave fullscreen entered with `fullscreen()` call


  DosCommandInterface.prototype.exitFullscreen = function () {
    var _this = this;

    var requestFn = function requestFn(element) {
      if (_this.fullscreenInitialCssStyle !== undefined) {
        element.style.cssText = _this.fullscreenInitialCssStyle;
        delete _this.fullscreenInitialCssStyle;
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };

    var parent = this.getParentDiv();

    if (parent !== null && parent.className === "dosbox-container") {
      requestFn(parent);
    } else {
      requestFn(this.dos.canvas);
    }
  }; // * `listenStdout()` - redirect everything that printed by dosbox into
  // console to passed function


  DosCommandInterface.prototype.listenStdout = function (onstdout) {
    this.onstdout = onstdout;
  }; // * `shell([cmd1, cmd2, ...])` - executes passed commands
  // in dosbox shell if it's runned, returns Promise that
  // resolves when commands sequence is executed


  DosCommandInterface.prototype.shell = function () {
    var _this = this;

    var cmd = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      cmd[_i] = arguments[_i];
    }

    if (cmd.length === 0) {
      return;
    }

    return new Promise(function (resolve, reject) {
      _this.shellInputClients.push(resolve);

      for (var _i = 0, cmd_1 = cmd; _i < cmd_1.length; _i++) {
        var next = cmd_1[_i];

        _this.shellInputQueue.push(next);
      }

      _this.requestShellInput();
    });
  }; // * `screenshot()` - get screnshot of canvas as ImageData


  DosCommandInterface.prototype.screenshot = function () {
    var _this = this;

    return new Promise(function (resolve) {
      _this.api.send("screenshot", "", function (data) {
        resolve(data);
      });
    });
  }; // * `exit()` - immediately exit from runtime


  DosCommandInterface.prototype.exit = function () {
    try {
      this.dos.terminate();
      this.api.send("exit");
    } catch (e) {
      return 0;
    }

    this.dos.error("Runtime is still alive!");
    return -1;
  }; // * `simulateKeyEvent(keyCode, pressed)` - allows to simulate key press OR release on js-dos canvas


  DosCommandInterface.prototype.simulateKeyEvent = function (keyCode, pressed) {
    var name = pressed ? "keydown" : "keyup";
    var event = document.createEvent("KeyboardEvent");
    var getter = {
      get: function get() {
        return this.keyCodeVal;
      }
    }; // Chromium Hack

    Object.defineProperty(event, "keyCode", getter);
    Object.defineProperty(event, "which", getter);
    Object.defineProperty(event, "charCode", getter);
    event.initKeyboardEvent ? event.initKeyboardEvent(name, true, true, document.defaultView, false, false, false, false, keyCode, keyCode) : event.initKeyEvent(name, true, true, document.defaultView, false, false, false, false, keyCode, 0);
    event.keyCodeVal = keyCode;
    this.dos.canvas && this.dos.canvas.dispatchEvent(event);
  }; // * `simulateKeyPress(keyCode)` - allows to simulate key press AND release on js-dos canvas


  DosCommandInterface.prototype.simulateKeyPress = function (keyCode) {
    var _this = this;

    this.simulateKeyEvent(keyCode, true);
    setTimeout(function () {
      return _this.simulateKeyEvent(keyCode, false);
    }, 100);
  };

  DosCommandInterface.prototype.getParentDiv = function () {
    if (this.dos.canvas.parentElement instanceof HTMLDivElement) {
      return this.dos.canvas.parentElement;
    }

    return null;
  };

  DosCommandInterface.prototype.getKeyEventConsumer = function () {
    return this.keyEventConsumer;
  };

  DosCommandInterface.prototype.sendKeyPress = function (code) {
    this.api.send("sdl_key_event", code + "");
  };

  DosCommandInterface.prototype.requestShellInput = function () {
    this.sendKeyPress(13);
  };

  DosCommandInterface.prototype.onping = function (msg, args) {
    switch (msg) {
      case "ready":
        this.onready(this);
        break;

      case "frame":
        this.onframe();
        break;

      case "shell_input":
        if (this.shellInputQueue.length === 0) {
          return;
        }

        var buffer = args[0];
        var maxLength = args[1];
        var cmd = this.shellInputQueue.shift();
        var cmdLength = this.em.lengthBytesUTF8(cmd) + 1;

        if (cmdLength > maxLength) {
          if (this.dos.onerror !== undefined) {
            this.dos.onerror("Can't execute cmd '" + cmd + "', because it's bigger then max cmd length " + maxLength);
          }

          return;
        }

        this.em.stringToUTF8(cmd, buffer, cmdLength);

        if (this.shellInputQueue.length === 0) {
          for (var _i = 0, _a = this.shellInputClients; _i < _a.length; _i++) {
            var resolve = _a[_i];
            resolve();
          }

          this.shellInputClients = [];
        } else {
          this.requestShellInput();
        }

        break;

      case "write_stdout":
        var data = args[0];

        if (this.onstdout) {
          this.onstdout(data);
        }

        break;

      default:
      /* do nothing */

    }
  };

  DosCommandInterface.prototype.onframe = function () {
    this.dos.tick();
  };

  return DosCommandInterface;
}();

exports.DosCommandInterface = DosCommandInterface;

},{"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.promise":126}],8:[function(require,module,exports){
"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var js_dos_options_1 = require("./js-dos-options"); // # js-dos default config
// This is default config for dosbox that applies for all runs.
// It's configurable through [options](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options)


function getJsDosConfig(config) {
  var conf = jsdosconf;

  function update(placeholder) {
    conf = conf.replace("%" + placeholder + "%", (config[placeholder] || js_dos_options_1.DosBoxConfigDefaults[placeholder]) + "");
  }

  Object.keys(js_dos_options_1.DosBoxConfigDefaults).forEach(function (name) {
    return update(name);
  });
  return conf;
}

exports.default = getJsDosConfig;
/* tslint:disable:max-line-length */

var jsdosconf = "\n# This is the configurationfile for DOSBox 0.74. (Please use the latest version of DOSBox)\n# Lines starting with a # are commentlines and are ignored by DOSBox.\n# They are used to (briefly) document the effect of each option.\n\n[sdl]\n#       fullscreen: Start dosbox directly in fullscreen. (Press ALT-Enter to go back)\n#       fulldouble: Use double buffering in fullscreen. It can reduce screen flickering, but it can also result in a slow DOSBox.\n#   fullresolution: What resolution to use for fullscreen: original or fixed size (e.g. 1024x768).\n#                     Using your monitor's native resolution with aspect=true might give the best results.\n#                     If you end up with small window on a large screen, try an output different from surface.\n# windowresolution: Scale the window to this size IF the output device supports hardware scaling.\n#                     (output=surface does not!)\n#           output: What video system to use for output.\n#                   Possible values: surface, overlay, opengl, openglnb.\n#         autolock: Mouse will automatically lock, if you click on the screen. (Press CTRL-F10 to unlock)\n#      sensitivity: Mouse sensitivity.\n#      waitonerror: Wait before closing the console if dosbox has an error.\n#         priority: Priority levels for dosbox. Second entry behind the comma is for when dosbox is not focused/minimized.\n#                     pause is only valid for the second entry.\n#                   Possible values: lowest, lower, normal, higher, highest, pause.\n#       mapperfile: File used to load/save the key/event mappings from. Resetmapper only works with the defaul value.\n#     usescancodes: Avoid usage of symkeys, might not work on all operating systems.\n\nfullscreen=false\nfulldouble=false\nfullresolution=original\nwindowresolution=original\noutput=surface\nautolock=%autolock%\nsensitivity=100\nwaitonerror=true\npriority=higher,normal\nmapperfile=mapper-jsdos.map\nusescancodes=true\nvsync=false\n\n[dosbox]\n# language: Select another language file.\n#  machine: The type of machine tries to emulate.\n#           Possible values: hercules, cga, tandy, pcjr, ega, vgaonly, svga_s3, svga_et3000, svga_et4000, svga_paradise, vesa_nolfb, vesa_oldvbe.\n# captures: Directory where things like wave, midi, screenshot get captured.\n#  memsize: Amount of memory DOSBox has in megabytes.\n#             This value is best left at its default to avoid problems with some games,\n#             though few games might require a higher value.\n#             There is generally no speed advantage when raising this value.\n\nlanguage=\nmachine=svga_s3\ncaptures=capture\nmemsize=16\n\n[render]\n# frameskip: How many frames DOSBox skips before drawing one.\n#    aspect: Do aspect correction, if your output method doesn't support scaling this can slow things down!.\n#    scaler: Scaler used to enlarge/enhance low resolution modes.\n#              If 'forced' is appended, then the scaler will be used even if the result might not be desired.\n#            Possible values: none, normal2x, normal3x, advmame2x, advmame3x, advinterp2x, advinterp3x, hq2x, hq3x, 2xsai, super2xsai, supereagle, tv2x, tv3x, rgb2x, rgb3x, scan2x, scan3x.\n\nframeskip=0\naspect=false\nscaler=none\n\n[cpu]\n#      core: CPU Core used in emulation. auto will switch to dynamic if available and appropriate.\n#            Possible values: auto, dynamic, normal, simple.\n#   cputype: CPU Type used in emulation. auto is the fastest choice.\n#            Possible values: auto, 386, 386_slow, 486_slow, pentium_slow, 386_prefetch.\n#    cycles: Amount of instructions DOSBox tries to emulate each millisecond.\n#            Setting this value too high results in sound dropouts and lags.\n#            Cycles can be set in 3 ways:\n#              'auto'          tries to guess what a game needs.\n#                              It usually works, but can fail for certain games.\n#              'fixed #number' will set a fixed amount of cycles. This is what you usually need if 'auto' fails.\n#                              (Example: fixed 4000).\n#              'max'           will allocate as much cycles as your computer is able to handle.\n#\n#            Possible values: auto, fixed, max.\n#   cycleup: Amount of cycles to decrease/increase with keycombo.(CTRL-F11/CTRL-F12)\n# cycledown: Setting it lower than 100 will be a percentage.\n\ncore=auto\ncputype=auto\ncycles=%cycles%\ncycleup=10\ncycledown=20\n\n[mixer]\n#   nosound: Enable silent mode, sound is still emulated though.\n#      rate: Mixer sample rate, setting any device's rate higher than this will probably lower their sound quality.\n#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.\n# blocksize: Mixer block size, larger blocks might help sound stuttering but sound will also be more lagged.\n#            Possible values: 1024, 2048, 4096, 8192, 512, 256.\n# prebuffer: How many milliseconds of data to keep on top of the blocksize.\n\nnosound=false\nrate=44100\nblocksize=1024\nprebuffer=20\n\n[midi]\n#     mpu401: Type of MPU-401 to emulate.\n#             Possible values: intelligent, uart, none.\n# mididevice: Device that will receive the MIDI data from MPU-401.\n#             Possible values: default, win32, alsa, oss, coreaudio, coremidi, none.\n# midiconfig: Special configuration options for the device driver. This is usually the id of the device you want to use.\n#               See the README/Manual for more details.\n\nmpu401=intelligent\nmididevice=default\nmidiconfig=\n\n[sblaster]\n#  sbtype: Type of Soundblaster to emulate. gb is Gameblaster.\n#          Possible values: sb1, sb2, sbpro1, sbpro2, sb16, gb, none.\n#  sbbase: The IO address of the soundblaster.\n#          Possible values: 220, 240, 260, 280, 2a0, 2c0, 2e0, 300.\n#     irq: The IRQ number of the soundblaster.\n#          Possible values: 7, 5, 3, 9, 10, 11, 12.\n#     dma: The DMA number of the soundblaster.\n#          Possible values: 1, 5, 0, 3, 6, 7.\n#    hdma: The High DMA number of the soundblaster.\n#          Possible values: 1, 5, 0, 3, 6, 7.\n# sbmixer: Allow the soundblaster mixer to modify the DOSBox mixer.\n# oplmode: Type of OPL emulation. On 'auto' the mode is determined by sblaster type. All OPL modes are Adlib-compatible, except for 'cms'.\n#          Possible values: auto, cms, opl2, dualopl2, opl3, none.\n#  oplemu: Provider for the OPL emulation. compat might provide better quality (see oplrate as well).\n#          Possible values: default, compat, fast.\n# oplrate: Sample rate of OPL music emulation. Use 49716 for highest quality (set the mixer rate accordingly).\n#          Possible values: 44100, 49716, 48000, 32000, 22050, 16000, 11025, 8000.\n\nsbtype=sb16\nsbbase=220\nirq=7\ndma=1\nhdma=5\nsbmixer=true\noplmode=auto\noplemu=default\noplrate=44100\n\n[gus]\n#      gus: Enable the Gravis Ultrasound emulation.\n#  gusrate: Sample rate of Ultrasound emulation.\n#           Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.\n#  gusbase: The IO base address of the Gravis Ultrasound.\n#           Possible values: 240, 220, 260, 280, 2a0, 2c0, 2e0, 300.\n#   gusirq: The IRQ number of the Gravis Ultrasound.\n#           Possible values: 5, 3, 7, 9, 10, 11, 12.\n#   gusdma: The DMA channel of the Gravis Ultrasound.\n#           Possible values: 3, 0, 1, 5, 6, 7.\n# ultradir: Path to Ultrasound directory. In this directory\n#           there should be a MIDI directory that contains\n#           the patch files for GUS playback. Patch sets used\n#           with Timidity should work fine.\n\ngus=false\ngusrate=44100\ngusbase=240\ngusirq=5\ngusdma=3\nultradir=C:ULTRASND\n\n[speaker]\n# pcspeaker: Enable PC-Speaker emulation.\n#    pcrate: Sample rate of the PC-Speaker sound generation.\n#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.\n#     tandy: Enable Tandy Sound System emulation. For 'auto', emulation is present only if machine is set to 'tandy'.\n#            Possible values: auto, on, off.\n# tandyrate: Sample rate of the Tandy 3-Voice generation.\n#            Possible values: 44100, 48000, 32000, 22050, 16000, 11025, 8000, 49716.\n#    disney: Enable Disney Sound Source emulation. (Covox Voice Master and Speech Thing compatible).\n\npcspeaker=true\npcrate=44100\ntandy=auto\ntandyrate=44100\ndisney=true\n\n[joystick]\n# joysticktype: Type of joystick to emulate: auto (default), none,\n#               2axis (supports two joysticks),\n#               4axis (supports one joystick, first joystick used),\n#               4axis_2 (supports one joystick, second joystick used),\n#               fcs (Thrustmaster), ch (CH Flightstick).\n#               none disables joystick emulation.\n#               auto chooses emulation depending on real joystick(s).\n#               (Remember to reset dosbox's mapperfile if you saved it earlier)\n#               Possible values: auto, 2axis, 4axis, 4axis_2, fcs, ch, none.\n#        timed: enable timed intervals for axis. Experiment with this option, if your joystick drifts (away).\n#     autofire: continuously fires as long as you keep the button pressed.\n#       swap34: swap the 3rd and the 4th axis. can be useful for certain joysticks.\n#   buttonwrap: enable button wrapping at the number of emulated buttons.\n\njoysticktype=auto\ntimed=true\nautofire=false\nswap34=false\nbuttonwrap=false\n\n[serial]\n# serial1: set type of device connected to com port.\n#          Can be disabled, dummy, modem, nullmodem, directserial.\n#          Additional parameters must be in the same line in the form of\n#          parameter:value. Parameter for all types is irq (optional).\n#          for directserial: realport (required), rxdelay (optional).\n#                           (realport:COM1 realport:ttyS0).\n#          for modem: listenport (optional).\n#          for nullmodem: server, rxdelay, txdelay, telnet, usedtr,\n#                         transparent, port, inhsocket (all optional).\n#          Example: serial1=modem listenport:5000\n#          Possible values: dummy, disabled, modem, nullmodem, directserial.\n# serial2: see serial1\n#          Possible values: dummy, disabled, modem, nullmodem, directserial.\n# serial3: see serial1\n#          Possible values: dummy, disabled, modem, nullmodem, directserial.\n# serial4: see serial1\n#          Possible values: dummy, disabled, modem, nullmodem, directserial.\n\nserial1=dummy\nserial2=dummy\nserial3=disabled\nserial4=disabled\n\n[dos]\n#            xms: Enable XMS support.\n#            ems: Enable EMS support.\n#            umb: Enable UMB support.\n# keyboardlayout: Language code of the keyboard layout (or none).\n\nxms=true\nems=true\numb=true\nkeyboardlayout=auto\n\n[ipx]\n# ipx: Enable ipx over UDP/IP emulation.\n\nipx=false\n\n[autoexec]\n# Lines in this section will be run at startup.\n# You can put your MOUNT lines here.\n\n# https://js-dos.com\n# \u2588\u2580\u2580\u2580\u2580\u2580\u2588 \u2588  \u2584\u2584\u2584\u2580\u2580\u2588 \u2588\u2580\u2580\u2580\u2580\u2580\u2588\n# \u2588 \u2588\u2588\u2588 \u2588 \u2588\u2588\u2584 \u2588 \u2580 \u2584 \u2588 \u2588\u2588\u2588 \u2588\n# \u2588 \u2580\u2580\u2580 \u2588 \u2584\u2588\u2588 \u2580 \u2580\u2580\u2588 \u2588 \u2580\u2580\u2580 \u2588\n# \u2580\u2580\u2580\u2580\u2580\u2580\u2580 \u2580 \u2588\u2584\u2580\u2584\u2580 \u2588 \u2580\u2580\u2580\u2580\u2580\u2580\u2580\n# \u2588\u2580\u2584\u2584\u2588\u2580\u2580\u2584\u2584 \u2580 \u2580\u2588\u2584\u2584\u2584\u2584 \u2580\u2584\u2588\u2580\u2588\u2580\n# \u2588\u2580 \u2580 \u2580\u2580\u2584 \u2588\u2580 \u2584 \u2584\u2580\u2580\u2580\u2584 \u2588\u2580\u2588\u2584\n# \u2584 \u2584\u2584 \u2588\u2580\u2580\u2584 \u2584\u2580\u2584\u2580\u2580\u2588  \u2580\u2580\u2584\u2580\u2580\u2588\u2580\n#   \u2584\u2580\u2580\u2588\u2580\u2580 \u2588\u2580\u2588\u2580\u2588\u2580\u2580\u2584 \u2580\u2588\u2588\u2580\u2588\u2584\n# \u2580\u2580\u2580 \u2580 \u2580 \u2588\u2584\u2588 \u2580\u2588\u2584\u2584\u2588\u2580\u2580\u2580\u2588\u2580\u2580\n# \u2588\u2580\u2580\u2580\u2580\u2580\u2588 \u2584\u2584\u2584 \u2584 \u2584 \u2588 \u2580 \u2588\u2584\u2584\u2584\u2584\n# \u2588 \u2588\u2588\u2588 \u2588 \u2580\u2588\u2580\u2580\u2584\u2580\u2580\u2584\u2588\u2588\u2588\u2588\u2580\u2580\u2588\u2584\u2588\n# \u2588 \u2580\u2580\u2580 \u2588 \u2584\u2580\u2580\u2588\u2580\u2588\u2580\u2584 \u2580\u2580\u2584\u2584\u2588\u2584\u2588 \n# \u2580\u2580\u2580\u2580\u2580\u2580\u2580 \u2580   \u2580\u2580 \u2580  \u2580   \u2580\u2580\u2580\n";

},{"./js-dos-options":13,"core-js/modules/es6.array.iterator":117,"core-js/modules/es6.object.keys":123,"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.regexp.replace":130,"core-js/modules/web.dom.iterable":138}],9:[function(require,module,exports){
"use strict"; // # DosDom
// Simple API to work with DOM

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isTouchDevice = "ontouchstart" in document.documentElement; // ### applyCss - add new css style if no html element with id exists

function applyCss(id, css) {
  if (document.getElementById(id) === null) {
    var style = document.createElement("style");
    style.id = id;
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}

exports.applyCss = applyCss; // ### createDiv - typesafe shortcut for creating HTMLDivElement

function createDiv(className, css) {
  var el = document.createElement("div");

  if (className !== undefined) {
    el.className = className;
  }

  if (css !== undefined) {
    applyCss(className + "-style", css);
  }

  return el;
}

exports.createDiv = createDiv; // ### addButtonListener - create touch & mouse listeners that send onPress & onRelease
// events

function addButtonListener(el, onPress, onRelease) {
  var isTouchHeld = false;

  if (isTouchDevice) {
    var heldTouches_1 = {};

    var multitouch = function multitouch(event) {
      if (event.target !== el) {
        return;
      }

      var touches = event.changedTouches; // tslint:disable-next-line:prefer-for-of

      for (var touchIndex = 0; touchIndex < touches.length; touchIndex++) {
        var main = touches[touchIndex];
        var identifier = main.identifier;

        switch (event.type) {
          case "touchstart":
            {
              if (Object.keys(heldTouches_1).length === 0) {
                onPress();
              }

              heldTouches_1[identifier] = 1;
            }
            break;

          case "touchend":
            {
              delete heldTouches_1[identifier];

              if (Object.keys(heldTouches_1).length === 0) {
                onRelease();
              }
            }
            break;

          default:
            return;
        }

        isTouchHeld = Object.keys(heldTouches_1).length > 0;
        event.preventDefault();
      }
    };

    el.addEventListener("touchmove", multitouch, true);
    el.addEventListener("touchstart", multitouch, true);
    el.addEventListener("touchend", multitouch, true);
  }

  var isMousePressed = false;

  var onMouseButtonDown = function onMouseButtonDown(event) {
    if (isTouchHeld || event.button !== 0 || event.target !== el) {
      return;
    }

    isMousePressed = true;
    onPress();
    event.preventDefault();
  };

  var onMouseButtonUp = function onMouseButtonUp(event) {
    if (isTouchHeld || !isMousePressed || event.button !== 0) {
      return;
    }

    isMousePressed = false;
    onRelease();
    event.preventDefault();
  };

  var onMouseLeave = function onMouseLeave(event) {
    if (isTouchHeld || !isMousePressed || event.button !== 0) {
      return;
    }

    isMousePressed = false;
    onRelease();
  };

  el.addEventListener("mousedown", onMouseButtonDown, true);
  el.addEventListener("mouseup", onMouseButtonUp, true);
  el.addEventListener("mouseleave", onMouseLeave, true);
}

exports.addButtonListener = addButtonListener;

},{"core-js/modules/es6.array.iterator":117,"core-js/modules/es6.object.keys":123,"core-js/modules/es6.object.to-string":125,"core-js/modules/web.dom.iterable":138}],10:[function(require,module,exports){
"use strict"; // # DosFS
// API for working with file system of dosbox

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.typed.uint8-array");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var js_dos_cache_noop_1 = require("./js-dos-cache-noop");

var js_dos_xhr_1 = require("./js-dos-xhr"); // ## DosFS


var DosFS =
/** @class */
function () {
  function DosFS(dos) {
    var _this = this;

    this.syncingPromise = null;
    this.lastSyncTime = 0;
    this.dos = dos;
    this.em = dos;
    this.fs = dos.FS; // Sync fs to indexed db periodically

    this.dos.registerTickListener(function () {
      if (Date.now() - _this.lastSyncTime < 5000) {
        return;
      }

      _this.lastSyncTime = Date.now();

      _this.syncFs();
    });
    this.dos.registerPauseListener(function () {
      return _this.syncFs();
    });
    this.dos.registerTerminateListener(function () {
      return _this.syncFs();
    });
  }

  DosFS.prototype.chdir = function (path) {
    this.fs.chdir(path);
  }; // ### extract


  DosFS.prototype.extract = function (url, mountPoint, type) {
    if (mountPoint === void 0) {
      mountPoint = "/";
    }

    if (type === void 0) {
      type = "zip";
    } // simplified version of extractAll, works only for one archive. It calls extractAll inside.


    return this.extractAll([{
      url: url,
      mountPoint: mountPoint,
      type: type
    }]);
  }; // ### extractAll


  DosFS.prototype.extractAll = function (sources) {
    var _this = this; // download given [`sources`](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-dosarchivesource)
    // and extract them to mountPoint's.
    //
    // this method will return `Promise<void>`, that will be resolved
    // on success with empty object or rejected


    var extractArchiveInCwd = function extractArchiveInCwd(url, path, type) {
      return new Promise(function (resolve, reject) {
        if (type !== "zip") {
          reject("Only ZIP archive is supported");
          return;
        }

        new js_dos_xhr_1.Xhr(url, {
          cache: new js_dos_cache_noop_1.default(),
          responseType: "arraybuffer",
          fail: function fail(msg) {
            return reject(msg);
          },
          progress: function progress(total, loaded) {
            if (_this.dos.onprogress !== undefined) {
              _this.dos.onprogress("Downloading " + url, total, loaded);
            }
          },
          success: function success(data) {
            _this.chdir(path);

            var bytes = new Uint8Array(data);

            var buffer = _this.em._malloc(bytes.length);

            _this.em.HEAPU8.set(bytes, buffer);

            var retcode = _this.em._extract_zip(buffer, bytes.length);

            _this.em._free(buffer);

            if (retcode === 0) {
              _this.writeOk(path);

              resolve();
            } else {
              reject("Can't extract zip, retcode " + retcode + ", see more info in logs");
            }
          }
        });
      });
    };

    var prepareMountFunction = function prepareMountFunction(source) {
      var mountPoint = _this.normalizePath(source.mountPoint);

      var type = source.type || "zip";
      var isRoot = mountPoint === "/" || mountPoint.length === 0;
      var parts = mountPoint.split("/");

      _this.createPath(parts, 0, parts.length);

      var mountFn = function mountFn() {
        if (isRoot || !_this.readOk(mountPoint)) {
          if (!isRoot) {
            _this.dos.warn("Indexed db does not contains '" + mountPoint + "' rewriting...");
          }

          return extractArchiveInCwd(source.url, mountPoint, type);
        }

        return Promise.resolve();
      };

      if (!isRoot) {
        _this.fs.mount(_this.fs.filesystems.IDBFS, {}, mountPoint);
      }

      return mountFn;
    };

    return new Promise(function (resolve, reject) {
      if (_this.lastSyncTime > 0) {
        reject("Can't create persistent mount point, after syncing process starts");
        return;
      }

      var mountFunctions = [];

      for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
        var source = sources_1[_i];
        mountFunctions.push(prepareMountFunction(source));
      }

      _this.fs.syncfs(true, function (err) {
        if (err) {
          _this.dos.error("Can't restore FS from indexed db, cause: " + err);
        }

        var promises = [];

        for (var _i = 0, mountFunctions_1 = mountFunctions; _i < mountFunctions_1.length; _i++) {
          var mountFn = mountFunctions_1[_i];
          promises.push(mountFn());
        }

        Promise.all(promises).then(function () {
          _this.syncFs().then(resolve).catch(reject);
        }).catch(reject);
      });
    });
  }; // ### createFile


  DosFS.prototype.createFile = function (file, body) {
    // [synchronous] allow to create file in FS, you can pass absolute path.
    // All directories will be created
    //
    // body can be string or ArrayBuffer or Uint8Array
    if (body instanceof ArrayBuffer) {
      body = new Uint8Array(body);
    } // windows style path are also valid, but **drive letter is ignored**
    // if you pass only filename, then file will be writed in root "/" directory


    file = file.replace(new RegExp("^[a-zA-z]+:"), "").replace(new RegExp("\\\\", "g"), "/");
    var parts = file.split("/");

    if (parts.length === 0) {
      if (this.dos.onerror !== undefined) {
        this.dos.onerror("Can't create file '" + file + "', because it's not valid file path");
      }

      return;
    }

    var filename = parts[parts.length - 1].trim();

    if (filename.length === 0) {
      if (this.dos.onerror !== undefined) {
        this.dos.onerror("Can't create file '" + file + "', because file name is empty");
      }

      return;
    }
    /* i < parts.length - 1, because last part is file name */


    var path = this.createPath(parts, 0, parts.length - 1);
    this.fs.createDataFile(path, filename, body, true, true, true);
  };

  DosFS.prototype.createPath = function (parts, begin, end) {
    var path = "";

    for (var i = begin; i < end; ++i) {
      var part = parts[i].trim();

      if (part.length === 0) {
        continue;
      }

      this.fs.createPath(path, part, true, true);
      path = path + "/" + part;
    }

    return path;
  };

  DosFS.prototype.syncFs = function () {
    var _this = this;

    if (this.syncingPromise) {
      return this.syncingPromise;
    }

    this.syncingPromise = new Promise(function (resolve, reject) {
      var startedAt = Date.now();

      _this.fs.syncfs(false, function (err) {
        if (err) {
          _this.dos.error("Can't sync FS to indexed db, cause: " + err);

          reject(err);
        }

        _this.syncingPromise = null;
        _this.lastSyncTime = Date.now();
        resolve();
      });
    });
    return this.syncingPromise;
  };

  DosFS.prototype.normalizePath = function (path) {
    if (path.length === 0 || path[0] !== "/") {
      path = "/" + path;
    }

    if (path.length > 1 && path.endsWith("/")) {
      path = path.substr(0, path.length - 1);
    }

    return path;
  };

  DosFS.prototype.readOk = function (path) {
    try {
      var readed = this.fs.readFile(path + "/state.fs");
      return readed[0] === 79 && readed[1] === 70;
    } catch (_a) {
      return false;
    }
  };

  DosFS.prototype.writeOk = function (path) {
    this.createFile(path + "/state.fs", new Uint8Array([79, 70])); // Ok
  };

  return DosFS;
}();

exports.DosFS = DosFS;

},{"./js-dos-cache-noop":5,"./js-dos-xhr":15,"core-js/modules/es6.array.iterator":117,"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.promise":126,"core-js/modules/es6.regexp.constructor":127,"core-js/modules/es6.regexp.replace":130,"core-js/modules/es6.regexp.split":131,"core-js/modules/es6.string.ends-with":133,"core-js/modules/es6.string.iterator":134,"core-js/modules/es6.typed.uint8-array":136,"core-js/modules/web.dom.iterable":138}],11:[function(require,module,exports){
"use strict"; // # DosHost
// This class is used to detect and provide information about
// features that supported in current environment

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es6.math.trunc");

require("core-js/modules/es6.math.clz32");

require("core-js/modules/es6.math.fround");

require("core-js/modules/es6.math.imul");

require("core-js/modules/es6.typed.uint8-array");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* tslint:disable:member-ordering */

var js_dos_build_1 = require("./js-dos-build");

var js_dos_xhr_1 = require("./js-dos-xhr");

var DosHost =
/** @class */
function () {
  function DosHost() {
    this.wasmSupported = false;
    this.global = window;
    this.wdosboxPromise = null;
    this.global.exports = {}; // ### WebAssembly
    // Host able to detect is WebAssembly supported or not,
    // this information is stored in `Host.wasmSupported` variable

    try {
      if ((typeof WebAssembly === "undefined" ? "undefined" : _typeof(WebAssembly)) === "object" && typeof WebAssembly.instantiate === "function" && typeof WebAssembly.compile === "function") {
        var wmodule = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

        if (wmodule instanceof WebAssembly.Module) {
          this.wasmSupported = new WebAssembly.Instance(wmodule) instanceof WebAssembly.Instance;
        }
      }
    } catch (error) {}
    /* do nothing WebAssembly is not supported */
    // ### polyfill
    // Host also provides limited set of polyfills to support legacy browsers


    this.polyfill();
  } // Currently polyfill contains implementations for:
  // `Math.imul`, `Math.fround`, `Math.clz32`, `Math.trunc`

  /* tslint:disable:no-bitwise */

  /* tslint:disable:only-arrow-functions */


  DosHost.prototype.polyfill = function () {
    if (!Math.imul || Math.imul(0xffffffff, 5) !== -5) {
      Math.imul = function imul(a, b) {
        var ah = a >>> 16;
        var al = a & 0xffff;
        var bh = b >>> 16;
        var bl = b & 0xffff;
        return al * bl + (ah * bl + al * bh << 16) | 0;
      };
    }

    Math.imul = Math.imul;

    if (!Math.fround) {
      Math.fround = function (x) {
        return x;
      };
    }

    Math.fround = Math.fround;

    if (!Math.clz32) {
      Math.clz32 = function (x) {
        x = x >>> 0;

        for (var i = 0; i < 32; i++) {
          if (x & 1 << 31 - i) {
            return i;
          }
        }

        return 32;
      };
    }

    Math.clz32 = Math.clz32;

    if (!Math.trunc) {
      Math.trunc = function (x) {
        return x < 0 ? Math.ceil(x) : Math.floor(x);
      };
    }

    Math.trunc = Math.trunc;
  }; // ### resolveDosBox
  // `resolveDosBox` is another important task of DosHost


  DosHost.prototype.resolveDosBox = function (url, cache, module) {
    var _this = this; // When dosbox is resolved, WDOSBOX module is set to
    // global variable `exports.WDOSBOX`. This variable is
    // used to prevent next loads of same dosbox module.


    if (this.global.exports.WDOSBOX) {
      module.ondosbox(this.global.exports.WDOSBOX, this.global.exports.instantiateWasm);
      return;
    }

    if (this.wdosboxPromise === null) {
      this.wdosboxPromise = this.compileDosBox(url, cache, module);
    }

    this.wdosboxPromise.then(function (instance) {
      /* leave promise scope */
      var fn = function fn() {
        _this.wdosboxPromise = null;
        module.ondosbox(_this.global.exports.WDOSBOX, _this.global.exports.instantiateWasm);
      };

      setTimeout(fn, 1);
    }, function (message) {
      /* leave promise scope */
      var fn = function fn() {
        _this.wdosboxPromise = null;

        if (module.onerror !== undefined) {
          module.onerror(message);
        }
      };

      setTimeout(fn, 1);
    });
  }; // If dosbox is not yet resolved, then:


  DosHost.prototype.compileDosBox = function (url, cache, module) {
    var fromIndex = url.lastIndexOf("/");
    var wIndex = url.indexOf("w", fromIndex);
    var isWasmUrl = wIndex === fromIndex + 1 && wIndex >= 0;

    if (this.wasmSupported && isWasmUrl) {
      return this.compileWasmDosBox(url, cache, module);
    } else {
      if (module.log) {
        module.log("[WARN] Using js version of dosbox, perfomance can be lower then expected");
        module.log("[DEBUG] Wasm supported: " + this.wasmSupported + ", url: " + url);
      } // fallback to js version if wasm not supported


      if (isWasmUrl) {
        url = url.substr(0, wIndex) + url.substr(wIndex + 1);

        if (url.endsWith("dosbox.js")) {
          // do not use dosbox.js, because it's not asm.js
          url = url.replace("dosbox.js", "dosbox-emterp.js");
        }
      }

      return this.compileJsDosBox(url, cache, module);
    }
  };

  DosHost.prototype.compileJsDosBox = function (url, cache, module) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var buildTotal = js_dos_build_1.Build.jsSize;
      var memUrl = url.replace(".js", ".js.mem"); // * Host download `dosbox.js`

      new js_dos_xhr_1.Xhr(url, {
        cache: cache,
        progress: function progress(total, loaded) {
          if (module.onprogress) {
            module.onprogress("Resolving DosBox (" + url + ")", buildTotal, Math.min(buildTotal, loaded));
          }
        },
        fail: function fail(url, status, message) {
          reject("Can't download dosbox.js, code: " + status + ", message: " + message + ", url: " + url);
        },
        success: function success(response) {
          if (module.onprogress !== undefined) {
            module.onprogress("Resolving DosBox (" + url + ")", buildTotal, buildTotal);
          }

          response +=
          /* tslint:disable:no-eval */
          eval.call(_this, response);
          /* tslint:enable:no-eval */

          resolve(_this.global.exports.WDOSBOX);
        }
      });
    });
  };

  DosHost.prototype.compileWasmDosBox = function (url, cache, module) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var buildTotal = js_dos_build_1.Build.wasmSize + js_dos_build_1.Build.wasmJsSize;
      var wasmUrl = url.replace(".js", ".wasm.js"); // * Host downloads `wdosbox` asm + js scripts

      new js_dos_xhr_1.Xhr(wasmUrl, {
        cache: cache,
        responseType: "arraybuffer",
        progress: function progress(total, loaded) {
          if (module.onprogress) {
            module.onprogress("Resolving DosBox (" + url + ")", buildTotal, Math.min(js_dos_build_1.Build.wasmSize, loaded));
          }
        },
        fail: function fail(url, status, message) {
          reject("Can't download wasm, code: " + status + ", message: " + message + ", url: " + url);
        },
        success: function success(response) {
          // * Compile dosbox wasm module
          var promise = WebAssembly.compile(response);

          var onreject = function onreject(reason) {
            reject(reason + "");
          };

          promise.catch(onreject);
          promise.then(function (wasmModule) {
            _this.global.exports.instantiateWasm = function (info, receiveInstance) {
              info.env.globalscall = function () {
                var args = [];

                for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
                }

                if (module.onglobals) {
                  module.onglobals.apply(null, args);
                }
              }; // *  Instaniate it for each new dosbox runtime


              return WebAssembly.instantiate(wasmModule, info).catch(onreject).then(function (instance) {
                receiveInstance(instance, wasmModule);
              });
            };

            new js_dos_xhr_1.Xhr(url, {
              cache: cache,
              progress: function progress(total, loaded) {
                if (module.onprogress) {
                  module.onprogress("Resolving DosBox", buildTotal, Math.min(buildTotal, js_dos_build_1.Build.wasmSize + loaded));
                }
              },
              fail: function fail(url, status, message) {
                reject("Can't download wdosbox.js, code: " + status + ", message: " + message + ", url: " + url);
              },
              success: function success(response) {
                if (module.onprogress !== undefined) {
                  module.onprogress("Resolving DosBox", buildTotal, buildTotal);
                }

                response +=
                /* tslint:disable:no-eval */
                eval.call(window, response);
                /* tslint:enable:no-eval */

                resolve(_this.global.exports.WDOSBOX);
              }
            });
          });
        }
      });
    });
  };

  return DosHost;
}();

exports.Host = new DosHost();

},{"./js-dos-build":3,"./js-dos-xhr":15,"core-js/modules/es6.math.clz32":118,"core-js/modules/es6.math.fround":119,"core-js/modules/es6.math.imul":120,"core-js/modules/es6.math.trunc":121,"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.promise":126,"core-js/modules/es6.regexp.replace":130,"core-js/modules/es6.string.ends-with":133,"core-js/modules/es6.symbol":135,"core-js/modules/es6.typed.uint8-array":136,"core-js/modules/es7.symbol.async-iterator":137}],12:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.set-prototype-of");

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var js_dos_build_1 = require("./js-dos-build");

var js_dos_ci_1 = require("./js-dos-ci");

var js_dos_conf_1 = require("./js-dos-conf");

var js_dos_fs_1 = require("./js-dos-fs");

var js_dos_options_1 = require("./js-dos-options");

var js_dos_ui_1 = require("./js-dos-ui");

var DosModule =
/** @class */
function (_super) {
  __extends(DosModule, _super);

  function DosModule(canvas, onready) {
    var _this = _super.call(this) || this;

    _this.isValid = false;
    _this.version = js_dos_build_1.Build.version;
    _this.fs = null;
    _this.ui = null;
    _this.tickListeners = [];
    _this.pauseListeners = [];
    _this.resumeListeners = [];
    _this.terminateListeners = [];

    _this.ciResolveFn = function () {};

    _this.canvas = canvas;
    _this.onready = onready;
    _this.ci = new Promise(function (resolve) {
      _this.ciResolveFn = resolve;
    });

    _this.registerDefaultListeners();

    return _this;
  }

  DosModule.prototype.registerDefaultListeners = function () {
    var _this = this;

    var hidden;
    var visibilityChange;

    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener("visibilityChange", function () {
      document[hidden] ? _this.pause() : _this.resume();
    }, false);
    window.addEventListener("beforeunload", function () {
      _this.terminate();
    });
  }; // ### logging
  // DosModule implements simply logging features:
  // `debug`, `info`, `warn`, `error` methods


  DosModule.prototype.debug = function (message) {
    if (this.log !== undefined) {
      this.log("[DEBUG] " + message);
    }
  };

  DosModule.prototype.info = function (message) {
    if (this.log !== undefined) {
      this.log("[INFO] " + message);
    }
  };

  DosModule.prototype.warn = function (message) {
    if (this.log !== undefined) {
      this.log("[WARN] " + message);
    }
  };

  DosModule.prototype.error = function (message) {
    if (this.log !== undefined) {
      this.log("[ERROR] " + message);
    }
  }; // ### ondosbox


  DosModule.prototype.ondosbox = function (dosbox, instantiateWasm) {
    this.info("DosBox resolved");
    this.instantiateWasm = instantiateWasm;
    this.instance = new dosbox(this);
  }; // Method `ondosbox` is called when
  // [Host](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-host) is resolved.
  // This method instaniate wasm dosbox module with `this` as emscripten
  // module object. It means that emscripten will call
  // `this.onRuntimeInitialized` when runtime will be ready


  DosModule.prototype.resolve = function () {
    var _this = this;

    if (!this.wdosboxUrl) {
      this.wdosboxUrl = "wdosbox.js";
    }

    if (!this.log) {
      /* tslint:disable:no-console */
      this.log = function (message) {
        return console.log(message);
      };
    }

    if (!this.canvas) {
      if (this.onerror !== undefined) {
        this.onerror("canvas field is required, but not set!");
      }

      return;
    }

    if (!this.onprogress) {
      this.ui = new js_dos_ui_1.DosUi(this);

      this.onprogress = function (stage, total, loaded) {
        if (_this.ui !== null) {
          _this.ui.onprogress(stage, total, loaded);
        }
      };
    } // ### sdl defaults
    // DosModule overrides defaults for emscripten SDL wrapper
    // for maximum performance


    this.SDL = {
      defaults: {
        widht: 320,
        height: 200,
        copyOnLock: false,
        discardOnLock: true,
        opaqueFrontBuffer: false
      }
    };
    this.isValid = true;
  }; // ### onRuntimeInitialized


  DosModule.prototype.onRuntimeInitialized = function () {
    var _this = this;

    var mainFn = function mainFn(args) {
      // When emscripten runtime is initialized and main
      // function is called:
      //
      // * DosModule detach [auto ui](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ui)
      if (_this.ui !== null) {
        _this.ui.detach();

        _this.ui = null;
      }

      if (!args) {
        args = [];
      }

      if (_this.fs === null) {
        return new Promise(function (resolve, reject) {
          reject("IllegalState: fs is null");
        });
      }

      _this.fs.chdir("/"); // * Write default [dosbox.conf](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-conf)
      // file to user directory


      _this.fs.createFile("/home/web_user/.dosbox/dosbox-jsdos.conf", js_dos_conf_1.default(_this)); // * Mount emscripten FS as drive c:


      args.unshift("-userconf", "-c", "mount c .", "-c", "c:"); // [DosCommandInterface](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ci)

      new js_dos_ci_1.DosCommandInterface(_this, function (ci) {
        _this.ciResolveFn(ci);
      }); // * Run dosbox with passed arguments and resolve

      _this.callMain(args);

      return _this.ci;
    };

    this.fs = new js_dos_fs_1.DosFS(this);
    this.onready({
      fs: this.fs,
      main: mainFn
    });
  }; // ### registerTickListener
  // registred tick listener it will be called each frame


  DosModule.prototype.registerTickListener = function (listener) {
    this.tickListeners.push(listener);
  }; // ### registerPauseListener
  // registred tick listener it will be called each frame


  DosModule.prototype.registerPauseListener = function (listener) {
    this.pauseListeners.push(listener);
  }; // ### registerResumeListener
  // registred tick listener it will be called each frame


  DosModule.prototype.registerResumeListener = function (listener) {
    this.resumeListeners.push(listener);
  }; // ### registerTerminateListener
  // registred tick listener it will be called each frame


  DosModule.prototype.registerTerminateListener = function (listener) {
    this.terminateListeners.push(listener);
  }; // ### tick
  // tick is called internally each frame, no need to call
  // it manually


  DosModule.prototype.tick = function () {
    for (var _i = 0, _a = this.tickListeners; _i < _a.length; _i++) {
      var l = _a[_i];
      l();
    }
  }; // ### pause
  // pause is called when dosbox tab became inactive


  DosModule.prototype.pause = function () {
    for (var _i = 0, _a = this.pauseListeners; _i < _a.length; _i++) {
      var l = _a[_i];
      l();
    }
  }; // ### tick
  // resume is called when dosbox tab became active


  DosModule.prototype.resume = function () {
    for (var _i = 0, _a = this.resumeListeners; _i < _a.length; _i++) {
      var l = _a[_i];
      l();
    }
  }; // ### tick
  // terminate is called when dosbox tab is closed


  DosModule.prototype.terminate = function () {
    for (var _i = 0, _a = this.terminateListeners; _i < _a.length; _i++) {
      var l = _a[_i];
      l();
    }
  };

  return DosModule;
}(js_dos_options_1.DosOptions);

exports.DosModule = DosModule;

},{"./js-dos-build":3,"./js-dos-ci":7,"./js-dos-conf":8,"./js-dos-fs":10,"./js-dos-options":13,"./js-dos-ui":14,"core-js/modules/es6.object.set-prototype-of":124,"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.promise":126}],13:[function(require,module,exports){
"use strict"; // # DosOptions
// Is a options object that you pass to constructor of
// [Dos](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos)
// class, to configure emulation layer

require("core-js/modules/es6.object.set-prototype-of");

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DosBoxConfig =
/** @class */
function () {
  function DosBoxConfig() {}

  return DosBoxConfig;
}();

exports.DosBoxConfig = DosBoxConfig; // tslint:disable-next-line:max-classes-per-file

var DosOptions =
/** @class */
function (_super) {
  __extends(DosOptions, _super);

  function DosOptions() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return DosOptions;
}(DosBoxConfig);

exports.DosOptions = DosOptions;
exports.DosBoxConfigDefaults = {
  cycles: "max",
  autolock: false
};

},{"core-js/modules/es6.object.set-prototype-of":124}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
}); // # JsDosUi
// Optional ui module for js-dos.
// This ui will be applied if client did not set `onprogress` in
// [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options)

var DosDom = require("./js-dos-dom");

var maxStageLength = 32;

var DosUi =
/** @class */
function () {
  function DosUi(dos) {
    this.overlay = null;
    this.loaderMessage = null;
    this.hidden = true; // ### Style

    /* tslint:disable:member-ordering */

    /* tslint:disable:max-line-length */

    this.css = "\n    .dosbox-container { position: relative; min-width: 320px; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; }\n    .dosbox-overlay, .dosbox-loader { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: rgba(51, 51, 51, 0.7); }\n    .dosbox-start { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; color: #fff; font-size: 1.5em; text-decoration: underline; cursor: pointer; }\n    .dosbox-overlay a { color: #fff; }\n    .dosbox-powered { position: absolute; right: 1em; bottom: 1em; font-size: 0.8em; color: #9C9C9C; }\n    .dosbox-loader-message { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; margin: 0 0 -3em 0; box-sizing: border-box; color: #fff; font-size: 1.5em; }\n    @-moz-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @-webkit-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } .st-loader { width: 10em; height: 2.5em; position: absolute; top: 50%; left: 50%; margin: -1.25em 0 0 -5em; box-sizing: border-box; }\n    .st-loader:before, .st-loader:after { content: \"\"; display: block; position: absolute; top: 0; bottom: 0; width: 1.25em; box-sizing: border-box; border: 0.25em solid #fff; }\n    .st-loader:before { left: -0.76923em; border-right: 0; }\n    .st-loader:after { right: -0.76923em; border-left: 0; }\n    .st-loader .equal { display: block; position: absolute; top: 50%; margin-top: -0.5em; left: 4.16667em; height: 1em; width: 1.66667em; border: 0.25em solid #fff; box-sizing: border-box; border-width: 0.25em 0; -moz-animation: loading 1.5s infinite ease-in-out; -webkit-animation: loading 1.5s infinite ease-in-out; animation: loading 1.5s infinite ease-in-out; background: #fff; }\n    "; // ### Template

    /* tslint:disable:member-ordering */

    /* tslint:disable:max-line-length */

    this.overlayHtml = "\n        <div class=\"dosbox-loader\">\n            <div class=\"st-loader\">\n                <span class=\"equal\"></span>\n            </div>\n            <div class=\"dosbox-loader-message\"></div>\n        </div>\n        <div class=\"dosbox-powered\">\n            Powered by &nbsp;<a href=\"https://js-dos.com\">js-dos.com</a> (6.22)\n        </div>\n    ";
    this.dos = dos;
    this.canvas = dos.canvas; // ### How it works
    // This ui replace canvas element with div .dosbox-container,
    // that contains original canvas and .dosbox-overlay as children
    // You can change style of ui by editing css for this two classes

    try {
      DosDom.applyCss("js-dos-ui-css", this.css);

      if (this.canvas.parentElement !== null && this.canvas.parentElement.className !== "dosbox-container") {
        var container_1 = DosDom.createDiv("dosbox-container");
        var parent_1 = this.canvas.parentElement;
        parent_1.replaceChild(container_1, this.canvas);
        container_1.appendChild(this.canvas);
        var overlay = DosDom.createDiv("dosbox-overlay");
        container_1.appendChild(overlay);
        overlay.innerHTML = this.overlayHtml;
      }

      var container = this.canvas.parentElement;

      if (container === null) {
        throw new Error("Illegal state, container is null");
      }

      this.overlay = this.childById(container, "dosbox-overlay");

      if (this.overlay === null) {
        throw new Error("Illegal state, overlay is null");
      }

      this.loaderMessage = this.childById(this.overlay, "dosbox-loader-message");
      this.hidden = true;
      this.show();
    } catch (e) {
      this.onprogress = this.onprogressFallback;
    }
  }

  DosUi.prototype.onprogress = function (stage, total, loaded) {
    if (stage.length > maxStageLength) {
      stage = "…" + stage.substr(-maxStageLength);
    }

    var message = stage + " " + Math.round(loaded * 100 / total * 10) / 10 + "%";

    if (this.loaderMessage !== null) {
      this.loaderMessage.innerHTML = message;
    }

    this.dos.info(message);

    if (loaded >= total) {
      this.hide();
    } else {
      this.show();
    }
  };

  DosUi.prototype.detach = function () {
    this.hide();
    this.onprogress = this.onprogressFallback;
  };

  DosUi.prototype.hide = function () {
    if (this.hidden) {
      return;
    }

    this.hidden = true;

    if (this.overlay !== null) {
      this.overlay.setAttribute("style", "display: none");
    }
  };

  DosUi.prototype.show = function () {
    if (!this.hidden) {
      return;
    }

    this.hidden = false;

    if (this.overlay !== null) {
      this.overlay.setAttribute("style", "display: block");
    }
  };

  DosUi.prototype.onprogressFallback = function (stage, total, loaded) {
    this.dos.info(stage + " " + loaded * 100 / total + "%");
  };

  DosUi.prototype.childById = function (parent, className) {
    if (parent === null) {
      return null;
    }

    for (var i = 0; i < parent.childElementCount; ++i) {
      var child = parent.children[i];

      if (child.className === className) {
        return child;
      }

      child = this.childById(child, className);

      if (child !== null) {
        return child;
      }
    }

    return null;
  };

  return DosUi;
}();

exports.DosUi = DosUi;

},{"./js-dos-dom":9}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var js_dos_cache_noop_1 = require("./js-dos-cache-noop"); // * `method` - "GET" | "POST"
// * `success` - callback when resource is downloaded
// * `progress` - callback for progress
// * `fail` - fail callback
// * `data` - data for POST request, should typeof `application/x-www-form-urlencoded`
// * `responseType` - XMLHttpRequestResponseType
// Class Xhr does not have any public methods


var Xhr =
/** @class */
function () {
  function Xhr(url, options) {
    var _this = this;

    this.xhr = null;
    this.total = 0;
    this.loaded = 0;
    this.resource = url;
    this.options = options;
    this.options.method = options.method || "GET";
    this.cache = options.cache || new js_dos_cache_noop_1.default();

    if (this.options.method === "GET") {
      this.cache.get(this.resource, function (data) {
        if (_this.options.success !== undefined) {
          _this.options.success(data);
        }
      }, function () {
        _this.makeHttpRequest();
      });
    }
  }

  Xhr.prototype.makeHttpRequest = function () {
    var _this = this;

    this.xhr = new XMLHttpRequest();
    this.xhr.open(this.options.method || "GET", this.resource, true);

    if (this.options.method === "POST") {
      this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    this.xhr.overrideMimeType("text/plain; charset=x-user-defined");
    var progressListner;

    if (typeof (progressListner = this.xhr).addEventListener === "function") {
      progressListner.addEventListener("progress", function (evt) {
        _this.total = evt.total;
        _this.loaded = evt.loaded;

        if (_this.options.progress) {
          return _this.options.progress(evt.total, evt.loaded);
        }
      });
    }

    var errorListener;

    if (typeof (errorListener = this.xhr).addEventListener === "function") {
      errorListener.addEventListener("error", function (evt) {
        if (_this.options.fail) {
          _this.options.fail(_this.resource, _this.xhr.status, "connection problem");

          return delete _this.options.fail;
        }
      });
    }

    this.xhr.onreadystatechange = function () {
      return _this.onReadyStateChange();
    };

    if (this.options.responseType) {
      this.xhr.responseType = this.options.responseType;
    }

    this.xhr.send(this.options.data);
  };

  Xhr.prototype.onReadyStateChange = function () {
    var xhr = this.xhr;

    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (this.options.success) {
          var total = Math.max(this.total, this.loaded);

          if (this.options.progress !== undefined) {
            this.options.progress(total, total);
          }

          if (this.options.method === "GET" && this.resource.indexOf("?") < 0) {
            this.cache.put(this.resource, xhr.response, function () {});
          }

          return this.options.success(xhr.response);
        }
      } else if (this.options.fail) {
        this.options.fail(this.resource, xhr.status, "connection problem");
        return delete this.options.fail;
      }
    }
  };

  return Xhr;
}();

exports.Xhr = Xhr;

},{"./js-dos-cache-noop":5}],16:[function(require,module,exports){
"use strict"; // # Example
// ```javascript
// Dos(canvas).ready((fs, main) => {
//     fs.extract("digger.zip").then(() => {
//         main(["-c", "DIGGER.COM"])
//     });
// });
// ```
// Dos function is entry point that provides emulation layer.
// As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
}); // # Dos

var js_dos_cache_1 = require("./js-dos-cache");

var js_dos_host_1 = require("./js-dos-host");

var js_dos_module_1 = require("./js-dos-module");

var move_1 = require("./controller/move");

var qwerty_1 = require("./controller/qwerty");

var Dos = function Dos(canvas, options) {
  var promise = new Promise(function (resolve, reject) {
    var module = new js_dos_module_1.DosModule(canvas, resolve);

    if (!options) {
      options = {};
    }

    if (!options.onerror) {
      options.onerror = function (message) {
        /* tslint:disable:no-console */
        console.error(message);
        /* tslint:enable:no-console */
      };
    }

    Object.assign(module, options); // ### Error handling
    // Error handling should support both ways:
    //
    // * Through rejecting of promise
    // * Fire onerror function of DosOptions object

    var onerror = module.onerror;

    module.onerror = function (message) {
      reject(message);

      var fn = function fn() {
        if (onerror) {
          onerror(message);
          module.onerror = onerror;
        } else {
          module.onerror = module.error;
        }
      };

      setTimeout(fn, 1);
    };

    module.resolve();

    if (!module.isValid) {
      return;
    }

    js_dos_cache_1.default(module, function (cache) {
      // See [Host](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-host)
      // to understand resolving of emulation layer (dosbox).
      js_dos_host_1.Host.resolveDosBox(module.wdosboxUrl, cache, module);
    });
  }); // ### DosReadyPromise
  // Is a Promise object with additional method ready.
  // Method `ready` is just a wrapper over `then` method that
  // split resolved object into meaningful parts.

  var dosReadyPromise = promise;

  dosReadyPromise.ready = function (onready) {
    dosReadyPromise.then(function (runtime) {
      onready(runtime.fs, runtime.main);
    });
    return dosReadyPromise;
  };

  return dosReadyPromise;
};

exports.default = Dos;
window.Dos = Dos;
window.DosController = {
  Qwerty: qwerty_1.default,
  Move: move_1.default
};

},{"./controller/move":1,"./controller/qwerty":2,"./js-dos-cache":6,"./js-dos-host":11,"./js-dos-module":12,"core-js/modules/es6.object.assign":122,"core-js/modules/es6.object.to-string":125,"core-js/modules/es6.promise":126}],17:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"util/":20}],18:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],19:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],20:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":19,"_process":139,"inherits":18}],21:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],22:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":50,"./_wks":115}],23:[function(require,module,exports){
'use strict';
var at = require('./_string-at')(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

},{"./_string-at":98}],24:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],25:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":58}],26:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = require('./_to-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');

module.exports = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject(this);
  var len = toLength(O.length);
  var to = toAbsoluteIndex(target, len);
  var from = toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

},{"./_to-absolute-index":101,"./_to-length":105,"./_to-object":106}],27:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = require('./_to-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');
module.exports = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var aLen = arguments.length;
  var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

},{"./_to-absolute-index":101,"./_to-length":105,"./_to-object":106}],28:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":101,"./_to-iobject":104,"./_to-length":105}],29:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":31,"./_ctx":35,"./_iobject":55,"./_to-length":105,"./_to-object":106}],30:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":57,"./_is-object":58,"./_wks":115}],31:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":30}],32:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":33,"./_wks":115}],33:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],34:[function(require,module,exports){
var core = module.exports = { version: '2.6.10' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],35:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":21}],36:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],37:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":43}],38:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":48,"./_is-object":58}],39:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],40:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":79,"./_object-keys":82,"./_object-pie":83}],41:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":34,"./_ctx":35,"./_global":48,"./_hide":50,"./_redefine":89}],42:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};

},{"./_wks":115}],43:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],44:[function(require,module,exports){
'use strict';
require('./es6.regexp.exec');
var redefine = require('./_redefine');
var hide = require('./_hide');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');
var regexpExec = require('./_regexp-exec');

var SPECIES = wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":36,"./_fails":43,"./_hide":50,"./_redefine":89,"./_regexp-exec":91,"./_wks":115,"./es6.regexp.exec":128}],45:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":25}],46:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":25,"./_ctx":35,"./_is-array-iter":56,"./_iter-call":60,"./_to-length":105,"./core.get-iterator-method":116}],47:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":96}],48:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],49:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],50:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":37,"./_object-dp":74,"./_property-desc":87}],51:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":48}],52:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":37,"./_dom-create":38,"./_fails":43}],53:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":58,"./_set-proto":92}],54:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],55:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":33}],56:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":65,"./_wks":115}],57:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":33}],58:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],59:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object');
var cof = require('./_cof');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};

},{"./_cof":33,"./_is-object":58,"./_wks":115}],60:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":25}],61:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":50,"./_object-create":73,"./_property-desc":87,"./_set-to-string-tag":94,"./_wks":115}],62:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":41,"./_hide":50,"./_iter-create":61,"./_iterators":65,"./_library":66,"./_object-gpo":80,"./_redefine":89,"./_set-to-string-tag":94,"./_wks":115}],63:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":115}],64:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],65:[function(require,module,exports){
module.exports = {};

},{}],66:[function(require,module,exports){
module.exports = false;

},{}],67:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var sign = require('./_math-sign');
var pow = Math.pow;
var EPSILON = pow(2, -52);
var EPSILON32 = pow(2, -23);
var MAX32 = pow(2, 127) * (2 - EPSILON32);
var MIN32 = pow(2, -126);

var roundTiesToEven = function (n) {
  return n + 1 / EPSILON - 1 / EPSILON;
};

module.exports = Math.fround || function fround(x) {
  var $abs = Math.abs(x);
  var $sign = sign(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

},{"./_math-sign":68}],68:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

},{}],69:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":43,"./_has":49,"./_is-object":58,"./_object-dp":74,"./_uid":111}],70:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":33,"./_global":48,"./_task":100}],71:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":21}],72:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var DESCRIPTORS = require('./_descriptors');
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || isEnum.call(S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

},{"./_descriptors":37,"./_fails":43,"./_iobject":55,"./_object-gops":79,"./_object-keys":82,"./_object-pie":83,"./_to-object":106}],73:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":25,"./_dom-create":38,"./_enum-bug-keys":39,"./_html":51,"./_object-dps":75,"./_shared-key":95}],74:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":25,"./_descriptors":37,"./_ie8-dom-define":52,"./_to-primitive":107}],75:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":25,"./_descriptors":37,"./_object-dp":74,"./_object-keys":82}],76:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":37,"./_has":49,"./_ie8-dom-define":52,"./_object-pie":83,"./_property-desc":87,"./_to-iobject":104,"./_to-primitive":107}],77:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":78,"./_to-iobject":104}],78:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":39,"./_object-keys-internal":81}],79:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],80:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":49,"./_shared-key":95,"./_to-object":106}],81:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":28,"./_has":49,"./_shared-key":95,"./_to-iobject":104}],82:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":39,"./_object-keys-internal":81}],83:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],84:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":34,"./_export":41,"./_fails":43}],85:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],86:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":25,"./_is-object":58,"./_new-promise-capability":71}],87:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],88:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};

},{"./_redefine":89}],89:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var $toString = require('./_function-to-string');
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":34,"./_function-to-string":47,"./_global":48,"./_has":49,"./_hide":50,"./_uid":111}],90:[function(require,module,exports){
'use strict';

var classof = require('./_classof');
var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};

},{"./_classof":32}],91:[function(require,module,exports){
'use strict';

var regexpFlags = require('./_flags');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;

},{"./_flags":45}],92:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":25,"./_ctx":35,"./_is-object":58,"./_object-gopd":76}],93:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":37,"./_global":48,"./_object-dp":74,"./_wks":115}],94:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":49,"./_object-dp":74,"./_wks":115}],95:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":96,"./_uid":111}],96:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":34,"./_global":48,"./_library":66}],97:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":21,"./_an-object":25,"./_wks":115}],98:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":36,"./_to-integer":103}],99:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp');
var defined = require('./_defined');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};

},{"./_defined":36,"./_is-regexp":59}],100:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":33,"./_ctx":35,"./_dom-create":38,"./_global":48,"./_html":51,"./_invoke":54}],101:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":103}],102:[function(require,module,exports){
// https://tc39.github.io/ecma262/#sec-toindex
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
module.exports = function (it) {
  if (it === undefined) return 0;
  var number = toInteger(it);
  var length = toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};

},{"./_to-integer":103,"./_to-length":105}],103:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],104:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":36,"./_iobject":55}],105:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":103}],106:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":36}],107:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":58}],108:[function(require,module,exports){
'use strict';
if (require('./_descriptors')) {
  var LIBRARY = require('./_library');
  var global = require('./_global');
  var fails = require('./_fails');
  var $export = require('./_export');
  var $typed = require('./_typed');
  var $buffer = require('./_typed-buffer');
  var ctx = require('./_ctx');
  var anInstance = require('./_an-instance');
  var propertyDesc = require('./_property-desc');
  var hide = require('./_hide');
  var redefineAll = require('./_redefine-all');
  var toInteger = require('./_to-integer');
  var toLength = require('./_to-length');
  var toIndex = require('./_to-index');
  var toAbsoluteIndex = require('./_to-absolute-index');
  var toPrimitive = require('./_to-primitive');
  var has = require('./_has');
  var classof = require('./_classof');
  var isObject = require('./_is-object');
  var toObject = require('./_to-object');
  var isArrayIter = require('./_is-array-iter');
  var create = require('./_object-create');
  var getPrototypeOf = require('./_object-gpo');
  var gOPN = require('./_object-gopn').f;
  var getIterFn = require('./core.get-iterator-method');
  var uid = require('./_uid');
  var wks = require('./_wks');
  var createArrayMethod = require('./_array-methods');
  var createArrayIncludes = require('./_array-includes');
  var speciesConstructor = require('./_species-constructor');
  var ArrayIterators = require('./es6.array.iterator');
  var Iterators = require('./_iterators');
  var $iterDetect = require('./_iter-detect');
  var setSpecies = require('./_set-species');
  var arrayFill = require('./_array-fill');
  var arrayCopyWithin = require('./_array-copy-within');
  var $DP = require('./_object-dp');
  var $GOPD = require('./_object-gopd');
  var dP = $DP.f;
  var gOPD = $GOPD.f;
  var RangeError = global.RangeError;
  var TypeError = global.TypeError;
  var Uint8Array = global.Uint8Array;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var PROTOTYPE = 'prototype';
  var ArrayProto = Array[PROTOTYPE];
  var $ArrayBuffer = $buffer.ArrayBuffer;
  var $DataView = $buffer.DataView;
  var arrayForEach = createArrayMethod(0);
  var arrayFilter = createArrayMethod(2);
  var arraySome = createArrayMethod(3);
  var arrayEvery = createArrayMethod(4);
  var arrayFind = createArrayMethod(5);
  var arrayFindIndex = createArrayMethod(6);
  var arrayIncludes = createArrayIncludes(true);
  var arrayIndexOf = createArrayIncludes(false);
  var arrayValues = ArrayIterators.values;
  var arrayKeys = ArrayIterators.keys;
  var arrayEntries = ArrayIterators.entries;
  var arrayLastIndexOf = ArrayProto.lastIndexOf;
  var arrayReduce = ArrayProto.reduce;
  var arrayReduceRight = ArrayProto.reduceRight;
  var arrayJoin = ArrayProto.join;
  var arraySort = ArrayProto.sort;
  var arraySlice = ArrayProto.slice;
  var arrayToString = ArrayProto.toString;
  var arrayToLocaleString = ArrayProto.toLocaleString;
  var ITERATOR = wks('iterator');
  var TAG = wks('toStringTag');
  var TYPED_CONSTRUCTOR = uid('typed_constructor');
  var DEF_CONSTRUCTOR = uid('def_constructor');
  var ALL_CONSTRUCTORS = $typed.CONSTR;
  var TYPED_ARRAY = $typed.TYPED;
  var VIEW = $typed.VIEW;
  var WRONG_LENGTH = 'Wrong length!';

  var $map = createArrayMethod(1, function (O, length) {
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function () {
    // eslint-disable-next-line no-undef
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
    new Uint8Array(1).set({});
  });

  var toOffset = function (it, BYTES) {
    var offset = toInteger(it);
    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function (it) {
    if (isObject(it) && TYPED_ARRAY in it) return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function (C, length) {
    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function (O, list) {
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = allocate(C, length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key, internal) {
    dP(it, key, { get: function () { return this._d[internal]; } });
  };

  var $from = function from(source /* , mapfn, thisArg */) {
    var O = toObject(source);
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iterFn = getIterFn(O);
    var i, length, values, result, step, iterator;
    if (iterFn != undefined && !isArrayIter(iterFn)) {
      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
        values.push(step.value);
      } O = values;
    }
    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/* ...items */) {
    var index = 0;
    var length = arguments.length;
    var result = allocate(this, length);
    while (length > index) result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString() {
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /* , end */) {
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /* , thisArg */) {
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /* , thisArg */) {
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /* , thisArg */) {
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /* , thisArg */) {
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /* , thisArg */) {
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /* , fromIndex */) {
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /* , fromIndex */) {
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator) { // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /* , thisArg */) {
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse() {
      var that = this;
      var length = validate(that).length;
      var middle = Math.floor(length / 2);
      var index = 0;
      var value;
      while (index < middle) {
        value = that[index];
        that[index++] = that[--length];
        that[length] = value;
      } return that;
    },
    some: function some(callbackfn /* , thisArg */) {
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn) {
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end) {
      var O = validate(this);
      var length = O.length;
      var $begin = toAbsoluteIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end) {
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /* , offset */) {
    validate(this);
    var offset = toOffset(arguments[1], 1);
    var length = this.length;
    var src = toObject(arrayLike);
    var len = toLength(src.length);
    var index = 0;
    if (len + offset > length) throw RangeError(WRONG_LENGTH);
    while (index < len) this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries() {
      return arrayEntries.call(validate(this));
    },
    keys: function keys() {
      return arrayKeys.call(validate(this));
    },
    values: function values() {
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function (target, key) {
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key) {
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc) {
    if (isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ) {
      target[key] = desc.value;
      return target;
    } return dP(target, key, desc);
  };

  if (!ALL_CONSTRUCTORS) {
    $GOPD.f = $getDesc;
    $DP.f = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty: $setDesc
  });

  if (fails(function () { arrayToString.call({}); })) {
    arrayToString = arrayToLocaleString = function toString() {
      return arrayJoin.call(this);
    };
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice: $slice,
    set: $set,
    constructor: function () { /* noop */ },
    toString: arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function () { return this[TYPED_ARRAY]; }
  });

  // eslint-disable-next-line max-statements
  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
    CLAMPED = !!CLAMPED;
    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + KEY;
    var SETTER = 'set' + KEY;
    var TypedArray = global[NAME];
    var Base = TypedArray || {};
    var TAC = TypedArray && getPrototypeOf(TypedArray);
    var FORCED = !TypedArray || !$typed.ABV;
    var O = {};
    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function (that, index) {
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function (that, index, value) {
      var data = that._d;
      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function (that, index) {
      dP(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if (FORCED) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME, '_d');
        var index = 0;
        var offset = 0;
        var buffer, byteLength, length, klass;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new $ArrayBuffer(byteLength);
        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (TYPED_ARRAY in data) {
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if (!fails(function () {
      TypedArray(1);
    }) || !fails(function () {
      new TypedArray(-1); // eslint-disable-line no-new
    }) || !$iterDetect(function (iter) {
      new TypedArray(); // eslint-disable-line no-new
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(1.5); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if (!isObject(data)) return new Base(toIndex(data));
        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator = TypedArrayPrototype[ITERATOR];
    var CORRECT_ITER_NAME = !!$nativeIterator
      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
    var $iterator = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
      dP(TypedArrayPrototype, TAG, {
        get: function () { return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES
    });

    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
      from: $from,
      of: $of
    });

    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

    $export($export.P + $export.F * fails(function () {
      new TypedArray(1).slice();
    }), NAME, { slice: $slice });

    $export($export.P + $export.F * (fails(function () {
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
    }) || !fails(function () {
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, { toLocaleString: $toLocaleString });

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function () { /* empty */ };

},{"./_an-instance":24,"./_array-copy-within":26,"./_array-fill":27,"./_array-includes":28,"./_array-methods":29,"./_classof":32,"./_ctx":35,"./_descriptors":37,"./_export":41,"./_fails":43,"./_global":48,"./_has":49,"./_hide":50,"./_is-array-iter":56,"./_is-object":58,"./_iter-detect":63,"./_iterators":65,"./_library":66,"./_object-create":73,"./_object-dp":74,"./_object-gopd":76,"./_object-gopn":78,"./_object-gpo":80,"./_property-desc":87,"./_redefine-all":88,"./_set-species":93,"./_species-constructor":97,"./_to-absolute-index":101,"./_to-index":102,"./_to-integer":103,"./_to-length":105,"./_to-object":106,"./_to-primitive":107,"./_typed":110,"./_typed-buffer":109,"./_uid":111,"./_wks":115,"./core.get-iterator-method":116,"./es6.array.iterator":117}],109:[function(require,module,exports){
'use strict';
var global = require('./_global');
var DESCRIPTORS = require('./_descriptors');
var LIBRARY = require('./_library');
var $typed = require('./_typed');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var fails = require('./_fails');
var anInstance = require('./_an-instance');
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
var toIndex = require('./_to-index');
var gOPN = require('./_object-gopn').f;
var dP = require('./_object-dp').f;
var arrayFill = require('./_array-fill');
var setToStringTag = require('./_set-to-string-tag');
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH = 'Wrong length!';
var WRONG_INDEX = 'Wrong index!';
var $ArrayBuffer = global[ARRAY_BUFFER];
var $DataView = global[DATA_VIEW];
var Math = global.Math;
var RangeError = global.RangeError;
// eslint-disable-next-line no-shadow-restricted-names
var Infinity = global.Infinity;
var BaseBuffer = $ArrayBuffer;
var abs = Math.abs;
var pow = Math.pow;
var floor = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;
var BUFFER = 'buffer';
var BYTE_LENGTH = 'byteLength';
var BYTE_OFFSET = 'byteOffset';
var $BUFFER = DESCRIPTORS ? '_b' : BUFFER;
var $LENGTH = DESCRIPTORS ? '_l' : BYTE_LENGTH;
var $OFFSET = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
function packIEEE754(value, mLen, nBytes) {
  var buffer = new Array(nBytes);
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var i = 0;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  var e, m, c;
  value = abs(value);
  // eslint-disable-next-line no-self-compare
  if (value != value || value === Infinity) {
    // eslint-disable-next-line no-self-compare
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if (value * (c = pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
}
function unpackIEEE754(buffer, mLen, nBytes) {
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = eLen - 7;
  var i = nBytes - 1;
  var s = buffer[i--];
  var e = s & 127;
  var m;
  s >>= 7;
  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
}

function unpackI32(bytes) {
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
}
function packI8(it) {
  return [it & 0xff];
}
function packI16(it) {
  return [it & 0xff, it >> 8 & 0xff];
}
function packI32(it) {
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
}
function packF64(it) {
  return packIEEE754(it, 52, 8);
}
function packF32(it) {
  return packIEEE754(it, 23, 4);
}

function addGetter(C, key, internal) {
  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
}

function get(view, bytes, index, isLittleEndian) {
  var numIndex = +index;
  var intIndex = toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
}
function set(view, bytes, index, conversion, value, isLittleEndian) {
  var numIndex = +index;
  var intIndex = toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = conversion(+value);
  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
}

if (!$typed.ABV) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = toIndex(length);
    this._b = arrayFill.call(new Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH];
    var offset = toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if (DESCRIPTORS) {
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if (!fails(function () {
    $ArrayBuffer(1);
  }) || !fails(function () {
    new $ArrayBuffer(-1); // eslint-disable-line no-new
  }) || fails(function () {
    new $ArrayBuffer(); // eslint-disable-line no-new
    new $ArrayBuffer(1.5); // eslint-disable-line no-new
    new $ArrayBuffer(NaN); // eslint-disable-line no-new
    return $ArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, $ArrayBuffer);
      return new BaseBuffer(toIndex(length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) hide($ArrayBuffer, key, BaseBuffer[key]);
    }
    if (!LIBRARY) ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if (view.getInt8(0) || !view.getInt8(1)) redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;

},{"./_an-instance":24,"./_array-fill":27,"./_descriptors":37,"./_fails":43,"./_global":48,"./_hide":50,"./_library":66,"./_object-dp":74,"./_object-gopn":78,"./_redefine-all":88,"./_set-to-string-tag":94,"./_to-index":102,"./_to-integer":103,"./_to-length":105,"./_typed":110}],110:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var uid = require('./_uid');
var TYPED = uid('typed_array');
var VIEW = uid('view');
var ABV = !!(global.ArrayBuffer && global.DataView);
var CONSTR = ABV;
var i = 0;
var l = 9;
var Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while (i < l) {
  if (Typed = global[TypedArrayConstructors[i++]]) {
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};

},{"./_global":48,"./_hide":50,"./_uid":111}],111:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],112:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":48}],113:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":34,"./_global":48,"./_library":66,"./_object-dp":74,"./_wks-ext":114}],114:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":115}],115:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":48,"./_shared":96,"./_uid":111}],116:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":32,"./_core":34,"./_iterators":65,"./_wks":115}],117:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":22,"./_iter-define":62,"./_iter-step":64,"./_iterators":65,"./_to-iobject":104}],118:[function(require,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});

},{"./_export":41}],119:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var $export = require('./_export');

$export($export.S, 'Math', { fround: require('./_math-fround') });

},{"./_export":41,"./_math-fround":67}],120:[function(require,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = require('./_export');
var $imul = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * require('./_fails')(function () {
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y) {
    var UINT16 = 0xffff;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

},{"./_export":41,"./_fails":43}],121:[function(require,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});

},{"./_export":41}],122:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":41,"./_object-assign":72}],123:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":82,"./_object-sap":84,"./_to-object":106}],124:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":41,"./_set-proto":92}],125:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof');
var test = {};
test[require('./_wks')('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  require('./_redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}

},{"./_classof":32,"./_redefine":89,"./_wks":115}],126:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":21,"./_an-instance":24,"./_classof":32,"./_core":34,"./_ctx":35,"./_export":41,"./_for-of":46,"./_global":48,"./_is-object":58,"./_iter-detect":63,"./_library":66,"./_microtask":70,"./_new-promise-capability":71,"./_perform":85,"./_promise-resolve":86,"./_redefine-all":88,"./_set-species":93,"./_set-to-string-tag":94,"./_species-constructor":97,"./_task":100,"./_user-agent":112,"./_wks":115}],127:[function(require,module,exports){
var global = require('./_global');
var inheritIfRequired = require('./_inherit-if-required');
var dP = require('./_object-dp').f;
var gOPN = require('./_object-gopn').f;
var isRegExp = require('./_is-regexp');
var $flags = require('./_flags');
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function () {
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');

},{"./_descriptors":37,"./_fails":43,"./_flags":45,"./_global":48,"./_inherit-if-required":53,"./_is-regexp":59,"./_object-dp":74,"./_object-gopn":78,"./_redefine":89,"./_set-species":93,"./_wks":115}],128:[function(require,module,exports){
'use strict';
var regexpExec = require('./_regexp-exec');
require('./_export')({
  target: 'RegExp',
  proto: true,
  forced: regexpExec !== /./.exec
}, {
  exec: regexpExec
});

},{"./_export":41,"./_regexp-exec":91}],129:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});

},{"./_descriptors":37,"./_flags":45,"./_object-dp":74}],130:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var toInteger = require('./_to-integer');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

},{"./_advance-string-index":23,"./_an-object":25,"./_fix-re-wks":44,"./_regexp-exec-abstract":90,"./_to-integer":103,"./_to-length":105,"./_to-object":106}],131:[function(require,module,exports){
'use strict';

var isRegExp = require('./_is-regexp');
var anObject = require('./_an-object');
var speciesConstructor = require('./_species-constructor');
var advanceStringIndex = require('./_advance-string-index');
var toLength = require('./_to-length');
var callRegExpExec = require('./_regexp-exec-abstract');
var regexpExec = require('./_regexp-exec');
var fails = require('./_fails');
var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX = 'lastIndex';
var MAX_UINT32 = 0xffffffff;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { RegExp(MAX_UINT32, 'y'); });

// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});

},{"./_advance-string-index":23,"./_an-object":25,"./_fails":43,"./_fix-re-wks":44,"./_is-regexp":59,"./_regexp-exec":91,"./_regexp-exec-abstract":90,"./_species-constructor":97,"./_to-length":105}],132:[function(require,module,exports){
'use strict';
require('./es6.regexp.flags');
var anObject = require('./_an-object');
var $flags = require('./_flags');
var DESCRIPTORS = require('./_descriptors');
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (require('./_fails')(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

},{"./_an-object":25,"./_descriptors":37,"./_fails":43,"./_flags":45,"./_redefine":89,"./es6.regexp.flags":129}],133:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

},{"./_export":41,"./_fails-is-regexp":42,"./_string-context":99,"./_to-length":105}],134:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":62,"./_string-at":98}],135:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toObject = require('./_to-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $GOPS = require('./_object-gops');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":25,"./_descriptors":37,"./_enum-keys":40,"./_export":41,"./_fails":43,"./_global":48,"./_has":49,"./_hide":50,"./_is-array":57,"./_is-object":58,"./_library":66,"./_meta":69,"./_object-create":73,"./_object-dp":74,"./_object-gopd":76,"./_object-gopn":78,"./_object-gopn-ext":77,"./_object-gops":79,"./_object-keys":82,"./_object-pie":83,"./_property-desc":87,"./_redefine":89,"./_set-to-string-tag":94,"./_shared":96,"./_to-iobject":104,"./_to-object":106,"./_to-primitive":107,"./_uid":111,"./_wks":115,"./_wks-define":113,"./_wks-ext":114}],136:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":108}],137:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":113}],138:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":48,"./_hide":50,"./_iterators":65,"./_object-keys":82,"./_redefine":89,"./_wks":115,"./es6.array.iterator":117}],139:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],140:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var assert = require("assert");

var do_1 = require("./do"); // Compare
// =======
// Compare image from url, and screenshot from DosBox


function compareAndExit(imageUrl, ci, done) {
  compare(imageUrl, ci, function (wrong) {
    assert.ok(wrong <= 10, "Image not same, wrong: " + wrong);
    ci.exit();
    done();
  });
}

exports.compareAndExit = compareAndExit;

var compare = function compare(imageUrl, ci, callback) {
  do_1.doThen(ci.screenshot(), function (actualUrl) {
    var img = new Image();

    img.onload = function () {
      assert(img.width === ci.width(), "Invalid width: " + ci.width() + ", should be " + img.width);
      assert(img.height === ci.height(), "Invalid height: " + ci.height() + ", should be " + img.height);
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      var expected = ctx.getImageData(0, 0, img.width, img.height).data;
      var actualImage = new Image();

      actualImage.onload = function () {
        /*
        document.body.appendChild(img); // for comparisons
        var div = document.createElement('div');
        div.innerHTML = '^=expected, v=actual';
        document.body.appendChild(div);
        document.body.appendChild(actualImage); // to grab it for creating the test reference
        */
        var actualCanvas = document.createElement("canvas");
        actualCanvas.width = actualImage.width;
        actualCanvas.height = actualImage.height;
        var actualCtx = actualCanvas.getContext("2d");
        actualCtx.drawImage(actualImage, 0, 0);
        var actual = actualCtx.getImageData(0, 0, actualImage.width, actualImage.height).data;
        var total = 0;
        var width = img.width;
        var height = img.height;

        for (var x = 0; x < width; x++) {
          for (var y = 0; y < height; y++) {
            total += Math.abs(expected[y * width * 4 + x * 4 + 0] - actual[y * width * 4 + x * 4 + 0]);
            total += Math.abs(expected[y * width * 4 + x * 4 + 1] - actual[y * width * 4 + x * 4 + 1]);
            total += Math.abs(expected[y * width * 4 + x * 4 + 2] - actual[y * width * 4 + x * 4 + 2]);
          }
        } // floor, to allow some margin of error for antialiasing


        var wrong = Math.floor(total / (img.width * img.height * 3));
        callback(wrong);
      };

      actualImage.src = actualUrl;
    };

    img.src = imageUrl;
  });
};

},{"./do":141,"assert":17}],141:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var assert = require("assert"); // Do
// ==
// We use this functions to avoid problem of throwing,
// exceptions inside promise.
// Mocha can't handle exceptions if they are throwed in promise


function doThen(promise, fn) {
  promise.then(function (v) {
    var topFn = function topFn() {
      fn(v);
    };

    setTimeout(topFn, 1);
  });
}

exports.doThen = doThen;

function doCatch(promise, fn) {
  promise.catch(function (v) {
    var topFn = function topFn() {
      fn(v);
    };

    setTimeout(topFn, 1);
  });
}

exports.doCatch = doCatch;

function doNext(promise, fn) {
  doThen(promise, fn);
  doCatch(promise, function (msg) {
    return assert.fail(msg);
  });
}

exports.doNext = doNext;

function doReady(promise, fn) {
  doThen(promise, function (runtime) {
    fn(runtime.fs, runtime.main);
  });
  doCatch(promise, function (msg) {
    return assert.fail(msg);
  });
}

exports.doReady = doReady;

},{"assert":17}],142:[function(require,module,exports){
"use strict";
/* tslint:disable:max-line-length */

/* tslint:disable:no-console */

require("core-js/modules/es6.regexp.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var assert = require("assert");

var js_dos_1 = require("../js-dos-ts/js-dos");

var js_dos_cache_noop_1 = require("../js-dos-ts/js-dos-cache-noop");

var js_dos_host_1 = require("../js-dos-ts/js-dos-host");

var compare_1 = require("./compare");

var do_1 = require("./do");

var wdosboxUrl = window.wdosboxUrl;
suite("js-dos-host");
test("loader should fallback to js if wasm is not supported", function (done) {
  var oldValue = js_dos_host_1.Host.wasmSupported;
  js_dos_host_1.Host.wasmSupported = false;
  js_dos_host_1.Host.resolveDosBox("wrongurl.js", new js_dos_cache_noop_1.default(), {
    onerror: function onerror(message) {
      js_dos_host_1.Host.wasmSupported = oldValue;
      assert.equal("Can\'t download dosbox.js, code: 404, message: connection problem, url: rongurl.js", message);
      done();
    }
  });
});
test("loader should notify about error, if it can't download wdosbox", function (done) {
  js_dos_host_1.Host.resolveDosBox("wrongurl.js", new js_dos_cache_noop_1.default(), {
    onerror: function onerror(message) {
      assert.equal("Can't download wasm, code: 404, message: connection problem, url: wrongurl.wasm.js", message);
      done();
    }
  });
});
test("loader should show progress loading and use cache", function (done) {
  var isGET = false;
  var isPUT = false;

  var TestCache =
  /** @class */
  function () {
    function TestCache() {}

    TestCache.prototype.put = function (key, data, onflush) {
      isPUT = isPUT || key === wdosboxUrl.replace(".js", ".wasm.js") && data instanceof ArrayBuffer && data.byteLength > 0;
      onflush();
    };

    TestCache.prototype.get = function (key, ondata, onerror) {
      isGET = isGET || key === wdosboxUrl.replace(".js", ".wasm.js");
      onerror("not in cache");
    };

    TestCache.prototype.forEach = function (each, onend) {
      onend();
    };

    return TestCache;
  }();

  var lastLoaded = -1;
  js_dos_host_1.Host.resolveDosBox(wdosboxUrl, new TestCache(), {
    onprogress: function onprogress(stage, total, loaded) {
      console.log(stage, total, loaded);
      assert.equal(true, loaded <= total, "onprgoress: " + loaded + "<=" + total);
      assert.equal(true, lastLoaded <= loaded, "endprogress: " + lastLoaded + "<=" + loaded);
      lastLoaded = loaded;
    },
    ondosbox: function ondosbox(dosbox, instantiateWasm) {
      assert.ok(isGET);
      assert.ok(isPUT);
      done();
    },
    onerror: function onerror(message) {
      assert.fail();
    }
  });
});
test("loader should never load twice wdosbox", function (done) {
  js_dos_host_1.Host.resolveDosBox(wdosboxUrl, new js_dos_cache_noop_1.default(), {
    onprogress: function onprogress(stage, total, loaded) {
      assert.fail();
    },
    ondosbox: function ondosbox(dosbox, instantiateWasm) {
      done();
    },
    onerror: function onerror(message) {
      assert.fail();
    }
  });
});
test("loader should fire event when wdosbox is loaded", function (done) {
  js_dos_host_1.Host.resolveDosBox(wdosboxUrl, new js_dos_cache_noop_1.default(), {
    ondosbox: function ondosbox(dosbox, instantiateWasm) {
      assert.ok(dosbox);
      done();
    },
    onerror: function onerror(message) {
      assert.fail();
    }
  });
});
suite("js-dos");
test("js-dos can't start without canvas (listener style)", function (done) {
  js_dos_1.default(null, {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.equal("canvas field is required, but not set!", message);
      done();
    }
  });
});
test("js-dos can't start without canvas (promise style)", function (done) {
  var dos = js_dos_1.default(null, {
    wdosboxUrl: wdosboxUrl
  });
  do_1.doCatch(dos, function (message) {
    assert.equal("canvas field is required, but not set!", message);
    done();
  });
  do_1.doThen(dos, function () {
    assert.fail();
  });
});
test("js-dos can't start without canvas (ready style)", function (done) {
  var dos = js_dos_1.default(null, {
    wdosboxUrl: wdosboxUrl
  });
  var promise = dos.ready(function (fs, main) {
    var fn = function fn() {
      return assert.fail();
    };

    setTimeout(fn, 1);
  });
  do_1.doCatch(promise, function (message) {
    assert.equal("canvas field is required, but not set!", message);
    done();
  });
});
test("js-dos should start with canvas", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(main([]), function (ci) {
      ci.exit();
      done();
    });
  });
});
test("js-dos can take screenshot of canvas", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(main([]), function (ci) {
      compare_1.compareAndExit("init.png", ci, done);
    });
  });
});
suite("js-dos-fs");
test("js-dos-fs createFile error handling", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.equal(message, "Can't create file '', because file name is empty");
      done();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    fs.createFile("", "");
  });
});
test("js-dos-fs createFile error handling 2", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.equal(message, "Can't create file '/home/', because file name is empty");
      done();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    fs.createFile("/home/", "");
  });
});
test("js-dos-fs can create file", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    fs.createFile("/wiki/musk", wikiElonMusk);
    do_1.doNext(main(), function (ci) {
      do_1.doNext(ci.shell("type wiki\\musk"), function () {
        compare_1.compareAndExit("elonmusk.png", ci, done);
      });
    });
  });
});
test("js-dos-fs can create file (windows path)", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    fs.createFile("C:\\wiki\\musk", wikiElonMusk);
    do_1.doNext(main(), function (ci) {
      do_1.doNext(ci.shell("type wiki\\musk"), function () {
        compare_1.compareAndExit("elonmusk.png", ci, done);
      });
    });
  });
});
test("js-dos-fs clearing IDBFS db", function (done) {
  var errorFn = function errorFn(event) {
    console.error(event);
    assert.fail();
  };

  var deleteTest = indexedDB.deleteDatabase("/test");
  deleteTest.onerror = errorFn;

  deleteTest.onsuccess = function (event) {
    var deleteArkanoid = indexedDB.deleteDatabase("/arkanoid");
    deleteArkanoid.onerror = errorFn;

    deleteArkanoid.onsuccess = function (event) {
      done();
    };
  };
});
test("js-dos-fs can mount archive on persistent point [empty db]", function (done) {
  var isOnProgress = false;
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    },
    onprogress: function onprogress(stage, total, loaded) {
      isOnProgress = true;
    }
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extract("digger.zip", "/test"), function () {
      do_1.doNext(main(), function (ci) {
        do_1.doNext(ci.shell("dir test"), function () {
          assert.ok(isOnProgress);
          compare_1.compareAndExit("persistent-mount.png", ci, done);
        });
      });
    });
  });
});
test("js-dos-fs can mount archive on persistent point [existent db]", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    },
    onprogress: function onprogress(stage, total, loaded) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extract("digger.zip", "/test"), function () {
      do_1.doNext(main(), function (ci) {
        do_1.doNext(ci.shell("dir test"), function () {
          compare_1.compareAndExit("persistent-mount.png", ci, done);
        });
      });
    });
  });
});
test("js-dos-fs can mount ANOTHER archive on persistent point [empty db]", function (done) {
  var isOnProgress = false;
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    },
    onprogress: function onprogress(stage, total, loaded) {
      isOnProgress = true;
    }
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extract("arkanoid.zip", "/arkanoid"), function () {
      do_1.doNext(main(), function (ci) {
        do_1.doNext(ci.shell("dir arkanoid"), function () {
          assert.ok(isOnProgress);
          compare_1.compareAndExit("persistent-mount-arkanoid.png", ci, done);
        });
      });
    });
  });
});
test("js-dos-fs can mount ANOTHER archive on persistent point [existent db]", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    },
    onprogress: function onprogress(stage, total, loaded) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extract("arkanoid.zip", "/arkanoid"), function () {
      do_1.doNext(main(), function (ci) {
        do_1.doNext(ci.shell("dir arkanoid"), function () {
          compare_1.compareAndExit("persistent-mount-arkanoid.png", ci, done);
        });
      });
    });
  });
});
test("js-dos-fs can mount multiple persistent point [existent db]", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    },
    onprogress: function onprogress(stage, total, loaded) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extractAll([{
      url: "arkanoid.zip",
      mountPoint: "/arkanoid"
    }, {
      url: "digger.zip",
      mountPoint: "/test"
    }]), function () {
      do_1.doNext(main(), function (ci) {
        do_1.doNext(ci.shell("dir arkanoid", "dir ..\\test"), function () {
          compare_1.compareAndExit("persistent-mount-multiple.png", ci, done);
        });
      });
    });
  });
});
suite("js-dos");
test("js-dos should provide user level dosbox.conf", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    fs.createFile("dosbox.conf", "\n        [autoexec]\n        mount c .\n        c:\n        cd HOME\n        cd WEB_USER\n        cd DOSBOX~1\n        type dosbox~1.con\n        ");
    do_1.doNext(main(["-conf", "dosbox.conf"]), function (ci) {
      compare_1.compareAndExit("jsdos-conf.png", ci, done);
    });
  });
});
test("js-dos can create and read dosbox.conf", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl,
    onerror: function onerror(message) {
      assert.fail();
    }
  });
  do_1.doReady(dos, function (fs, main) {
    fs.createFile("dosbox.conf", "\n            [autoexec]\n            mount c .\n            c:\n            type dosbox~1.con\n        ");
    do_1.doNext(main(["-conf", "dosbox.conf"]), function (ci) {
      compare_1.compareAndExit("dosboxconf.png", ci, done);
    });
  });
});
test("js-dos can run digger.zip", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extract("digger.zip"), function () {
      do_1.doNext(main(["DIGGER.COM"]), function (ci) {
        var fn = function fn() {
          compare_1.compareAndExit("digger.png", ci, done); // saveImage(ci);
        };

        setTimeout(fn, 5000);
      });
    });
  });
});
test("js-dos can simulate key events", function (done) {
  var dos = js_dos_1.default(document.getElementById("canvas"), {
    wdosboxUrl: wdosboxUrl
  });
  do_1.doReady(dos, function (fs, main) {
    do_1.doNext(fs.extract("digger.zip"), function () {
      do_1.doNext(main(["DIGGER.COM"]), function (ci) {
        ci.simulateKeyPress(37); // left arrow

        var fn = function fn() {
          compare_1.compareAndExit("digger-end.png", ci, done);
        };

        setTimeout(fn, 5000);
      });
    });
  });
});

var saveImage = function saveImage(ci) {
  ci.screenshot().then(function (data) {
    var w = window.open("about:blank", "image from canvas");
    w.document.write("<img src='" + data + "' alt='from canvas'/>");
  });
};

var wikiElonMusk = "\nElon Reeve Musk FRS (/\u02C8i\u02D0l\u0252n/; born June 28, 1971) is a\ntechnology entrepreneur and engineer.[10][11][12]\nHe holds South African, Canadian, and U.S. citizenship\nand is the founder, CEO, and lead designer of SpaceX;\n[13] co-founder, CEO, and product architect of Tesla, Inc.;\n[14] co-founder and CEO of Neuralink; and co-founder of PayPal.\nIn December 2016, he was ranked 21st on the Forbes list of\nThe World's Most Powerful People.[15] As of October 2018,\nhe has a net worth of $22.8 billion and is listed by Forbes\nas the 54th-richest person in the world.[16]\nBorn and raised in Pretoria, South Africa, Musk moved to\nCanada when he was 17 to attend Queen's University.\nHe transferred to the University of Pennsylvania two years\nlater, where he received an economics degree from\nthe Wharton School and a degree in physics from the College\nof Arts and Sciences. He began a Ph.D.\nin applied physics and material sciences at Stanford University\nin 1995 but dropped out after two days to pursue\nan entrepreneurial career. He subsequently co-founded Zip2, a\nweb software company, which was acquired by Compaq\nfor $340 million in 1999. Musk then founded X.com, an online bank.\nIt merged with Confinity in 2000 and later that\nyear became PayPal, which was bought by eBay for $1.5 billion\nin October 2002.[17][18][19][20]\n";

},{"../js-dos-ts/js-dos":16,"../js-dos-ts/js-dos-cache-noop":5,"../js-dos-ts/js-dos-host":11,"./compare":140,"./do":141,"assert":17,"core-js/modules/es6.regexp.replace":130}]},{},[142])

//# sourceMappingURL=test.js.map
