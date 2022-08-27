---
title: Using JSX

---

# Using JSX
This module can be used to render an html page using JSX

## Basic Usage
The **jsx** function can be used to generate an HTML
response object that can be returned from a handler

```tsx
import { jsx, Head } from "https://deno.land/x/deserve/utils/jsx/mod.ts"

/// ...

router.get("/", () => {
    return jsx(
        <main>
            <Head>
                <title>Home Page</title>
            </Head>
            <h1>Hello, World!</h1>
        </main>,
        {
            status: 200,
        }
    )
})

/// ...
```

## Advanced Usage
The **createJsx** function can be used to create a custom **jsx** function
It takes an object with three functions

- **transformBody**: Takes in a body node and must return jsx that is inserted into the body tag
- **transformBodyStr**: Takes in the rendered body string and must return a new body string that is inserted into the body tag
- **transformHeadStr**: Takes in the rendered head and body strings and must return a new head string that is inserted into the head tag

> Deserve Docs use this to dynamically inject compiled UNOCSS into the head tag

```tsx
import { createJsx, Head } from "https://deno.land/x/deserve/utils/jsx/mod.ts"

/// ...

const jsx = createJsx({
    // Transform the Body Node
    transformBody(body) {
        return <Container>
            {body}
        </Container>
    }
    // Transform the Body string
    transformBodyStr(bodyStr) {
        return bodyStr + `<script>console.log("Hi from the script")</script>`
    }
    // Transform the Head
    transformHeadStr(head, body) {
        return head + `<style>
            body {
                background-color: red;
            }
        </style>`;
    }
})

router.get("/", () => {
    return jsx(
        <main>
            <Head>
                <title>Home Page</title>
            </Head>
            <h1>Hello, World!</h1>
        </main>,
    )
})

/// ...
```