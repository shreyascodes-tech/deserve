# Rendering Markdown

This a supporting utility for rendering markdown in deserve **can be used without deserve too**

## Usage

```ts
import { renderMd } from "https://deno.land/x/deserve/utils/md/mod.ts"

const { html } = renderMd("# Hello, World!")

console.log(html); /// <h1 id="hello-world">Hello, World!</h1>

```

## Front Matter
This module has built in support for front matter and enabled by default

```ts
import { renderMd } from "https://deno.land/x/deserve/utils/md/mod.ts"

const { html, attributes } = renderMd(`---
title: Hello
---
# Hello, World!`, {
    frontMatter: true
})

console.log(html); /// <h1 id="hello-world">Hello, World!</h1>
console.log(attributes); /// { title: "Hello" }
```

## Highlight

Syntax highlighting of code is supported and enabled by default

```ts
import { renderMd } from "https://deno.land/x/deserve/utils/md/mod.ts"

const { html, attributes } = renderMd(/** --- Markdown goses here --- */, {
    highlight: true,
    showCopyButton: true,
})

console.log(html); /// ... <h1 id="hello-world">Hello, World!</h1> ...
console.log(attributes); /// { title: "Hello" }
```

> **NOTE**: This module adds some additional html for highlighting and there are exported
**css** and **script** exports in the module that must be included in your html for better styling
and the copy button functionality if enabled

## Complete Example
> **NOTE**: You can combine this with the [jsx](/docs/utils/jsx) module for better DX

```ts

import { createApp, createRouter, response } from "https://deno.land/x/deserve/mod.ts"
import { renderMd, css, script } from "https://deno.land/x/deserve/utils/md/mod.ts"

const app = createApp()
const router = createRouter<typeof app>()

router.get("/", () => {
    const { html, attributes } = renderMd(`
    ---
        title: Hello
    ---
    # Hello, World!`
)

    return response(`
    <html>
        <head>
            <title>${attributes.title}</title>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${script}</script>
        </body>
    </html>`, {
        headers: [
            ["Content-Type", "text/html"]
        ]
    })
})

app.use(router.routes())
app.listen()
```