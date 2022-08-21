---
title: The createApp Function

prev:
    - "/docs/quick-start"
    - "Quick Start"
---

# The *createApp* Function

This is the core function of this library.
*createApp* function as the name suggests creates a *DeserveApp* instance

```ts
import { createApp } from "https://deno.land/x/deserve/mod.ts"

const app = createApp()
```

## Listen

The listen method allows you to start the app server with the given hostname and port

```ts
/// ...
app.listen({ port: 8080 })
```

## Handlers

Handlers are the building blocks of your server, these are similar to 
(but <u>***NOT***</u> the same) as middleware, if you are familiar
with middleware based frameworks

Handler is basically a function that takes in [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) as an argument
and can return a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) to fulfill the request or return nothing
to continue to the next registered handler

use the **use** method on the app object to register handlers

```ts
app.use(...handlers)
```

#### Example

```ts

app.use((request) => {
    return new Response("Hello, World!")
})

```

#### Example with Multiple Handlers

```ts
app.use((request) => {
    console.log(`new request at ${request.url}`);
}, () => {
    return new Response("Hello, World!")
})
```

Here the first handler logs the url of every incoming request
and because it doesn't return a response the next handler will be called
and in the above example the second handler returns a response so the execution
ends and Hello World is returned

> **NOTE**: The <u>use</u> method can be called multiple times to achieve the same effect 

## Complete Example

```ts
import { createApp } from "https://deno.land/x/deserve/mod.ts"

const app = createApp()

app.use((request) => {
    console.log(`new request at ${request.url}`);
}, () => {
    return new Response("Hello, World!")
})

app.listen({
    port: 8080
})
```
