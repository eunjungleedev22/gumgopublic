/**
 * Client half of the Apps in Toss account-linking flow.
 *
 * The server is the source of truth for whether linking is real or a stand-in:
 * every response carries `mode`, so there is no build-time flag on the client to
 * get out of sync with the deployed backend.
 */
export type LinkMode = "dummy" | "live";

export type LinkState =
  | { status: "unavailable" }
  | { status: "unlinked"; mode: LinkMode }
  | { status: "linked"; mode: LinkMode };

type StatusResponse = { isMapped?: boolean; mode?: LinkMode };
type LinkResponse = { success?: boolean; mode?: LinkMode };

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function checkLink(hash: string): Promise<LinkState> {
  const result = await postJson<StatusResponse>("/api/auth/migration/status", { hash });
  if (!result || !result.mode) return { status: "unavailable" };
  return result.isMapped ? { status: "linked", mode: result.mode } : { status: "unlinked", mode: result.mode };
}

/**
 * Obtains an authorization code and hands it to the server.
 *
 * Outside the Toss webview the SDK cannot run, so in dummy mode a stand-in code
 * derived from the identity is used instead — stable, so repeat calls stay
 * idempotent on the server.
 */
async function readAuthorizationCode(mode: LinkMode, hash: string) {
  try {
    const { TossAuth } = await import("@apps-in-toss/web-framework");
    return await TossAuth.login();
  } catch {
    if (mode === "dummy") {
      return { authorizationCode: `dummy-code-${hash.slice(0, 16)}`, referrer: "SANDBOX" as const };
    }
    return null;
  }
}

export async function linkAccount(hash: string): Promise<LinkState> {
  const current = await checkLink(hash);
  if (current.status !== "unlinked") return current;

  const credential = await readAuthorizationCode(current.mode, hash);
  if (!credential) return { status: "unlinked", mode: current.mode };

  const result = await postJson<LinkResponse>("/api/auth/migration/link", {
    hash,
    authorizationCode: credential.authorizationCode,
    referrer: credential.referrer,
  });

  if (!result?.success) return { status: "unlinked", mode: current.mode };
  return { status: "linked", mode: result.mode ?? current.mode };
}
