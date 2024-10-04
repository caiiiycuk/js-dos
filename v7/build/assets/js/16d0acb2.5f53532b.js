"use strict";(self.webpackChunkgh_pages=self.webpackChunkgh_pages||[]).push([[803],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>p});var o=t(7294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function s(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?s(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function i(e,n){if(null==e)return{};var t,o,r=function(e,n){if(null==e)return{};var t,o,r={},s=Object.keys(e);for(o=0;o<s.length;o++)t=s[o],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(o=0;o<s.length;o++)t=s[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var u=o.createContext({}),c=function(e){var n=o.useContext(u),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},d=function(e){var n=c(e.components);return o.createElement(u.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},l=o.forwardRef((function(e,n){var t=e.components,r=e.mdxType,s=e.originalType,u=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),l=c(t),p=r,f=l["".concat(u,".").concat(p)]||l[p]||m[p]||s;return t?o.createElement(f,a(a({ref:n},d),{},{components:t})):o.createElement(f,a({ref:n},d))}));function p(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var s=t.length,a=new Array(s);a[0]=l;var i={};for(var u in n)hasOwnProperty.call(n,u)&&(i[u]=n[u]);i.originalType=e,i.mdxType="string"==typeof e?e:r,a[1]=i;for(var c=2;c<s;c++)a[c]=t[c];return o.createElement.apply(null,a)}return o.createElement.apply(null,t)}l.displayName="MDXCreateElement"},5764:(e,n,t)=>{t.r(n),t.d(n,{frontMatter:()=>s,contentTitle:()=>a,metadata:()=>i,toc:()=>u,default:()=>d});var o=t(4034),r=(t(7294),t(3905));const s={id:"command-interface",title:"Command Interface (CI)"},a=void 0,i={unversionedId:"command-interface",id:"command-interface",isDocsHomePage:!1,title:"Command Interface (CI)",description:"The Command Interface is only one object that allows you to communicate with js-dos instance.",source:"@site/docs/command-interface.md",sourceDirName:".",slug:"/command-interface",permalink:"/v7/build/docs/command-interface",editUrl:"https://github.com/caiiiycuk/js-dos/edit/gh-pages/v7/docs/command-interface.md",tags:[],version:"current",frontMatter:{id:"command-interface",title:"Command Interface (CI)"},sidebar:"someSidebar",previous:{title:"Save/Load",permalink:"/v7/build/docs/jsdos-save-load"},next:{title:"Multiple Instances",permalink:"/v7/build/docs/multiple-instances"}},u=[],c={toc:u};function d({components:e,...n}){return(0,r.kt)("wrapper",(0,o.Z)({},c,n,{components:e,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"Command Interface")," is only one object that allows you to communicate with js-dos instance.\nOnce you run some ",(0,r.kt)("a",{parentName:"p",href:"/v7/build/docs/#js-dos-bundle"},"js-dos bundle")," you will receive ",(0,r.kt)("inlineCode",{parentName:"p"},"Command Interface")," instance."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const ci = await Dos(/*element*/).run(/*bundle url*/);\n")),(0,r.kt)("p",null,"CI interface:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"export interface CommandInterface {\n    // * get bundle config\n    config: () => Promise<DosConfig>;\n\n    // * current render buffer width\n    height: () => number;\n\n    // * current render buffer height\n    width: () => number;\n\n    // * sound frequency\n    soundFrequency: () => number;\n\n    // * `screenshot()` - get screnshot of canvas as ImageData\n    screenshot: () => Promise<ImageData>;\n\n    // * `pause()` - pause emulation (also mute all sounds)\n    pause: () => void;\n\n    // * `resume()` - resume emulation (also unmute all sounds)\n    resume: () => void;\n\n    // * `mute()` - mute all sounds\n    mute: () => void;\n\n    // * `unmute()` - unmute all sounds\n    unmute: () => void;\n\n    // * `exit()` - exit from runtime\n    exit: () => Promise<void>;\n\n    // * `simulateKeyPress(...keyCodes)` - allows to simulate key press **AND** release event for key code\n    // see `sendKeyPress` to find meaning of keyCode. Key combination is supported when more than 1 keyCode is set.\n    simulateKeyPress: (...keyCodes: number[]) => void;\n\n    // * `sendKeyEvent(keyCode, pressed)` - sends single key (press or release) event to backend\n    sendKeyEvent: (keyCode: number, pressed: boolean) => void;\n\n    // * `sendMouseMotion` - sends mouse motion event to backend, position is in range [0, 1]\n    sendMouseMotion: (x: number, y: number) => void;\n\n    // * `sendRelativeMotion` - sends mouse motion event to backend, position is absolute diff of position\n    sendMouseRelativeMotion: (x: number, y: number) => void;\n\n    // * `simulateMouseButton` - sends mouse button event (press or release) to backend\n    sendMouseButton: (button: number, pressed: boolean) => void;\n\n    // * `sendMouseSync` - sends mouse sync event \n    sendMouseSync: () => void;\n\n    // dump **changed** FS as Uint8Array <zip archive>\n    persist(): Promise<Uint8Array>;\n\n    // events\n    events(): CommandInterfaceEvents;\n}\n")),(0,r.kt)("p",null,"Events interface:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},'export type MessageType = "log" | "warn" | "error" | string;\n\nexport interface CommandInterfaceEvents {\n    onStdout: (consumer: (message: string) => void) => void;\n    onFrameSize: (consumer: (width: number, height: number) => void) => void;\n    onFrame: (consumer: (rgb: Uint8Array) => void) => void;\n    onSoundPush: (consumer: (samples: Float32Array) => void) => void;\n    onExit: (consumer: () => void) => void;\n\n    onMessage: (consumer: (msgType: MessageType, ...args: any[]) => void) => void;\n}\n')))}d.isMDXComponent=!0}}]);