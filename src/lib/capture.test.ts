import { describe, expect, it } from "vitest";
import { readCappedBody } from "./capture";
import { inspectRequest } from "./inspect";

function requestWithBody(body: string): Request {
  return new Request("http://localhost/api/hook/bin_test", { method: "POST", body });
}

describe("readCappedBody", () => {
  it("keeps a body that is under the cap intact", async () => {
    const result = await readCappedBody(requestWithBody("hello"), 1024);
    expect(result.body).toBe("hello");
    expect(result.size).toBe(5);
    expect(result.truncated).toBe(false);
  });

  it("caps the stored body by bytes, not by characters", async () => {
    // Four-byte characters: a character-based cap would store 4x the limit.
    const body = "😀".repeat(1000);
    const result = await readCappedBody(requestWithBody(body), 100);
    expect(Buffer.byteLength(result.body, "utf8")).toBeLessThanOrEqual(100);
    expect(result.truncated).toBe(true);
    expect(result.size).toBeGreaterThan(100);
  });

  it("reports an empty body when there is none", async () => {
    const result = await readCappedBody(new Request("http://localhost/api/hook/bin_test"), 1024);
    expect(result.body).toBe("");
    expect(result.size).toBe(0);
    expect(result.truncated).toBe(false);
  });
});

describe("inspectRequest", () => {
  it("flags a payload that is larger than the cap", () => {
    const inspection = inspectRequest({
      id: "req_1",
      bin_id: "bin_test",
      method: "POST",
      headers: { "content-type": "application/json" },
      query: {},
      body: "x".repeat(200 * 1024),
      size: 200 * 1024,
      prev_seal: "0".repeat(96),
      seal: "0".repeat(96),
      received_at: new Date().toISOString(),
    });
    expect(inspection.findings.some((f) => f.name === "Large payload")).toBe(true);
  });
});
