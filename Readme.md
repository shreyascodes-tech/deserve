# Deserve

A simple, light weight, blazingly Fast server library for Deno

## Basic Usage

```ts
    /** Import the module */
    import { deserve, get, useParams } from "https://deno.land/x/deserve/mod.ts"

    /** Create an app Object */
    const app = deserve({
        /** Add Handlers */
        handlers: [
            (req) => {
                console.log("New Request Recived");
            },
            get("/", () => new Response("Hello World")),
            get("/:name", (req) => {
                const { name } = useParams(req)
                return Response.json({
                    message: `Hello ${name}`
                })
            })
        ]
    })

    /** Start the server */
    app.listen({
        port: 8000,
    })
```

> For Complete API documentation go to [API docs](https://doc.deno.land/https://deno.land/x/deserve/mod.ts)

## Static file Serving

```ts
    import {
        deserve,
        /** Import the static handler */
        staticHandler,
    } from "https://deno.land/x/deserve/mod.ts"

    const app = deserve({
        handlers: [
            staticHandler(
                "public", // Root Directory to serve. Defaults to "public"
                true, // A flag to turn serving index.html when visiting root directory. Defaults to True
            ),
        ]
    })

    app.listen({
        port: 8000,
    })

```

### To serve static files under a base path 

```ts
    import {
        // ...
        /** Import the route function */
        route
    } from "https://deno.land/x/deserve/mod.ts"

    // ...

    route("/assets/(.*)", staticHandler("assets"))

    // ...
```
> We'll discuss about the route function next

## Routing

```ts
    import {
        deserve,
        /** Import the method to use */
        get, post, put, patch, del, options, head
    } from "https://deno.land/x/deserve/mod.ts"

    const app = deserve({
        handlers: [
            get("/", () => new Response("Home")),
            post("/contact", async (req) => {
                const body = await req.json()
                return Response.json(body)
            }),
            // ...
        ]
    })

    app.listen({
        port: 8000,
    })

```

## Error Handling

```ts

    import {
        deserve,
        errorBoundary
    } from "https://deno.land/x/deserve/mod.ts"

    const app = deserve({
        handlers: [
            errorBoundary(
                (req) => {
                    funcThatThrows();
                    return new Response("Unreachable.!")
                },
                /** A function that handles the error */
                (req, err) => {
                    console.error(err)
                    return new Response("Oh oh an Error Occured", {
                        status: 500
                    })
                }
            )
        ]
    })

```