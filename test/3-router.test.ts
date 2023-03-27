import { createServer, createRouter } from "../mod.ts";
import { assertResponse } from "./utils.ts";

Deno.test("Test Router Middleware", async () => {
  const server = createServer();
  const router = createRouter();
  router.use(() => {
    return new Response("Hello from middleware");
  });

  server.use(router.handler());

  const request = new Request("http://localhost:3000/any-path");
  const expected = new Response("Hello from middleware");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Router Middleware with state", async () => {
  const server = createServer({
    hello: "world",
  });
  const router = createRouter({
    server,
    state: {
      bye: "bye",
    },
    prefix: "/test",
  });

  router
    .use<{
      test: string;
    }>((event) => {
      event.state.test = "test";
    })
    .use((event) => {
      return new Response(
        event.state.hello + " " + event.state.test + " " + event.state.bye
      );
    });

  const request = new Request("http://localhost:3000/test");
  const expected = new Response("world test bye");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Router Middleware with response Headers", async () => {
  const server = createServer();
  const router = createRouter({ server });

  // Set headers
  router.use(({ headers }) => {
    headers.set("X-Test", "1");
  });

  // Respond with body
  router.use(() => {
    return new Response("Hello from middleware");
  });

  const request = new Request("http://localhost:3000");
  const expected = new Response("Hello from middleware", {
    headers: {
      "X-Test": "1",
    },
  });

  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Router routes", async () => {
  const server = createServer();
  const router = createRouter({ server });

  router
    .get("/", () => {
      return new Response("Hello from GET@/");
    })
    .get("/test", () => {
      return new Response("Hello from GET@test");
    })
    .post("/test", () => {
      return new Response("Hello from POST@test");
    })
    .put("/test", () => {
      return new Response("Hello from PUT@test");
    })
    .delete("/test", () => {
      return new Response("Hello from DELETE@test");
    })
    .patch("/test", () => {
      return new Response("Hello from PATCH@test");
    })
    .options("/test", () => {
      return new Response("Hello from OPTIONS@test");
    })
    .head("/test", () => {
      return new Response("Hello from HEAD@test");
    });

  const request = new Request("http://localhost:3000");
  const expected = new Response(`Hello from GET@/`);
  const actual = await server.handle(request);

  await assertResponse(actual, expected);

  for (const method of [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD",
  ]) {
    const request = new Request("http://localhost:3000/test", {
      method,
    });
    const expected = new Response(`Hello from ${method}@test`);
    const actual = await server.handle(request);

    await assertResponse(actual, expected);
  }
});

Deno.test("Test Router routes with params", async () => {
  const server = createServer();
  const router = createRouter({ server });

  router.get("/users/:id/friends/:friendId", (event) => {
    return new Response(
      `User ${event.params.id} has friend ${event.params.friendId}`
    );
  });

  const request = new Request("http://localhost:3000/users/1/friends/2");
  const expected = new Response("User 1 has friend 2");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Router routes with prefix", async () => {
  const server = createServer();
  const router = createRouter({ server, prefix: "/test" });

  router.get("/users/:id/friends/:friendId", (event) => {
    return new Response(
      `User ${event.params.id} has friend ${event.params.friendId}`
    );
  });

  const request = new Request("http://localhost:3000/test/users/1/friends/2");
  const expected = new Response("User 1 has friend 2");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Router routes with prefix and prefix params", async () => {
  const server = createServer();
  const router = createRouter({ server, prefix: "/api/:version" });

  router.get("/users/:id/friends/:friendId", (event) => {
    return new Response(
      `API ${event.params.version} User ${event.params.id} has friend ${event.params.friendId}`
    );
  });

  const request = new Request("http://localhost:3000/api/v1/users/1/friends/2");
  const expected = new Response("API v1 User 1 has friend 2");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Nested Routers 4 levels", async () => {
  const server = createServer();
  const router = createRouter();
  const router2 = createRouter({ prefix: "/test2" });
  const router3 = createRouter({ prefix: "/test3" });
  const router4 = createRouter({ prefix: "/test4/deeper" });

  router.get("/first", () => {
    return new Response("Hello from first");
  });

  router2.get("/second", () => {
    return new Response("Hello from second");
  });

  router3.get("/third", () => {
    return new Response("Hello from third");
  });

  router4.get("/fourth", () => {
    return new Response("Hello from fourth");
  });

  server.use(router.handler());
  router.addRouter(router2);
  router2.addRouter(router3);
  router3.addRouter(router4);

  const request1 = new Request("http://localhost:3000/first");
  const expected1 = new Response("Hello from first");
  const actual1 = await server.handle(request1);

  await assertResponse(actual1, expected1, "First request failed");

  const request2 = new Request("http://localhost:3000/test2/second");
  const expected2 = new Response("Hello from second");
  const actual2 = await server.handle(request2);

  await assertResponse(actual2, expected2, "Second request failed");

  const request3 = new Request("http://localhost:3000/test2/test3/third");
  const expected3 = new Response("Hello from third");
  const actual3 = await server.handle(request3);

  await assertResponse(actual3, expected3, "Third request failed");

  const request4 = new Request(
    "http://localhost:3000/test2/test3/test4/deeper/fourth"
  );
  const expected4 = new Response("Hello from fourth");
  const actual4 = await server.handle(request4);

  await assertResponse(actual4, expected4, "Fourth request failed");
});
