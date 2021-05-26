(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{100:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return i})),t.d(n,"metadata",(function(){return c})),t.d(n,"toc",(function(){return s})),t.d(n,"default",(function(){return b}));var r=t(3),a=t(8),o=(t(0),t(108)),i={id:"node",title:"In node.js"},c={unversionedId:"node",id:"node",isDocsHomePage:!1,title:"In node.js",description:"In this tutorial we will run Digger game in Node.js and save game screenshot to image.",source:"@site/docs/node.md",slug:"/node",permalink:"/v7/build/docs/node",editUrl:"https://github.com/caiiiycuk/js-dos/edit/gh-pages/v7/docs/node.md",version:"current",sidebar:"someSidebar",previous:{title:"In browser",permalink:"/v7/build/docs/browser"},next:{title:"In React (TypeScript)",permalink:"/v7/build/docs/react"}},s=[],l={toc:s};function b(e){var n=e.components,t=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},l,t,{components:n,mdxType:"MDXLayout"}),Object(o.b)("p",null,"In this tutorial we will run Digger game in Node.js and save game screenshot to image."),Object(o.b)("p",null,"Let's start with creating empty project:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-sh"},"npm init\n")),Object(o.b)("p",null,"In node environment you can use only ",Object(o.b)("a",{parentName:"p",href:"https://www.npmjs.com/package/emulators"},"emulators")," package, becuse ",Object(o.b)("inlineCode",{parentName:"p"},"emulators-ui")," is made for browser integraions. For creating screenshot we will use ",Object(o.b)("inlineCode",{parentName:"p"},"jimp")," library. So let's install them."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-sh"},"npm install --save emulators jimp\n")),Object(o.b)("p",null,"Next we need to download Digger ",Object(o.b)("a",{parentName:"p",href:"jsdos-bundle"},"js-dos bundle"),":"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-sh"},"curl https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos -o digger.jsdos\n")),Object(o.b)("p",null,"We will edit file named ",Object(o.b)("inlineCode",{parentName:"p"},"digger.js"),". We can run it with this command ",Object(o.b)("inlineCode",{parentName:"p"},"node digger.js")),Object(o.b)("p",null,Object(o.b)("strong",{parentName:"p"},"Use require to import all libraries")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const fs = require("fs");\nconst jimp = require("jimp");\n\nrequire("emulators");\n\nconst emulators = global.emulators;\nemulators.pathPrefix = "./";\n')),Object(o.b)("div",{className:"admonition admonition-note alert alert--secondary"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"emulators package is made for browser, it didn't export anything. It inject itself into global object.\nIn node ",Object(o.b)("inlineCode",{parentName:"p"},"pathPrefix")," is relative to ",Object(o.b)("inlineCode",{parentName:"p"},"require")))),Object(o.b)("p",null,Object(o.b)("strong",{parentName:"p"},"Now we need to read contents of ",Object(o.b)("inlineCode",{parentName:"strong"},"jsdos bundle")," and start emulation")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const bundle = fs.readFileSync("digger.jsdos");\n\nemulators\n    .dosDirect(bundle)\n    .then((ci) => {\n      // ...\n    });\n')),Object(o.b)("p",null,"When dos emulation starts, we will recive ",Object(o.b)("a",{parentName:"p",href:"command-interface"},"Command Interface"),", we can use it\nto subscribe on frame updates and to send key/mouse events."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"    let rgb = new Uint8Array(0);\n    ci.events().onFrame((frame) => {\n        this.rgb = frame;\n    });\n")),Object(o.b)("p",null,Object(o.b)("strong",{parentName:"p"},"Now we have frame, it's in RGB format. We only need to save it to png image:")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'    const width = ci.width();\n    const height = ci.height();\n\n    const rgba = new Uint8Array(width * height * 4);\n    for (let next = 0; next < width * height; ++next) {\n        rgba[next * 4 + 0] = rgb[next * 3 + 0];\n        rgba[next * 4 + 1] = rgb[next * 3 + 1];\n        rgba[next * 4 + 2] = rgb[next * 3 + 2];\n        rgba[next * 4 + 3] = 255;\n    }\n\n    new jimp({ data: rgba, width, height }, (err, image) => {\n        image.write("./screenshot.png", () => {\n            ci.exit();\n        });\n    });\n')),Object(o.b)("div",{className:"admonition admonition-note alert alert--secondary"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"Frame is in RGBA format, but alpha is always 0. To have normal image we should rewrite alpha channel to 255."))),Object(o.b)("p",null,"If you execute ",Object(o.b)("inlineCode",{parentName:"p"},"node digger.js")," it will save digger screenshot to ",Object(o.b)("inlineCode",{parentName:"p"},"./screenshot.png"),"."),Object(o.b)("p",null,"Full code of ",Object(o.b)("inlineCode",{parentName:"p"},"digger.js"),":"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const fs = require("fs");\nconst jimp = require("jimp");\n\nrequire("emulators");\n\nconst emulators = global.emulators;\nemulators.pathPrefix = "./";\n\nconst bundle = fs.readFileSync("digger.jsdos");\n\nemulators\n    .dosDirect(bundle)\n    .then((ci) => {\n        let rgba = new Uint8Array(0);\n        ci.events().onFrame((frame) => {\n            rgba = frame;\n        });\n\n        // capture the screen after 3 sec\n        console.log("Will capture screen after 3 sec...");\n        setTimeout(() => {\n            const width = ci.width();\n            const height = ci.height();\n\n            const rgba = new Uint8Array(width * height * 4);\n            for (let next = 0; next < width * height; ++next) {\n                rgba[next * 4 + 0] = rgb[next * 3 + 0];\n                rgba[next * 4 + 1] = rgb[next * 3 + 1];\n                rgba[next * 4 + 2] = rgb[next * 3 + 2];\n                rgba[next * 4 + 3] = 255;\n            }\n\n            new jimp({ data: rgba, width, height }, (err, image) => {\n                image.write("./screenshot.png", () => {\n                    ci.exit();\n                });\n            });\n        }, 3000);\n    })\n    .catch(console.error);\n')))}b.isMDXComponent=!0},108:function(e,n,t){"use strict";t.d(n,"a",(function(){return p})),t.d(n,"b",(function(){return u}));var r=t(0),a=t.n(r);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=a.a.createContext({}),b=function(e){var n=a.a.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):c(c({},n),e)),t},p=function(e){var n=b(e.components);return a.a.createElement(l.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return a.a.createElement(a.a.Fragment,{},n)}},m=a.a.forwardRef((function(e,n){var t=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),p=b(t),m=r,u=p["".concat(i,".").concat(m)]||p[m]||d[m]||o;return t?a.a.createElement(u,c(c({ref:n},l),{},{components:t})):a.a.createElement(u,c({ref:n},l))}));function u(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var o=t.length,i=new Array(o);i[0]=m;var c={};for(var s in n)hasOwnProperty.call(n,s)&&(c[s]=n[s]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var l=2;l<o;l++)i[l]=t[l];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,t)}m.displayName="MDXCreateElement"}}]);