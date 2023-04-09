import { assertResponse } from "../utils.ts";
import { createServer, createLogger } from "../../mod.ts";
import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";

Deno.test("Logger", async () => {
  const filePath = await Deno.makeTempFile();
  const file = await Deno.open(filePath, { write: true });

  const server = createServer().useHook(
    createLogger({
      writer: file.writable,
    })
  );

  server.use(() => {
    return new Response("Hello");
  });

  const request = new Request("http://localhost:5050");
  const expected = new Response("Hello");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);

  file.close();
  const log = await Deno.readTextFile(filePath);
  assertEquals(log, `${new Date().toLocaleDateString()} GET[200] / 2ms\n`);
});

Deno.test("Logger with custom format", async () => {
  const filePath = await Deno.makeTempFile();
  const file = await Deno.open(filePath, { write: true });

  const server = createServer().useHook(
    createLogger({
      format: ":date :method :path :status :res[content-type]",
      writer: file.writable,
    })
  );

  server.use(() => {
    return new Response("Hello");
  });

  const request = new Request("http://localhost:5050");
  const expected = new Response("Hello");
  const actual = await server.handle(request);

  await assertResponse(actual, expected);

  file.close();
  const log = await Deno.readTextFile(filePath);
  assertEquals(
    log,
    new Date().toLocaleDateString() + " GET / 200 text/plain;charset=UTF-8\n"
  );
});
