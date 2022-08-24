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
            <h1>Hello, World!</h1>
        </main>,
        {
            head: Head({
                title: "Home Page"
            })
        }
    )
})

/// ...
```

## Custom Renderer
The **createJsx** function can be used to create a custom **jsx** function
It takes an object with three functions

- **transformBody**: Takes in a body node and must return jsx that is inserted into the body tag
- **transformOptions**: Takes in the body string and an options object and must return
a new options object
- **transformHtml**: Takes in the final html string must return a new html string that is sent directly as a response

```tsx
import { createJsx, Head } from "https://deno.land/x/deserve/utils/jsx/mod.ts"

/// ...

const jsx = createJsx({
    // Transform the body
    transformBody(body) {
        return <Container>
            {body}
        </Container>
    }
    // Transform the options
    transformOptions(bodyStr, { head, ...rest }) {
        return {
            head: <Head scripts={[
                "console.log('Hello World');"
            ]}>{head}</Head>
        }
    }
    // Transform the html
    transformHtml(html) {
        return "<!DOCTYPE html>" + html;
    }
})

router.get("/", () => {
    return jsx(
        <main>
            <h1>Hello, World!</h1>
        </main>,
        {
            head: Head({
                title: "Home Page"
            })
        }
    )
})

/// ...
```