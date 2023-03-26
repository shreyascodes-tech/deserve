import { assertResponse } from "../utils.ts";
import { createServer, sendFile, serveStatic } from "../../mod.ts";

Deno.test("Send File", async () => {
  const server = createServer();
  server.use((event) => {
    const filePath = "./example/static/index.html";
    return sendFile(event, filePath);
  });

  const request = new Request("http://localhost:3000");
  const expected = new Response("<h1>Hello</h1>", {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "accept-ranges": "bytes",
      "content-length": "14",
    },
  });
  const actual = await server.handle(request);

  await assertResponse(actual, expected);
});

Deno.test("Serve Static", async () => {
  const server = createServer();
  server.use(
    serveStatic({
      fsRoot: "./example/static",
      serveIndex: true,
      onError: (_, err) => {
        console.error(err);
        return new Response("Error", { status: 500 });
      },
    })
  );
  {
    const request = new Request("http://localhost:3000/");
    const expected = new Response("<h1>Hello</h1>", {
      headers: {
        "content-type": "text/html; charset=UTF-8",
        "accept-ranges": "bytes",
        "content-length": "14",
      },
    });
    const actual = await server.handle(request);

    await assertResponse(actual, expected);
  }
  {
    const request = new Request("http://localhost:3000/sample/data.txt");
    const expected = new Response("This is a sample text file", {
      headers: {
        "content-type": "text/plain; charset=UTF-8",
        "accept-ranges": "bytes",
        "content-length": "26",
      },
    });
    const actual = await server.handle(request);

    await assertResponse(actual, expected);
  }
});
