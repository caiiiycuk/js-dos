(window.webpackJsonp=window.webpackJsonp||[]).push([[16,17],{152:function(e,t,n){"use strict";n.r(t);n(31),n(21),n(22),n(59),n(197);var r=n(0),a=n.n(r),o=n(155),i=n(154),c=n(67),l=n(162),s=n(159),u=n(161),p=(n(201),n(156)),m=n(172),d=n(178),f=n(179),y=n(180),h=n(177),b=n(158),v=n(160),g=n(139),O=n.n(g);var k=function e(t,n){return"link"===t.type?(r=t.href,a=n,(o=function(e){return e.endsWith("/")?e:e+"/"})(r)===o(a)):"category"===t.type&&t.items.some((function(t){return e(t,n)}));var r,a,o};function E(e){var t,n,o,i=e.item,c=e.onItemClick,l=e.collapsible,m=e.activePath,d=Object(u.a)(e,["item","onItemClick","collapsible","activePath"]),f=i.items,y=i.label,h=k(i,m),b=(n=h,o=Object(r.useRef)(n),Object(r.useEffect)((function(){o.current=n}),[n]),o.current),v=Object(r.useState)((function(){return!!l&&(!h&&i.collapsed)})),g=v[0],E=v[1];Object(r.useEffect)((function(){h&&!b&&g&&E(!1)}),[h,b,g]);var j=Object(r.useCallback)((function(e){e.preventDefault(),E((function(e){return!e}))}),[E]);return 0===f.length?null:a.a.createElement("li",{className:Object(p.a)("menu__list-item",{"menu__list-item--collapsed":g}),key:y},a.a.createElement("a",Object(s.a)({className:Object(p.a)("menu__link",(t={"menu__link--sublist":l,"menu__link--active":l&&h},t[O.a.menuLinkText]=!l,t)),onClick:l?j:void 0,href:l?"#!":void 0},d),y),a.a.createElement("ul",{className:"menu__list"},f.map((function(e){return a.a.createElement(w,{tabIndex:g?"-1":"0",key:e.label,item:e,onItemClick:c,collapsible:l,activePath:m})}))))}function j(e){var t=e.item,n=e.onItemClick,r=e.activePath,o=(e.collapsible,Object(u.a)(e,["item","onItemClick","activePath","collapsible"])),i=t.href,c=t.label,l=k(t,r);return a.a.createElement("li",{className:"menu__list-item",key:c},a.a.createElement(b.a,Object(s.a)({className:Object(p.a)("menu__link",{"menu__link--active":l}),to:i},Object(v.a)(i)?{isNavLink:!0,exact:!0,onClick:n}:{target:"_blank",rel:"noreferrer noopener"},o),c))}function w(e){switch(e.item.type){case"category":return a.a.createElement(E,e);case"link":default:return a.a.createElement(j,e)}}var C=function(e){var t,n,o=Object(r.useState)(!1),c=o[0],l=o[1],u=Object(i.a)(),v=u.siteConfig,g=(v=void 0===v?{}:v).themeConfig.navbar,k=(g=void 0===g?{}:g).title,E=g.hideOnScroll,j=void 0!==E&&E,C=u.isClient,P=Object(y.a)(),N=P.logoLink,x=P.logoLinkProps,_=P.logoImageUrl,S=P.logoAlt,T=Object(m.a)().isAnnouncementBarClosed,A=Object(h.a)().scrollY,I=e.docsSidebars,D=e.path,M=e.sidebar,L=e.sidebarCollapsible;Object(d.a)(c);var W=Object(f.a)();if(Object(r.useEffect)((function(){W===f.b.desktop&&l(!1)}),[W]),!M)return null;var F=I[M];if(!F)throw new Error('Cannot find the sidebar "'+M+'" in the sidebar config!');return a.a.createElement("div",{className:Object(p.a)(O.a.sidebar,(t={},t[O.a.sidebarWithHideableNavbar]=j,t))},j&&a.a.createElement(b.a,Object(s.a)({tabIndex:"-1",className:O.a.sidebarLogo,to:N},x),null!=_&&a.a.createElement("img",{key:C,src:_,alt:S}),null!=k&&a.a.createElement("strong",null,k)),a.a.createElement("div",{className:Object(p.a)("menu","menu--responsive",O.a.menu,(n={"menu--show":c},n[O.a.menuWithAnnouncementBar]=!T&&0===A,n))},a.a.createElement("button",{"aria-label":c?"Close Menu":"Open Menu","aria-haspopup":"true",className:"button button--secondary button--sm menu__button",type:"button",onClick:function(){l(!c)}},c?a.a.createElement("span",{className:Object(p.a)(O.a.sidebarMenuIcon,O.a.sidebarMenuCloseIcon)},"\xd7"):a.a.createElement("svg",{"aria-label":"Menu",className:O.a.sidebarMenuIcon,xmlns:"http://www.w3.org/2000/svg",height:24,width:24,viewBox:"0 0 32 32",role:"img",focusable:"false"},a.a.createElement("title",null,"Menu"),a.a.createElement("path",{stroke:"currentColor",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"2",d:"M4 7h22M4 15h22M4 23h22"}))),a.a.createElement("ul",{className:"menu__list"},F.map((function(e){return a.a.createElement(w,{key:e.label,item:e,onItemClick:function(e){e.target.blur(),l(!1)},collapsible:L,activePath:D})})))))},P=(n(202),n(203),n(204)),N=(n(141),n(142)),x=n.n(N),_=function(e){return function(t){var n,r=t.id,o=Object(u.a)(t,["id"]),c=Object(i.a)().siteConfig,l=(c=void 0===c?{}:c).themeConfig,s=(l=void 0===l?{}:l).navbar,m=(s=void 0===s?{}:s).hideOnScroll,d=void 0!==m&&m;return r?a.a.createElement(e,o,a.a.createElement("a",{"aria-hidden":"true",tabIndex:"-1",className:Object(p.a)("anchor",(n={},n[x.a.enhancedAnchor]=!d,n)),id:r}),o.children,a.a.createElement("a",{"aria-hidden":"true",tabIndex:"-1",className:"hash-link",href:"#"+r,title:"Direct link to heading"},"#")):a.a.createElement(e,o)}},S=n(143),T=n.n(S),A={code:function(e){var t=e.children;return"string"==typeof t?t.includes("\n")?a.a.createElement(P.a,e):a.a.createElement("code",e):t},a:function(e){return/\.[^./]+$/.test(e.href)?a.a.createElement("a",e):a.a.createElement(b.a,e)},pre:function(e){return a.a.createElement("div",Object(s.a)({className:T.a.mdxCodeBlock},e))},h1:_("h1"),h2:_("h2"),h3:_("h3"),h4:_("h4"),h5:_("h5"),h6:_("h6")},I=n(168),D=n(176),M=n(144),L=n.n(M);t.default=function(e){var t=e.route,n=e.docsMetadata,r=e.location,s=t.routes.find((function(e){return Object(D.a)(r.pathname,e)}))||{},u=n.permalinkToSidebar,p=n.docsSidebars,m=n.version,d=u[s.path],f=Object(i.a)(),y=f.siteConfig,h=(y=void 0===y?{}:y).themeConfig,b=void 0===h?{}:h,v=f.isClient,g=b.sidebarCollapsible,O=void 0===g||g;return 0===Object.keys(s).length?a.a.createElement(I.default,e):a.a.createElement(l.a,{version:m,key:v},a.a.createElement("div",{className:L.a.docPage},d&&a.a.createElement("div",{className:L.a.docSidebarContainer,role:"complementary"},a.a.createElement(C,{docsSidebars:p,path:s.path,sidebar:d,sidebarCollapsible:O})),a.a.createElement("main",{className:L.a.docMainContainer},a.a.createElement(o.a,{components:A},Object(c.a)(t.routes)))))}},155:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return f}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=a.a.createContext({}),u=function(e){var t=a.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=u(e.components);return a.a.createElement(s.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),p=u(n),d=r,f=p["".concat(i,".").concat(d)]||p[d]||m[d]||o;return n?a.a.createElement(f,c(c({ref:t},s),{},{components:n})):a.a.createElement(f,c({ref:t},s))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var s=2;s<o;s++)i[s]=n[s];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},168:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),o=n(162);t.default=function(){return a.a.createElement(o.a,{title:"Page Not Found"},a.a.createElement("div",{className:"container margin-vert--xl"},a.a.createElement("div",{className:"row"},a.a.createElement("div",{className:"col col--6 col--offset-3"},a.a.createElement("h1",{className:"hero__title"},"Page Not Found"),a.a.createElement("p",null,"We could not find what you were looking for."),a.a.createElement("p",null,"Please contact the owner of the site that linked you to the original URL and let them know their link is broken.")))))}},197:function(e,t,n){"use strict";var r=n(12),a=n(198)(5),o=!0;"find"in[]&&Array(1).find((function(){o=!1})),r(r.P+r.F*o,"Array",{find:function(e){return a(this,e,arguments.length>1?arguments[1]:void 0)}}),n(79)("find")},198:function(e,t,n){var r=n(28),a=n(57),o=n(29),i=n(27),c=n(199);e.exports=function(e,t){var n=1==e,l=2==e,s=3==e,u=4==e,p=6==e,m=5==e||p,d=t||c;return function(t,c,f){for(var y,h,b=o(t),v=a(b),g=r(c,f,3),O=i(v.length),k=0,E=n?d(t,O):l?d(t,0):void 0;O>k;k++)if((m||k in v)&&(h=g(y=v[k],k,b),e))if(n)E[k]=h;else if(h)switch(e){case 3:return!0;case 5:return y;case 6:return k;case 2:E.push(y)}else if(u)return!1;return p?-1:s||u?u:E}}},199:function(e,t,n){var r=n(200);e.exports=function(e,t){return new(r(e))(t)}},200:function(e,t,n){var r=n(13),a=n(175),o=n(3)("species");e.exports=function(e){var t;return a(e)&&("function"!=typeof(t=e.constructor)||t!==Array&&!a(t.prototype)||(t=void 0),r(t)&&null===(t=t[o])&&(t=void 0)),void 0===t?Array:t}},201:function(e,t,n){"use strict";var r=n(12),a=n(27),o=n(164),i="".endsWith;r(r.P+r.F*n(165)("endsWith"),"String",{endsWith:function(e){var t=o(this,e,"endsWith"),n=arguments.length>1?arguments[1]:void 0,r=a(t.length),c=void 0===n?r:Math.min(a(n),r),l=String(e);return i?i.call(t,l,c):t.slice(c-l.length,c)===l}})},202:function(e,t,n){"use strict";var r=n(12),a=n(82)(!0);r(r.P,"Array",{includes:function(e){return a(this,e,arguments.length>1?arguments[1]:void 0)}}),n(79)("includes")},203:function(e,t,n){"use strict";var r=n(12),a=n(164);r(r.P+r.F*n(165)("includes"),"String",{includes:function(e){return!!~a(this,e,"includes").indexOf(e,arguments.length>1?arguments[1]:void 0)}})},205:function(e,t,n){"use strict";const r=(e,{target:t=document.body}={})=>{const n=document.createElement("textarea"),r=document.activeElement;n.value=e,n.setAttribute("readonly",""),n.style.contain="strict",n.style.position="absolute",n.style.left="-9999px",n.style.fontSize="12pt";const a=document.getSelection();let o=!1;a.rangeCount>0&&(o=a.getRangeAt(0)),t.append(n),n.select(),n.selectionStart=0,n.selectionEnd=e.length;let i=!1;try{i=document.execCommand("copy")}catch(c){}return n.remove(),o&&(a.removeAllRanges(),a.addRange(o)),r&&r.focus(),i};e.exports=r,e.exports.default=r},206:function(e,t){e.exports.parse=function(e){var t=e.split(",").map((function(e){return function(e){if(/^-?\d+$/.test(e))return parseInt(e,10);var t;if(t=e.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/)){var n=t[1],r=t[2],a=t[3];if(n&&a){var o=[],i=(n=parseInt(n))<(a=parseInt(a))?1:-1;"-"!=r&&".."!=r&&"\u2025"!=r||(a+=i);for(var c=n;c!=a;c+=i)o.push(c);return o}}return[]}(e)}));return 0===t.length?[]:1===t.length?Array.isArray(t[0])?t[0]:t:t.reduce((function(e,t){return Array.isArray(e)||(e=[e]),Array.isArray(t)||(t=[t]),e.concat(t)}))}},207:function(e,t,n){"use strict";n.d(t,"b",(function(){return i}));var r=n(55),a={plain:{backgroundColor:"#2a2734",color:"#9a86fd"},styles:[{types:["comment","prolog","doctype","cdata","punctuation"],style:{color:"#6c6783"}},{types:["namespace"],style:{opacity:.7}},{types:["tag","operator","number"],style:{color:"#e09142"}},{types:["property","function"],style:{color:"#9a86fd"}},{types:["tag-id","selector","atrule-id"],style:{color:"#eeebff"}},{types:["attr-name"],style:{color:"#c4b9fe"}},{types:["boolean","string","entity","url","attr-value","keyword","control","directive","unit","statement","regex","at-rule","placeholder","variable"],style:{color:"#ffcc99"}},{types:["deleted"],style:{textDecorationLine:"line-through"}},{types:["inserted"],style:{textDecorationLine:"underline"}},{types:["italic"],style:{fontStyle:"italic"}},{types:["important","bold"],style:{fontWeight:"bold"}},{types:["important"],style:{color:"#c4b9fe"}}]},o=n(0),i={Prism:r.a,theme:a};function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(){return(l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var s=/\r\n|\r|\n/,u=function(e){0===e.length?e.push({types:["plain"],content:"",empty:!0}):1===e.length&&""===e[0].content&&(e[0].empty=!0)},p=function(e,t){var n=e.length;return n>0&&e[n-1]===t?e:e.concat(t)},m=function(e,t){var n=e.plain,r=Object.create(null),a=e.styles.reduce((function(e,n){var r=n.languages,a=n.style;return r&&!r.includes(t)||n.types.forEach((function(t){var n=l({},e[t],a);e[t]=n})),e}),r);return a.root=n,a.plain=l({},n,{backgroundColor:null}),a};function d(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&-1===t.indexOf(r)&&(n[r]=e[r]);return n}var f=function(e){function t(){for(var t=this,n=[],r=arguments.length;r--;)n[r]=arguments[r];e.apply(this,n),c(this,"getThemeDict",(function(e){if(void 0!==t.themeDict&&e.theme===t.prevTheme&&e.language===t.prevLanguage)return t.themeDict;t.prevTheme=e.theme,t.prevLanguage=e.language;var n=e.theme?m(e.theme,e.language):void 0;return t.themeDict=n})),c(this,"getLineProps",(function(e){var n=e.key,r=e.className,a=e.style,o=l({},d(e,["key","className","style","line"]),{className:"token-line",style:void 0,key:void 0}),i=t.getThemeDict(t.props);return void 0!==i&&(o.style=i.plain),void 0!==a&&(o.style=void 0!==o.style?l({},o.style,a):a),void 0!==n&&(o.key=n),r&&(o.className+=" "+r),o})),c(this,"getStyleForToken",(function(e){var n=e.types,r=e.empty,a=n.length,o=t.getThemeDict(t.props);if(void 0!==o){if(1===a&&"plain"===n[0])return r?{display:"inline-block"}:void 0;if(1===a&&!r)return o[n[0]];var i=r?{display:"inline-block"}:{},c=n.map((function(e){return o[e]}));return Object.assign.apply(Object,[i].concat(c))}})),c(this,"getTokenProps",(function(e){var n=e.key,r=e.className,a=e.style,o=e.token,i=l({},d(e,["key","className","style","token"]),{className:"token "+o.types.join(" "),children:o.content,style:t.getStyleForToken(o),key:void 0});return void 0!==a&&(i.style=void 0!==i.style?l({},i.style,a):a),void 0!==n&&(i.key=n),r&&(i.className+=" "+r),i}))}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.render=function(){var e=this.props,t=e.Prism,n=e.language,r=e.code,a=e.children,o=this.getThemeDict(this.props),i=t.languages[n];return a({tokens:function(e){for(var t=[[]],n=[e],r=[0],a=[e.length],o=0,i=0,c=[],l=[c];i>-1;){for(;(o=r[i]++)<a[i];){var m=void 0,d=t[i],f=n[i][o];if("string"==typeof f?(d=i>0?d:["plain"],m=f):(d=p(d,f.type),f.alias&&(d=p(d,f.alias)),m=f.content),"string"==typeof m){var y=m.split(s),h=y.length;c.push({types:d,content:y[0]});for(var b=1;b<h;b++)u(c),l.push(c=[]),c.push({types:d,content:y[b]})}else i++,t.push(d),n.push(m),r.push(0),a.push(m.length)}i--,t.pop(),n.pop(),r.pop(),a.pop()}return u(c),l}(void 0!==i?t.tokenize(r,i,n):[r]),className:"prism-code language-"+n,style:void 0!==o?o.root:{},getLineProps:this.getLineProps,getTokenProps:this.getTokenProps})},t}(o.Component);t.a=f},208:function(e,t,n){"use strict";var r={plain:{color:"#bfc7d5",backgroundColor:"#292d3e"},styles:[{types:["comment"],style:{color:"rgb(105, 112, 152)",fontStyle:"italic"}},{types:["string","inserted"],style:{color:"rgb(195, 232, 141)"}},{types:["number"],style:{color:"rgb(247, 140, 108)"}},{types:["builtin","char","constant","function"],style:{color:"rgb(130, 170, 255)"}},{types:["punctuation","selector"],style:{color:"rgb(199, 146, 234)"}},{types:["variable"],style:{color:"rgb(191, 199, 213)"}},{types:["class-name","attr-name"],style:{color:"rgb(255, 203, 107)"}},{types:["tag","deleted"],style:{color:"rgb(255, 85, 114)"}},{types:["operator"],style:{color:"rgb(137, 221, 255)"}},{types:["boolean"],style:{color:"rgb(255, 88, 116)"}},{types:["keyword"],style:{fontStyle:"italic"}},{types:["doctype"],style:{color:"rgb(199, 146, 234)",fontStyle:"italic"}},{types:["namespace"],style:{color:"rgb(178, 204, 214)"}},{types:["url"],style:{color:"rgb(221, 221, 221)"}}]},a=n(154),o=n(167);t.a=function(){var e=Object(a.a)().siteConfig.themeConfig.prism,t=void 0===e?{}:e,n=Object(o.a)().isDarkTheme,i=t.theme||r,c=t.darkTheme||i;return n?c:i}}}]);