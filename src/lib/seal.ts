import { createHash, randomBytes } from "node:crypto";

/** Deterministic canonical JSON: sorted keys, recursive. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

/** Hash-chained audit seal: SHA-384(prevSeal + canonicalJson(record)). */
export function sealRecord(record: unknown, prevSeal: string): string {
  const h = createHash("sha384");
  h.update(prevSeal, "utf8");
  h.update(canonicalJson(record), "utf8");
  return h.digest("hex");
}

export const GENESIS_SEAL = "0".repeat(96);

/** Verify a seal by replaying the hash chain. */
export function verifySeal(record: unknown, prevSeal: string, seal: string): boolean {
  return sealRecord(record, prevSeal) === seal;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Short URL-friendly id, e.g. bin_k7q2m9xd */
export function newId(prefix: string): string {
  const bytes = randomBytes(6);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${prefix}_${s}`;
}
