import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";

async function assertResponseBody(
  actual: Response,
  expected: Response,
  message = ""
) {
  if (actual.body === null || expected.body === null) {
    assertEquals(actual.body, expected.body, "body " + message);
  }
  assertEquals(await actual.text(), await expected.text(), message);
}

export async function assertResponse(
  actual: Response,
  expected: Response,
  message = ""
) {
  assertEquals(actual.status, expected.status, "status " + message);
  expected.headers.forEach((value, key) => {
    assertEquals(
      actual.headers.get(key),
      value,
      "header " + key + " " + message
    );
  });

  await assertResponseBody(actual, expected, message);
}
