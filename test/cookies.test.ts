import { createServer } from "../lib/server.ts";
import { assertResponse } from "./utils.ts";

Deno.test("Get Cookie", async () => {
  const server = createServer();
  server.use(({ cookies }) => {
    return new Response(cookies.get("test") || "No cookie");
  });

  const request = new Request("http://localhost:3000", {
    headers: {
      Cookie: "test=1",
    },
  });
  const expected = new Response("1");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Set Cookie", async () => {
  const server = createServer();
  server.use(({ cookies }) => {
    cookies.set("test", "1");
    return new Response("Set cookie");
  });

  const request = new Request("http://localhost:3000");
  const expected = new Response("Set cookie", {
    headers: {
      "Set-Cookie": "test=1",
    },
  });
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Delete Cookie", async () => {
  const server = createServer();
  server.use(({ cookies }) => {
    cookies.delete("test");
    return new Response("Delete cookie");
  });

  const request = new Request("http://localhost:3000");
  const expected = new Response("Delete cookie", {
    headers: {
      "Set-Cookie": "test=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    },
  });
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});
