import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import {
  readerFromStreamReader,
  readAll,
} from "https://deno.land/std@0.181.0/streams/mod.ts";

export async function assertResponse(
  actual: Response,
  expected: Response,
  message = ""
) {
  assertEquals(actual.status, expected.status, "status " + message);
  assertEquals(
    actual.headers.values(),
    expected.headers.values(),
    "headers " + message
  );

  if (actual.body === null || expected.body === null) {
    assertEquals(actual.body, expected.body, "body " + message);
    return;
  }
  assertEquals(
    await readAll(readerFromStreamReader(actual.body.getReader())),
    await readAll(readerFromStreamReader(expected.body.getReader())),
    "body " + message
  );
}
