---
title: Quick Start
prev:
    - "/docs"
    - "Documentation"
next:
    - "/docs/app/create-app"
    - "Creating an app"
---

# Deserve Quick Start

### Import

```ts
// main.ts
import { createApp, createRouter, response } from "https://deno.land/x/deserve/mod.ts";
```

### Create App

```ts
/// ....
const app = createApp()
```

### Create Router

```ts
/// ....
const router = createRouter<typeof app>()
```
> **typeof app** gives the router better type safety

### Add Routes

Routes take in a path that follows the [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) API which is a Web standard and a series of handlers
that can return a response to complete the request or return nothing to go to the next handler

```ts
/// ....
router.get("/", (req, ctx) => {
    return response("Hello World")
})
```
> **response(...)** is just an alias for **new** [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)**(...)** which is a web standard

### Append the router to the app and start the server

```ts
/// ....

app
    .use(router.routes())
    .listen({
        port: 8080
    })
```

### Now run the app
```bash
deno run --allow-net main.ts
```

### Complete Example
```ts
import { createApp, createRouter, response } from "https://deno.land/x/deserve/mod.ts";

// Create App
const app = createApp()

// Create Router
const router = createRouter<typeof app>()

// Define Routes
router.get("/", (req, ctx) => {
    return response("Hello World")
})

app
    // Append Router to App
    .use(router.routes())
    // Start the Server
    .listen({
        port: 8080
    })
```

#### Now to visit [http://localhost:8080](https://localhost:8080) and you should see **Hello World** in the browser