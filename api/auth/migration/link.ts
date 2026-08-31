import { handle, optionalString, readJsonBody, requireHash, requireString } from "../../_lib/http";
import { get, set } from "../../_lib/store";
import { isDummyMode, resolveUserKey } from "../../_lib/tossLogin";

const mappingKey = (hash: string) => `tossLogin:byHash:${hash}`;
const reverseKey = (userKey: string) => `tossLogin:byUserKey:${userKey}`;

/**
 * `POST /api/auth/migration/link` — `{ hash, authorizationCode, referrer? }` → `{ success: true }`
 *
 * Contract fixed by the Apps in Toss migration guide. The authorization code is
 * exchanged server-side; it never becomes a `userKey` on the client.
 */
export default handle("POST", async (req) => {
  const body = readJsonBody(req);
  const hash = requireHash(body);
  const authorizationCode = requireString(body, "authorizationCode");
  const referrer = optionalString(body, "referrer");

  // Re-linking an already mapped hash is a no-op rather than an error: the
  // client retries this call whenever a status check races a slow write.
  if ((await get(mappingKey(hash))) !== null) {
    return { success: true, mode: isDummyMode ? "dummy" : "live" };
  }

  const userKey = await resolveUserKey(authorizationCode, referrer);
  await set(mappingKey(hash), userKey);
  await set(reverseKey(userKey), hash);
  return { success: true, mode: isDummyMode ? "dummy" : "live" };
});
