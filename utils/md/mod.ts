import { marked } from "https://esm.sh/marked@4.0.18";
import Prism from "https://esm.sh/prismjs@1.27.0";
import "https://esm.sh/prismjs@1.27.0/components/prism-typescript?no-check";
import "https://esm.sh/prismjs@1.27.0/components/prism-bash.min?no-check";
import { escape as htmlEscape } from "https://esm.sh/he@1.2.0";
import frontMatter from "https://esm.sh/front-matter@4.0.2";

const codeClasses = "not-prose code-wrapper-22707402-bd3br";

class Renderer extends marked.Renderer {
  heading(
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    slugger: marked.Slugger
  ): string {
    const slug = slugger.slug(raw);
    return `<h${level} id="${slug}">${text}</h${level}>`;
  }

  code(code: string, language?: string) {
    // a language of `ts, ignore` should really be `ts`
    language = language?.split(",")?.[0];
    const grammar =
      language && Object.hasOwnProperty.call(Prism.languages, language)
        ? Prism.languages[language]
        : undefined;
    if (grammar === undefined) {
      return `<pre><code>${htmlEscape(code)}</code></pre>`;
    }
    const html = Prism.highlight(code, grammar, language!);
    return `<div class="${codeClasses} highlight highlight-source-${language}"><pre>${html}</pre> <button data-copy-code="${btoa(
      code
    )}" title="copy code to clipboard"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg></button></div>`;
  }

  link(href: string, title: string, text: string) {
    if (href.startsWith("#")) {
      return `<a class="dcf0381ef31" href="${href}" title="${title}">${text}</a>`;
    }
    return `<a class="dcf0381ef31" href="${href}" title="${title}" rel="noopener noreferrer">${text}</a>`;
  }
}

marked.setOptions({
  renderer: new Renderer(),
});

export { css } from "./css.ts";
export const script = `(()=>{let e=document.querySelectorAll("[data-copy-code]");for(let t of e){let o=atob(t?.dataset?.copyCode);t.addEventListener("click",()=>{navigator.clipboard.writeText(o)})}})();`;

// deno-lint-ignore no-explicit-any
export function renderMd<Attrs = any>(md: string) {
  const { body, attributes } = frontMatter<Attrs>(md);

  const html = '<div class=".md-e044334dc0">' + marked.parse(body) + "</div>";

  return { html, attributes };
}
