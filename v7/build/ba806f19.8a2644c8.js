(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{149:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return i})),r.d(t,"metadata",(function(){return s})),r.d(t,"rightToc",(function(){return c})),r.d(t,"default",(function(){return p}));var n=r(2),o=r(10),a=(r(0),r(155)),i={id:"estimating-performance",title:"Esitmating emulators performance"},s={id:"estimating-performance",isDocsHomePage:!1,title:"Esitmating emulators performance",description:"Performance testing",source:"@site/docs/estimating-performance.md",permalink:"/v7/build/docs/estimating-performance",editUrl:"https://github.com/caiiiycuk/js-dos/edit/gh-pages/v7/docs/estimating-performance.md",sidebar:"someSidebar",previous:{title:"Three.js",permalink:"/v7/build/docs/threejs"},next:{title:"Contributing",permalink:"/v7/build/docs/contributing-emulators"}},c=[{value:"Performance testing",id:"performance-testing",children:[]},{value:"Running the test",id:"running-the-test",children:[]}],l={rightToc:c};function p(e){var t=e.components,r=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(n.a)({},l,r,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h2",{id:"performance-testing"},"Performance testing"),Object(a.b)("p",null,"To measure performance we used variant of Dhrystone 2 Test originally taken from this ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"http://www.roylongbottom.org.uk/dhrystone%20results.htm"}),"page"),". Original version used ",Object(a.b)("inlineCode",{parentName:"p"},"clock()")," to calculate delta time. Which is good for real pc, but does not very accurate for dosbox emulator. When ",Object(a.b)("inlineCode",{parentName:"p"},"clock()")," call happened modified version send ",Object(a.b)("inlineCode",{parentName:"p"},"~>dtime")," marker to stdout which intercepted by test page and used to calculate delta time with ",Object(a.b)("inlineCode",{parentName:"p"},"performance.now()")," from browser. Source code of modified test is ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/caiiiycuk/js-dos/tree/6.22/programms/dhry2"}),"here"),"."),Object(a.b)("p",null,"Basically this test produce a lot of int operations and measure amount of operations (Dhrystones) produced per second. Output is a ",Object(a.b)("inlineCode",{parentName:"p"},"VAX MIPS RATING")," which is Drhystones per second divided by 1757 (is as DEC VAX 11/780 result)."),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"js-dos bundle")," with this test can be found on ",Object(a.b)("a",Object(n.a)({parentName:"p"},{href:"https://talks.dos.zone/t/dhrystone-2-test-jul-2020/37086"}),"Test")," page."),Object(a.b)("h2",{id:"running-the-test"},"Running the test"),Object(a.b)("p",null,"To run this test we should use ",Object(a.b)("inlineCode",{parentName:"p"},"emulators.js")," (from emulators) and use our ",Object(a.b)("inlineCode",{parentName:"p"},"js-dos bundle")," to start test."),Object(a.b)("pre",null,Object(a.b)("code",Object(n.a)({parentName:"pre"},{className:"language-html"}),'<script src="/v7/build/releases/latest/emulators/emulators.js"><\/script>\n// ...\n<script>\n  emulators.pathPrefix = "/v7/build/releases/latest/emulators/";\n')),Object(a.b)("p",null,"You can start test in worker or direct mode:"),Object(a.b)("pre",null,Object(a.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"// promise is resolved when emulator is started\nconst ci = await (options.worker ?\n  emulators.dosWorker(bundle) :\n  emulators.dosDirect(bundle));\n")),Object(a.b)("p",null,"In worker mode each test will run in new worker. If you press ",Object(a.b)("inlineCode",{parentName:"p"},"Start Worker")," multiple times,\nthen you will see output from multiple threads. In direct mode browser will probably hangs.\nIn theory direct mode is faster, but browser will be unstable. Our recomendation is to use worker\nmode all time."),Object(a.b)("p",null,"Complete example:"),Object(a.b)("pre",null,Object(a.b)("code",Object(n.a)({parentName:"pre"},{className:"language-html",metastring:'title="examples/dhry2.html"',title:'"examples/dhry2.html"'}),"{}\n")))}p.isMDXComponent=!0},155:function(e,t,r){"use strict";r.d(t,"a",(function(){return u})),r.d(t,"b",(function(){return b}));var n=r(0),o=r.n(n);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=o.a.createContext({}),p=function(e){var t=o.a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},u=function(e){var t=p(e.components);return o.a.createElement(l.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},d=o.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,i=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),u=p(r),d=n,b=u["".concat(i,".").concat(d)]||u[d]||m[d]||a;return r?o.a.createElement(b,s(s({ref:t},l),{},{components:r})):o.a.createElement(b,s({ref:t},l))}));function b(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:n,i[1]=s;for(var l=2;l<a;l++)i[l]=r[l];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,r)}d.displayName="MDXCreateElement"}}]);