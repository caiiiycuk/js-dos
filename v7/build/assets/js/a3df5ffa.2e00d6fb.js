(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{108:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var r=n(0),i=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var u=i.a.createContext({}),s=function(e){var t=i.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=s(e.components);return i.a.createElement(u.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},d=i.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,a=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(n),d=r,m=p["".concat(a,".").concat(d)]||p[d]||b[d]||o;return n?i.a.createElement(m,c(c({ref:t},u),{},{components:n})):i.a.createElement(m,c({ref:t},u))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,a=new Array(o);a[0]=d;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:r,a[1]=c;for(var u=2;u<o;u++)a[u]=n[u];return i.a.createElement.apply(null,a)}return i.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},97:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return s}));var r=n(3),i=n(8),o=(n(0),n(108)),a={id:"contributing-emulators-ui",title:"Contributing in client-side features"},c={unversionedId:"contributing-emulators-ui",id:"contributing-emulators-ui",isDocsHomePage:!1,title:"Contributing in client-side features",description:"To contribute to the emulators-ui package do the following:",source:"@site/docs/contributing-emulators-ui.md",slug:"/contributing-emulators-ui",permalink:"/v7/build/docs/contributing-emulators-ui",editUrl:"https://github.com/caiiiycuk/js-dos/edit/gh-pages/v7/docs/contributing-emulators-ui.md",version:"current",sidebar:"someSidebar",previous:{title:"Multiple layers",permalink:"/v7/build/docs/multiple-layers"},next:{title:"DOS Direct",permalink:"/v7/build/docs/dos-direct"}},l=[{value:"Adding new client-side features",id:"adding-new-client-side-features",children:[]}],u={toc:l};function s(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"To contribute to the ",Object(o.b)("inlineCode",{parentName:"p"},"emulators-ui")," package do the following:"),Object(o.b)("ol",null,Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},"Checkout ",Object(o.b)("inlineCode",{parentName:"p"},"emulators-ui")," repository"),Object(o.b)("p",{parentName:"li"},Object(o.b)("inlineCode",{parentName:"p"},"git clone https://github.com/js-dos/emulators-ui"))),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},"Install ",Object(o.b)("a",{parentName:"p",href:"https://gulpjs.com/"},"gulp 4"))),Object(o.b)("li",{parentName:"ol"},Object(o.b)("p",{parentName:"li"},"Now you can build everything with ",Object(o.b)("inlineCode",{parentName:"p"},"gulp")," command"))),Object(o.b)("h3",{id:"adding-new-client-side-features"},"Adding new client-side features"),Object(o.b)("p",null,"js-dos has an ",Object(o.b)("a",{parentName:"p",href:"jsdos-bundle"},"optional config")," file that you can put in ",Object(o.b)("inlineCode",{parentName:"p"},"js-dos bundle"),". This\nfile should be in json format. It can contain any information you want and it accessible from ",Object(o.b)("a",{parentName:"p",href:"command-interface"},"Command Interface"),":"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"const ci = await Dos(/*element*/).run(/*bundle url*/);\nconst config = await ci.config();\n")),Object(o.b)("p",null,"Let's understand how gestures are implemented in js-dos.\nFirst of all, gestures have special configuration that stored in ",Object(o.b)("inlineCode",{parentName:"p"},"jsdos.jsdos")," file, it's looks\nlike: "),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-json"},'{\n// ...\n  "gestures": [\n    {\n      "joystickId": 0,\n      "event": "dir:up",\n      "mapTo": 265\n    },\n//...\n')),Object(o.b)("p",null,"When js-dos starting it waits until config file is read and configure gestures\nlayer according to its configuration."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-typescript"},"async run(bundleUrl: string): Promise<CommandInterface> {\n        const bundle = await emulatorsUi.network.resolveBundle(bundleUrl);\n        this.ciPromise = emulators.dosWorker(bundle);\n\n        const ci = await this.ciPromise;\n        const config = await ci.config();\n\n        // ...\n        emulatorsUi.controls.nippleArrows(this.layers, ci, (config as any).gestures);\n        // ...\n}\n")),Object(o.b)("p",null,"You can do in same way:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"You can add some information to config file"),Object(o.b)("li",{parentName:"ul"},"You can access it in your client code")),Object(o.b)("p",null,"Doing this does not require changing the native part of ",Object(o.b)("inlineCode",{parentName:"p"},"js-dos"),"."))}s.isMDXComponent=!0}}]);