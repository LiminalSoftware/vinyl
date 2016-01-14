/*! modernizr 3.3.0 (Custom Build) | MIT *
 * http://modernizr.com/download/?-canvas-cssanimations-csstransitions-flexbox-inlinesvg-smil-svg-svgasimg-svgfilters-touchevents-webaudio-setclasses !*/
!function(e,t,n){function o(e,t){return typeof e===t}function r(){var e,t,n,r,i,s,a;for(var l in _)if(_.hasOwnProperty(l)){if(e=[],t=_[l],t.name&&(e.push(t.name.toLowerCase()),t.options&&t.options.aliases&&t.options.aliases.length))for(n=0;n<t.options.aliases.length;n++)e.push(t.options.aliases[n].toLowerCase());for(r=o(t.fn,'function')?t.fn():t.fn,i=0;i<e.length;i++)s=e[i],a=s.split('.'),1===a.length?Modernizr[a[0]]=r:(!Modernizr[a[0]]||Modernizr[a[0]]instanceof Boolean||(Modernizr[a[0]]=new Boolean(Modernizr[a[0]])),Modernizr[a[0]][a[1]]=r),y.push((r?'':'no-')+a.join('-'))}}function i(e){var t=S.className,n=Modernizr._config.classPrefix||'';if(T&&(t=t.baseVal),Modernizr._config.enableJSClass){var o=new RegExp('(^|\\s)'+n+'no-js(\\s|$)');t=t.replace(o,'$1'+n+'js$2')}Modernizr._config.enableClasses&&(t+=' '+n+e.join(' '+n),T?S.className.baseVal=t:S.className=t)}function s(){return'function'!=typeof t.createElement?t.createElement(arguments[0]):T?t.createElementNS.call(t,'http://www.w3.org/2000/svg',arguments[0]):t.createElement.apply(t,arguments)}function a(){var e=t.body;return e||(e=s(T?'svg':'body'),e.fake=!0),e}function l(e,n,o,r){var i,l,f,u,c='modernizr',d=s('div'),p=a();if(parseInt(o,10))for(;o--;)f=s('div'),f.id=r?r[o]:c+(o+1),d.appendChild(f);return i=s('style'),i.type='text/css',i.id='s'+c,(p.fake?p:d).appendChild(i),p.appendChild(d),i.styleSheet?i.styleSheet.cssText=e:i.appendChild(t.createTextNode(e)),d.id=c,p.fake&&(p.style.background='',p.style.overflow='hidden',u=S.style.overflow,S.style.overflow='hidden',S.appendChild(p)),l=n(d,e),p.fake?(p.parentNode.removeChild(p),S.style.overflow=u,S.offsetHeight):d.parentNode.removeChild(d),!!l}function f(e,t){return!!~(''+e).indexOf(t)}function u(e){return e.replace(/([a-z])-([a-z])/g,function(e,t,n){return t+n.toUpperCase()}).replace(/^-/,'')}function c(e,t){return function(){return e.apply(t,arguments)}}function d(e,t,n){var r;for(var i in e)if(e[i]in t)return n===!1?e[i]:(r=t[e[i]],o(r,'function')?c(r,n||t):r);return!1}function p(e,t){if('object'==typeof e)for(var n in e)A(e,n)&&p(n,e[n]);else{e=e.toLowerCase();var o=e.split('.'),r=Modernizr[o[0]];if(2==o.length&&(r=r[o[1]]),'undefined'!=typeof r)return Modernizr;t='function'==typeof t?t():t,1==o.length?Modernizr[o[0]]=t:(!Modernizr[o[0]]||Modernizr[o[0]]instanceof Boolean||(Modernizr[o[0]]=new Boolean(Modernizr[o[0]])),Modernizr[o[0]][o[1]]=t),i([(t&&0!=t?'':'no-')+o.join('-')]),Modernizr._trigger(e,t)}return Modernizr}function m(e){return e.replace(/([A-Z])/g,function(e,t){return'-'+t.toLowerCase()}).replace(/^ms-/,'-ms-')}function v(t,o){var r=t.length;if('CSS'in e&&'supports'in e.CSS){for(;r--;)if(e.CSS.supports(m(t[r]),o))return!0;return!1}if('CSSSupportsRule'in e){for(var i=[];r--;)i.push('('+m(t[r])+':'+o+')');return i=i.join(' or '),l('@supports ('+i+') { #modernizr { position: absolute; } }',function(e){return'absolute'==getComputedStyle(e,null).position})}return n}function h(e,t,r,i){function a(){c&&(delete R.style,delete R.modElem)}if(i=o(i,'undefined')?!1:i,!o(r,'undefined')){var l=v(e,r);if(!o(l,'undefined'))return l}for(var c,d,p,m,h,g=['modernizr','tspan'];!R.style;)c=!0,R.modElem=s(g.shift()),R.style=R.modElem.style;for(p=e.length,d=0;p>d;d++)if(m=e[d],h=R.style[m],f(m,'-')&&(m=u(m)),R.style[m]!==n){if(i||o(r,'undefined'))return a(),'pfx'==t?m:!0;try{R.style[m]=r}catch(w){}if(R.style[m]!=h)return a(),'pfx'==t?m:!0}return a(),!1}function g(e,t,n,r,i){var s=e.charAt(0).toUpperCase()+e.slice(1),a=(e+' '+N.join(s+' ')+s).split(' ');return o(t,'string')||o(t,'undefined')?h(a,t,r,i):(a=(e+' '+z.join(s+' ')+s).split(' '),d(a,t,n))}function w(e,t,o){return g(e,n,n,t,o)}var y=[],_=[],C={_version:'3.3.0',_config:{classPrefix:'',enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,t){var n=this;setTimeout(function(){t(n[e])},0)},addTest:function(e,t,n){_.push({name:e,fn:t,options:n})},addAsyncTest:function(e){_.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=C,Modernizr=new Modernizr,Modernizr.addTest('svg',!!t.createElementNS&&!!t.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect),Modernizr.addTest('webaudio',function(){var t='webkitAudioContext'in e,n='AudioContext'in e;return Modernizr._config.usePrefixes?t||n:n}),Modernizr.addTest('svgfilters',function(){var t=!1;try{t='SVGFEColorMatrixElement'in e&&2==SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE}catch(n){}return t});var S=t.documentElement,T='svg'===S.nodeName.toLowerCase();Modernizr.addTest('canvas',function(){var e=s('canvas');return!(!e.getContext||!e.getContext('2d'))}),Modernizr.addTest('inlinesvg',function(){var e=s('div');return e.innerHTML='<svg/>','http://www.w3.org/2000/svg'==('undefined'!=typeof SVGRect&&e.firstChild&&e.firstChild.namespaceURI)});var x=C._config.usePrefixes?' -webkit- -moz- -o- -ms- '.split(' '):[];C._prefixes=x;var E={}.toString;Modernizr.addTest('smil',function(){return!!t.createElementNS&&/SVGAnimate/.test(E.call(t.createElementNS('http://www.w3.org/2000/svg','animate')))});var b=C.testStyles=l;Modernizr.addTest('touchevents',function(){var n;if('ontouchstart'in e||e.DocumentTouch&&t instanceof DocumentTouch)n=!0;else{var o=['@media (',x.join('touch-enabled),('),'heartz',')','{#modernizr{top:9px;position:absolute}}'].join('');b(o,function(e){n=9===e.offsetTop})}return n});var P='Moz O ms Webkit',N=C._config.usePrefixes?P.split(' '):[];C._cssomPrefixes=N;var z=C._config.usePrefixes?P.toLowerCase().split(' '):[];C._domPrefixes=z;var A;!function(){var e={}.hasOwnProperty;A=o(e,'undefined')||o(e.call,'undefined')?function(e,t){return t in e&&o(e.constructor.prototype[t],'undefined')}:function(t,n){return e.call(t,n)}}(),C._l={},C.on=function(e,t){this._l[e]||(this._l[e]=[]),this._l[e].push(t),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},C._trigger=function(e,t){if(this._l[e]){var n=this._l[e];setTimeout(function(){var e,o;for(e=0;e<n.length;e++)(o=n[e])(t)},0),delete this._l[e]}},Modernizr._q.push(function(){C.addTest=p}),Modernizr.addTest('svgasimg',t.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image','1.1'));var j={elem:s('modernizr')};Modernizr._q.push(function(){delete j.elem});var R={style:j.elem.style};Modernizr._q.unshift(function(){delete R.style}),C.testAllProps=g,C.testAllProps=w,Modernizr.addTest('cssanimations',w('animationName','a',!0)),Modernizr.addTest('flexbox',w('flexBasis','1px',!0)),Modernizr.addTest('csstransitions',w('transition','all',!0)),r(),i(y),delete C.addTest,delete C.addAsyncTest;for(var V=0;V<Modernizr._q.length;V++)Modernizr._q[V]();e.Modernizr=Modernizr}(window,document);