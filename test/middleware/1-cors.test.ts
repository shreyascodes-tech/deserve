import { assertResponse } from "../utils.ts";
import { createServer, cors, Status } from "../../mod.ts";

Deno.test("Cors with default Options", async () => {
  const server = createServer();
  server.use(cors());
  server.use(() => {
    return new Response("Hello World");
  });

  const request = new Request("http://localhost:3000", {
    method: "OPTIONS",
  });

  const expected = new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "Access-Control-Allow-Credentials": "true",
      "content-length": "0",
      vary: "Access-Control-Request-Headers",
    },
    status: Status.NoContent,
  });
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Cors with custom Options", async () => {
  const server = createServer();
  server.use(
    cors({
      origin: "https://deno.land",
      methods: ["GET", "POST"],
      allowedHeaders: ["X-Test"],
      credentials: true,
    })
  );
  server.use(() => {
    return new Response("Hello World");
  });

  const request = new Request("http://localhost:3000", {
    method: "OPTIONS",
  });

  const expected = new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://deno.land",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "X-Test",
      "Access-Control-Allow-Credentials": "true",
      "content-length": "0",
      vary: "Origin",
    },
    status: Status.NoContent,
  });
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});
