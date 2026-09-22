import { verifySeal } from "./seal";
import type { CapturedRequest, Inspection } from "./types";

function pickContentType(headers: Record<string, string>): string {
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === "content-type") return v.split(";")[0].trim().toLowerCase() || "unknown";
  }
  return "unknown";
}

/**
 * Deterministic request inspector — explainable, no network, no keys.
 * SAME function serves the UI, the REST API, and MCP tools.
 */
export function inspectRequest(r: CapturedRequest): Inspection {
  const contentType = pickContentType(r.headers ?? {});
  const body = r.body ?? "";
  const sizeBytes = r.size ?? Buffer.byteLength(body, "utf8");
  const findings: Inspection["findings"] = [];
  let bodyKind: Inspection["bodyKind"] = "empty";
  let keys: string[] = [];

  if (body.length === 0) {
    bodyKind = "empty";
    findings.push({ name: "Empty body", detail: "Likely a GET/HEAD ping or a webhook with no payload.", kind: "info" });
  } else if (contentType.includes("json") || (/^\s*[{[]/.test(body))) {
    try {
      const parsed: unknown = JSON.parse(body);
      bodyKind = "json";
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        keys = Object.keys(parsed as Record<string, unknown>).slice(0, 20);
        findings.push({ name: "Valid JSON", detail: `${keys.length} top-level keys: ${keys.slice(0, 6).join(", ") || "—"}.`, kind: "info" });
      } else if (Array.isArray(parsed)) {
        findings.push({ name: "JSON array", detail: `${(parsed as unknown[]).length} items at top level.`, kind: "info" });
      }
    } catch {
      bodyKind = "text";
      findings.push({ name: "Malformed JSON", detail: "Content-Type says JSON but the body does not parse — check the sender.", kind: "warn" });
    }
  } else if (contentType.includes("x-www-form-urlencoded")) {
    bodyKind = "form";
    const params = new URLSearchParams(body);
    keys = [...params.keys()].slice(0, 20);
    findings.push({ name: "Form payload", detail: `${keys.length} fields: ${keys.slice(0, 6).join(", ") || "—"}.`, kind: "info" });
  } else if (/xml|html/.test(contentType) || /^\s*</.test(body)) {
    bodyKind = "xml";
    findings.push({ name: "Markup payload", detail: "XML/HTML body — common for SOAP, RSS, or misconfigured senders.", kind: "info" });
  } else {
    bodyKind = "text";
    findings.push({ name: "Opaque body", detail: `${sizeBytes} bytes of untyped content — inspect the preview.`, kind: "info" });
  }

  const lower = Object.fromEntries(Object.entries(r.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  if (lower["x-hub-signature-256"] || lower["stripe-signature"] || lower["x-svix-signature"] || lower["x-razorpay-signature"]) {
    findings.push({ name: "Signature header", detail: "Sender signed this payload — verify it against your webhook secret server-side.", kind: "info" });
  } else if (r.method !== "GET" && bodyKind !== "empty") {
    findings.push({ name: "No signature", detail: "POST with a body but no signature header — anyone could have sent this.", kind: "warn" });
  }
  if (lower["user-agent"]) findings.push({ name: "Sender", detail: String(lower["user-agent"]).slice(0, 120), kind: "info" });
  if (sizeBytes > 100 * 1024) findings.push({ name: "Large payload", detail: `${(sizeBytes / 1024).toFixed(1)} KB — over typical webhook sizes, check for retries/loops.`, kind: "warn" });

  const sealValid = verifySeal(
    { id: r.id, bin_id: r.bin_id, method: r.method, headers: r.headers, query: r.query, body: r.body, size: r.size },
    r.prev_seal,
    r.seal,
  );

  return { contentType, bodyKind, sizeBytes, keys, findings, preview: body.slice(0, 2000), sealValid };
}
