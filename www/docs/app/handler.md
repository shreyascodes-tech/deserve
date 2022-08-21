---
title: The Handler

prev:
    - "/docs/app/create-app"
    - "Creating an App"

next:
    - "/docs/app/context"
    - "The Context Object"
---

# The Handler

Handler is a function that takes in a request that can return a response
to fulfill the request or return nothing to continue to next handler if available
or send a default 404 response like **"cannot get /"**

### Example

```ts
/// App init logic

app.use((request) => {
    const { pathname } = new URL(request.url)
    if (request.method === "GET" && pathname === "/") {
        return new Response("Home Page")
    }
})

app.use((request) => {
    const { pathname } = new URL(request.url)
    if (request.method === "POST" && pathname === "/contact") {
        return new Response("Contact form submitted")
    }
})

/// ...rest
```

In the above example the first handler checks if the request 
is a get method to the index ("/") route and responds if it is
and returns nothing otherwise

Now the control goes to the next handler that checks for a
post request to the contact route and responds to that request

If the above handlers return nothing there is no other handler left
so the default 404 response is sent

## Context

The createApp method optionally takes in function that takes the current request and
returns an object called the context that can be accessed by all other Handlers
registered. [Click here](/docs/app/context) to learn more about context
