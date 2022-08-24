export let css =
  ".code-wrapper-22707402-bd3br{position:relative;border-radius:.25rem;background-color:#0000003f;padding:1rem}.code-wrapper-22707402-bd3br pre{max-width:100%;overflow-x:auto}.code-wrapper-22707402-bd3br button{position:absolute;right:1rem;top:50%;transform:translateY(-50%);border-radius:9999px;border-width:2px;border-color:transparent;padding:.5rem;opacity:.4;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,-webkit-text-decoration-color;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.code-wrapper-22707402-bd3br button:hover{border-color:rgb(255 255 255 / 1);opacity:.75}.code-wrapper-22707402-bd3br button:focus{opacity:.75}";

export function setCss(setter: (css: string) => string) {
  css = setter(css);
}
