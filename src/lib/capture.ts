/**
 * Read at most `max` bytes of a request body without buffering the whole thing.
 *
 * The capture endpoint is public, so the limit has to be a limit on *bytes*:
 * counting characters would let a multi-byte body store several times the
 * intended size, and reading the body to the end first would mean a large
 * upload is fully materialised before it is thrown away.
 */
export async function readCappedBody(
  req: Request,
  max: number
): Promise<{ body: string; size: number; truncated: boolean }> {
  const stream = req.body;
  if (!stream) {
    return { body: "", size: 0, truncated: false };
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let kept = 0;
  let size = 0;
  let truncated = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      size += value.byteLength;
      if (kept < max) {
        const take = Math.min(value.byteLength, max - kept);
        chunks.push(value.subarray(0, take));
        kept += take;
      }
      if (size > max) {
        // Past the cap: stop reading, the rest of the upload is discarded.
        truncated = true;
        await reader.cancel().catch(() => undefined);
        break;
      }
    }
  } catch {
    // A body that cannot be read is treated as an empty one.
    return { body: "", size: 0, truncated: false };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }

  return { body: Buffer.concat(chunks).toString("utf8"), size, truncated };
}
