(()=>{function p(e){["link","go"].includes(e)&&window.scrollTo({top:0})}function c(e){let t=new URL(e||window.location.href).href;return t.endsWith("/")?t:`${t}/`}function w(e){(!window.history.state||window.history.state.url!==e)&&window.history.pushState({url:e},"internalLink",e)}function m(e){document.querySelector(e).scrollIntoView({behavior:"smooth",block:"start"})}function g(e){let t=c();return{type:"popstate",next:t}}function y(e){let t;if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return{type:"disqualified"};for(var o=e.target;o.parentNode;o=o.parentNode)if(o.nodeName==="A"){t=o;break}if(t&&t.host!==location.host)return t.target="_blank",{type:"external"};if(t&&"cold"in t?.dataset)return{type:"disqualified"};if(t!=null&&t.hasAttribute("href")){let n=t.getAttribute("href"),i=new URL(n,location.href);if(e.preventDefault(),n!=null&&n.startsWith("#"))return m(n),{type:"scrolled"};{let r=c(i.href),s=c();return{type:"link",next:r,prev:s}}}else return{type:"noop"}}function b(e){var t=new DOMParser;return t.parseFromString(e,"text/html")}function l(e){document.body.innerHTML=e.body.innerHTML}function v(e){let t=document.head,o=Array.from(document.head.children),n=Array.from(e.head.children),i=n.filter(r=>!o.find(s=>s.isEqualNode(r)));o.filter(r=>!n.find(s=>s.isEqualNode(r))).forEach(r=>{r.getAttribute("rel")!=="prefetch"&&r.remove()}),i.forEach(r=>{t.appendChild(r)})}function h(){Array.from(document.head.querySelectorAll("[data-reload]")).forEach(d),Array.from(document.body.querySelectorAll("script")).forEach(d)}async function d(e){let t=document.createElement("script"),o=Array.from(e.attributes);for(let{name:n,value:i}of o)t.setAttribute(n,i);t.appendChild(document.createTextNode(e.innerHTML)),e.parentNode.replaceChild(t,e)}var E={log:!1,prefetch:!0,pageTransitions:!1},a=class{constructor(t){this.opts=t,this.enabled=!0,this.prefetched=new Set,this.opts={...E,...t},window!=null&&window.history?(document.addEventListener("click",o=>this.onClick(o)),window.addEventListener("popstate",o=>this.onPop(o)),this.prefetch()):(console.warn("flamethrower router not supported in this browser or environment"),this.enabled=!1)}go(t){let o=window.location.href,n=new URL(t,location.origin).href;return this.reconstructDOM({type:"go",next:n,prev:o})}back(){window.history.back()}forward(){window.history.forward()}log(...t){this.opts.log&&console.log(...t)}prefetch(){let t={root:null,rootMargin:"0px",threshold:1};this.opts.prefetch&&"IntersectionObserver"in window&&(this.observer||(this.observer=new IntersectionObserver((o,n)=>{o.forEach(i=>{let r=i.target.getAttribute("href");if(this.prefetched.has(r)){n.unobserve(i.target);return}if(i.isIntersecting){let s=document.createElement("link");s.rel="prefetch",s.href=r,s.as="document",s.onload=()=>this.log("\u{1F329}\uFE0F prefetched",r),s.onerror=f=>this.log("\u{1F915} can't prefetch",r,f),document.head.appendChild(s),this.prefetched.add(r),n.unobserve(i.target)}})},t)),Array.from(document.links).filter(o=>o.href.includes(document.location.origin)&&!o.href.includes("#")&&o.href!==(document.location.href||document.location.href+"/")&&!this.prefetched.has(o.href)).forEach(o=>this.observer.observe(o)))}onClick(t){this.reconstructDOM(y(t))}onPop(t){this.reconstructDOM(g())}async reconstructDOM({type:t,next:o,prev:n}){if(!this.enabled){this.log("router disabled");return}try{if(this.log("\u26A1",t),["popstate","link","go"].includes(t)&&o!==n){this.opts.log&&console.time("\u23F1\uFE0F"),window.dispatchEvent(new CustomEvent("router:fetch")),w(o);let i=await(await fetch(o)).text(),r=b(i);v(r),this.opts.pageTransitions&&document.createDocumentTransition?document.createDocumentTransition().start(()=>{l(r),h()}):(l(r),h()),p(t),window.dispatchEvent(new CustomEvent("router:end")),setTimeout(()=>{this.prefetch()},200),this.opts.log&&console.timeEnd("\u23F1\uFE0F")}}catch(i){return window.dispatchEvent(new CustomEvent("router:error",i)),this.opts.log&&console.timeEnd("\u23F1\uFE0F"),console.error("\u{1F4A5} router fetch failed",i),!1}}},u=e=>{let t=new a(e);return e.log&&console.log("\u{1F525} flamethrower engaged"),window&&(window.flamethrower=t),t};var k=u();})();
