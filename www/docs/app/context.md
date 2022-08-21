---
title: The Context Object

prev:
    - "/docs/app/handler"
    - "The Handler"

next:
    - "/docs/router/create-router"
    - "Creating a Router"
---

# The Context Object

The context object is an object that is passed as the second argument
to the handler function which contains additional information related
to the current request

## Params Object

if the handler is registered as a path restricted handler or as a route handler
the params object contains all the dynamic path params that are matched by the current route

### Example
```ts
/// ...
app.use("/test/:a/hi/:b", (request, context) => {
    const { a, b } = context.params;
    return response(`a = ${a} and b = ${b}`)
})
/// ...
```

## Pattern

pattern is related to the path restricted handlers,
pattern is a [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API)
object that successfully matched for the current path

> You most likely won't need to use this option

## Headers Object

These are the response headers for the current response
you can set and get response headers from here. [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) is a standard web API

> **Note**: You can directly set the headers of the response as a part of the
response constructor but this is useful when the current handler wants to set 
response headers but doesn't necessarily return a response,
like the cors handler uses this feature to set cors headers

### Example
```ts
/// ...
app.use((request, context) => {
    context.headers.set("X-header", "Header Value")
    return response("Sent a response with headers")
})
/// ...
```

## Connection Object

Information about the connection a request arrived on.

It has 2 properties
1. **localAddr**
    - Stores the local address of the connection.
1. **remoteAddr**
    - Stores remote address of the connection.

Both of them are of type [Deno.Addr](https://doc.deno.land/deno/stable/~/Deno.Addr)

### Example
```ts
/// ...
app.use((request, context) => {
    const { localAddr, remoteAddr } = context.conn;
    console.log(localAddr, remoteAddr);
    return response("Hello")
})
/// ...
```