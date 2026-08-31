import { handle, readJsonBody, requireHash } from "../../_lib/http";
import { get } from "../../_lib/store";

const mappingKey = (hash: string) => `tossLogin:byHash:${hash}`;

/**
 * `POST /api/auth/migration/status` — `{ hash }` → `{ isMapped }`
 *
 * Contract fixed by the Apps in Toss migration guide; the client calls this
 * before deciding whether it needs to run Toss login at all.
 */
export default handle("POST", async (req) => {
  const hash = requireHash(readJsonBody(req));
  return { isMapped: (await get(mappingKey(hash))) !== null };
});
