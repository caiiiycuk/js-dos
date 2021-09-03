"use strict";(self.webpackChunkjs_dos=self.webpackChunkjs_dos||[]).push([[257],{3905:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return m}});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function i(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=r.createContext({}),c=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):i(i({},n),e)),t},p=function(e){var n=c(e.components);return r.createElement(l.Provider,{value:n},e.children)},d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=c(t),m=a,g=u["".concat(l,".").concat(m)]||u[m]||d[m]||o;return t?r.createElement(g,i(i({ref:n},p),{},{components:t})):r.createElement(g,i({ref:n},p))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=t.length,i=new Array(o);i[0]=u;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=t[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},5077:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return i},contentTitle:function(){return s},metadata:function(){return l},toc:function(){return c},default:function(){return d}});var r=t(4034),a=t(9973),o=(t(7294),t(3905)),i={id:"node",title:"In node.js"},s=void 0,l={unversionedId:"node",id:"node",isDocsHomePage:!1,title:"In node.js",description:"In this tutorial we will run Digger game in Node.js and save game screenshot to image.",source:"@site/docs/node.md",sourceDirName:".",slug:"/node",permalink:"/v7/build/docs/node",editUrl:"https://github.com/caiiiycuk/js-dos/edit/gh-pages/v7/docs/node.md",version:"current",frontMatter:{id:"node",title:"In node.js"},sidebar:"someSidebar",previous:{title:"In browser",permalink:"/v7/build/docs/browser"},next:{title:"In React (TypeScript)",permalink:"/v7/build/docs/react"}},c=[],p={toc:c};function d(e){var n=e.components,t=(0,a.Z)(e,["components"]);return(0,o.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"In this tutorial we will run Digger game in Node.js and save game screenshot to image."),(0,o.kt)("p",null,"Let's start with creating empty project:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm init\n")),(0,o.kt)("p",null,"In node environment you can use only ",(0,o.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/emulators"},"emulators")," package, becuse ",(0,o.kt)("inlineCode",{parentName:"p"},"emulators-ui")," is made for browser integraions. For creating screenshot we will use ",(0,o.kt)("inlineCode",{parentName:"p"},"jimp")," library. So let's install them."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"npm install --save emulators jimp\n")),(0,o.kt)("p",null,"Next we need to download Digger ",(0,o.kt)("a",{parentName:"p",href:"jsdos-bundle"},"js-dos bundle"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"curl https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos -o digger.jsdos\n")),(0,o.kt)("p",null,"We will edit file named ",(0,o.kt)("inlineCode",{parentName:"p"},"digger.js"),". We can run it with this command ",(0,o.kt)("inlineCode",{parentName:"p"},"node digger.js")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Use require to import all libraries")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},'const fs = require("fs");\nconst jimp = require("jimp");\n\nrequire("emulators");\n\nconst emulators = global.emulators;\nemulators.pathPrefix = "./";\n')),(0,o.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"emulators package is made for browser, it didn't export anything. It inject itself into global object.\nIn node ",(0,o.kt)("inlineCode",{parentName:"p"},"pathPrefix")," is relative to ",(0,o.kt)("inlineCode",{parentName:"p"},"require")))),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Now we need to read contents of ",(0,o.kt)("inlineCode",{parentName:"strong"},"jsdos bundle")," and start emulation")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},'const bundle = fs.readFileSync("digger.jsdos");\n\nemulators\n    .dosDirect(bundle)\n    .then((ci) => {\n      // ...\n    });\n')),(0,o.kt)("p",null,"When dos emulation starts, we will recive ",(0,o.kt)("a",{parentName:"p",href:"command-interface"},"Command Interface"),", we can use it\nto subscribe on frame updates and to send key/mouse events."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"    let rgb = new Uint8Array(0);\n    ci.events().onFrame((frame) => {\n        this.rgb = frame;\n    });\n")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"Now we have frame, it's in RGB format. We only need to save it to png image:")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},'    const width = ci.width();\n    const height = ci.height();\n\n    const rgba = new Uint8Array(width * height * 4);\n    for (let next = 0; next < width * height; ++next) {\n        rgba[next * 4 + 0] = rgb[next * 3 + 0];\n        rgba[next * 4 + 1] = rgb[next * 3 + 1];\n        rgba[next * 4 + 2] = rgb[next * 3 + 2];\n        rgba[next * 4 + 3] = 255;\n    }\n\n    new jimp({ data: rgba, width, height }, (err, image) => {\n        image.write("./screenshot.png", () => {\n            ci.exit();\n        });\n    });\n')),(0,o.kt)("p",null,"If you execute ",(0,o.kt)("inlineCode",{parentName:"p"},"node digger.js")," it will save digger screenshot to ",(0,o.kt)("inlineCode",{parentName:"p"},"./screenshot.png"),"."),(0,o.kt)("p",null,"Full code of ",(0,o.kt)("inlineCode",{parentName:"p"},"digger.js"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},'const fs = require("fs");\nconst jimp = require("jimp");\n\nrequire("emulators");\n\nconst emulators = global.emulators;\nemulators.pathPrefix = "./";\n\nconst bundle = fs.readFileSync("digger.jsdos");\n\nemulators\n    .dosDirect(bundle)\n    .then((ci) => {\n        let rgba = new Uint8Array(0);\n        ci.events().onFrame((frame) => {\n            rgba = frame;\n        });\n\n        // capture the screen after 3 sec\n        console.log("Will capture screen after 3 sec...");\n        setTimeout(() => {\n            const width = ci.width();\n            const height = ci.height();\n\n            const rgba = new Uint8Array(width * height * 4);\n            for (let next = 0; next < width * height; ++next) {\n                rgba[next * 4 + 0] = rgb[next * 3 + 0];\n                rgba[next * 4 + 1] = rgb[next * 3 + 1];\n                rgba[next * 4 + 2] = rgb[next * 3 + 2];\n                rgba[next * 4 + 3] = 255;\n            }\n\n            new jimp({ data: rgba, width, height }, (err, image) => {\n                image.write("./screenshot.png", () => {\n                    ci.exit();\n                });\n            });\n        }, 3000);\n    })\n    .catch(console.error);\n')))}d.isMDXComponent=!0}}]);