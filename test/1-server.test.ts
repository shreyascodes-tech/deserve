import { createServer, Status } from "../mod.ts";
import { assertResponse } from "./utils.ts";

Deno.test("Test server with no middlewares", async () => {
  const server = createServer();
  const request = new Request("http://localhost:3000");
  const expected = new Response("cannot GET /", { status: Status.NotFound });
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Server Middleware", async () => {
  const server = createServer();
  server.use(() => {
    return new Response("Hello from middleware");
  });

  const request = new Request("http://localhost:3000");
  const expected = new Response("Hello from middleware");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Server Middleware with state", async () => {
  const server = createServer({
    hello: "world",
  });
  server
    .use<{
      test: string;
    }>((event) => {
      event.state.test = "test";
    })
    .use((event) => {
      return new Response(event.state.hello + " " + event.state.test);
    });

  const request = new Request("http://localhost:3000");
  const expected = new Response("world test");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Server Middleware with response Headers", async () => {
  const server = createServer();

  // Set headers
  server.use(({ headers }) => {
    headers.set("X-Test", "1");
  });

  // Respond with body
  server.use(() => {
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

Deno.test("Test Server Middleware with path", async () => {
  const server = createServer();
  server.use("/api", () => {
    return new Response("Hello from middleware");
  });

  const request = new Request("http://localhost:3000/api");
  const expected = new Response("Hello from middleware");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Server Middleware with path patterns", async () => {
  const server = createServer();

  server.use("/users/:id/friends/:friendId", (event) => {
    return new Response(
      `Hello from user ${event.params.id} friend ${event.params.friendId}`
    );
  });

  const request = new Request("http://localhost:3000/users/1/friends/2");
  const expected = new Response("Hello from user 1 friend 2");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Test Server with Hooks", async () => {
  const server = createServer();
  server
    .useHook((event, resolve) => {
      if (!event.cookies.get("token")) {
        return new Response("Unauthorized", { status: Status.Unauthorized });
      }
      return resolve(event);
    })
    .use((event) => {
      return new Response(
        `Hello from middleware ${event.cookies.get("token")}`
      );
    });
  {
    const request = new Request("http://localhost:3000");
    const expected = new Response("Unauthorized", {
      status: Status.Unauthorized,
    });
    const actual = await server.handle(request);

    await assertResponse(actual, expected);
  }
  {
    const request = new Request("http://localhost:3000", {
      headers: {
        Cookie: "token=123",
      },
    });
    const expected = new Response("Hello from middleware 123");
    const actual = await server.handle(request);

    await assertResponse(actual, expected);
  }
});

Deno.test("Test Server with multiple hooks", async () => {
  const server = createServer();
  server
    .useHook((event, resolve) => {
      if (!event.cookies.get("token")) {
        return new Response("Unauthorized", { status: Status.Unauthorized });
      }
      return resolve(event);
    })
    .useHook((event, resolve) => {
      if (event.cookies.get("token") !== "123") {
        return new Response("Invalid token", { status: Status.Unauthorized });
      }
      return resolve(event);
    })
    .use((event) => {
      return new Response(
        `Hello from middleware ${event.cookies.get("token")}`
      );
    });

  {
    const request = new Request("http://localhost:3000");
    const expected = new Response("Unauthorized", {
      status: Status.Unauthorized,
    });
    const actual = await server.handle(request);

    await assertResponse(actual, expected, "Without token");
  }
  {
    const request = new Request("http://localhost:3000", {
      headers: {
        Cookie: "token=1234",
      },
    });
    const expected = new Response("Invalid token", {
      status: Status.Unauthorized,
    });
    const actual = await server.handle(request);

    await assertResponse(actual, expected, "Invalid token");
  }
  {
    const request = new Request("http://localhost:3000", {
      headers: {
        Cookie: "token=123",
      },
    });
    const expected = new Response("Hello from middleware 123");
    const actual = await server.handle(request);

    await assertResponse(actual, expected, "Valid token");
  }
});
