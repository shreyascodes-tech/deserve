---
title: Using JSX
prev:
    - "/docs/router/create-router"
    -  "Creating a Router"
next:
    - "/docs/utils/markdown"
    -  "Rendering Markdown"
---

# Using JSX
This module can be used to render an html page using JSX

## Basic Usage
The **jsx** function can be used to generate an HTML
response object that can be returned from a handler

```tsx
/** @jsx h */
import { h, jsx, Head, Res, Html, Body } from "https://deno.land/x/deserve/utils/jsx/mod.ts"

/// ...

router.get("/", () => {
    return jsx(
        <main>
            <Html lang="en" /> {/** This is default behavior */}
            <Res status={404} />
            <Head>
                <title>Not Found</title>
            </Head>
            <Body class="dark" />
            <h1>Oops! Page you are looking for is not found</h1>
        </main>
    )
})

/// ...
```

## Advanced Usage
The **createJSX** function can be used to create a custom **jsx** function
It takes an object with three functions

- **transformBody**: Takes in a body node and must return jsx that is inserted into the body tag
- **transform**: Takes in a render context and it properties can be mutated asynchronously

> Deserve Docs use this to dynamically inject compiled UNOCSS into the head tag

```tsx
/** @jsx h */
import { h, createJsx, Head } from "https://deno.land/x/deserve/utils/jsx/mod.ts"

/// ...

const jsx = createJsx({
    // Transform the Body Node
    transformBody(body) {
        return <Container>
            {body}
        </Container>
    }
    // Transform the Render Context
    async transform(ctx) {
        ctx.body = ctx.body + "<script>console.log('Hello from Transform')</script>"
        ctx.head.children.push(<link rel="stylesheet" href="/style.css" />)
        ctx.response.headers.append("X-custom-header", "Added")
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