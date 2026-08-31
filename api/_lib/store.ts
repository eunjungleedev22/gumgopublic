import { HttpError } from "./http";

/**
 * Key-value storage over the Upstash Redis REST API, which is what Vercel KV is
 * built on — so the same `KV_REST_API_*` variables Vercel injects work as-is and
 * no client library is needed.
 *
 * Serverless instances are not shared, so there is deliberately no in-process
 * cache: a mapping written by one invocation has to be visible to the next.
 */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const isStoreConfigured = Boolean(url && token);

async function command(args: (string | number)[]): Promise<unknown> {
  if (!url || !token) {
    throw new HttpError(503, "저장소가 설정되지 않았어요");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    console.error("store command failed", response.status);
    throw new HttpError(502, "저장소에 접근하지 못했어요");
  }

  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) {
    console.error("store returned error", payload.error);
    throw new HttpError(502, "저장소에 접근하지 못했어요");
  }
  return payload.result ?? null;
}

export async function get(key: string): Promise<string | null> {
  const result = await command(["GET", key]);
  return typeof result === "string" ? result : null;
}

export async function set(key: string, value: string): Promise<void> {
  await command(["SET", key, value]);
}
