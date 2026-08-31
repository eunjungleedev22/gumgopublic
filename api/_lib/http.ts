import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Bodies here are tiny JSON objects; anything larger is a probe, not a client. */
const MAX_BODY_BYTES = 4 * 1024;

export class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export function readJsonBody(req: VercelRequest): Record<string, unknown> {
  const raw = req.body;
  if (raw == null) return {};

  if (typeof raw === "string") {
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      throw new HttpError(413, "요청 본문이 너무 커요");
    }
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
    } catch {
      throw new HttpError(400, "JSON 형식이 아니에요");
    }
  }

  return typeof raw === "object" ? (raw as Record<string, unknown>) : {};
}

/**
 * The Toss key is an opaque hash. Bounding it keeps a malformed or hostile value
 * from becoming a storage key.
 */
export function requireHash(body: Record<string, unknown>): string {
  const hash = body.hash;
  if (typeof hash !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(hash)) {
    throw new HttpError(400, "hash 값이 올바르지 않아요");
  }
  return hash;
}

export function requireString(body: Record<string, unknown>, field: string, maxLength = 2048): string {
  const value = body[field];
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new HttpError(400, `${field} 값이 올바르지 않아요`);
  }
  return value;
}

export function optionalString(body: Record<string, unknown>, field: string, maxLength = 256): string | undefined {
  const value = body[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.length > maxLength) {
    throw new HttpError(400, `${field} 값이 올바르지 않아요`);
  }
  return value;
}

/** Wraps a handler so every route answers with JSON and never leaks a stack trace. */
export function handle(
  method: "GET" | "POST",
  fn: (req: VercelRequest) => Promise<unknown>
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (req.method !== method) {
      res.setHeader("Allow", method);
      res.status(405).json({ error: "허용되지 않은 메서드예요" });
      return;
    }

    try {
      res.status(200).json(await fn(req));
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error("unhandled error", error);
      res.status(500).json({ error: "처리 중 오류가 발생했어요" });
    }
  };
}
