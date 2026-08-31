import { createHash } from "node:crypto";
import { HttpError } from "./http";

/**
 * Exchanges the SDK's `authorizationCode` for the Toss `userKey`.
 *
 * This is the only piece of the server that talks to Toss. It is isolated here
 * because the request/response shape comes from the Apps in Toss "개발 연동하기"
 * page, which is not reproduced in the guides we were given — so rather than
 * guess at an endpoint and ship something that silently fails in production,
 * the call is gated behind configuration and fails loudly until filled in.
 *
 * To complete it you need, from the console and that page:
 *   TOSS_LOGIN_CLIENT_ID       콘솔에서 발급
 *   TOSS_LOGIN_CLIENT_SECRET   콘솔에서 발급
 *   TOSS_LOGIN_TOKEN_URL       AccessToken 발급 엔드포인트
 *   TOSS_LOGIN_USERINFO_URL    사용자 정보 조회 엔드포인트
 *   TOSS_LOGIN_DECRYPT_KEY     이메일로 받는 복호화 키 (절대 클라이언트로 보내지 말 것)
 *
 * The sandbox and live environments are distinguished by `referrer`
 * ("SANDBOX" | "DEFAULT"), which the SDK returns alongside the code.
 */
export type TossLoginConfig = {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  userInfoUrl: string;
  decryptKey: string;
};

export function readConfig(): TossLoginConfig | null {
  const clientId = process.env.TOSS_LOGIN_CLIENT_ID;
  const clientSecret = process.env.TOSS_LOGIN_CLIENT_SECRET;
  const tokenUrl = process.env.TOSS_LOGIN_TOKEN_URL;
  const userInfoUrl = process.env.TOSS_LOGIN_USERINFO_URL;
  const decryptKey = process.env.TOSS_LOGIN_DECRYPT_KEY;

  if (!clientId || !clientSecret || !tokenUrl || !userInfoUrl || !decryptKey) return null;
  return { clientId, clientSecret, tokenUrl, userInfoUrl, decryptKey };
}

export const isLoginConfigured = readConfig() !== null;

/**
 * Stand-in for the real exchange so the rest of the flow can be exercised before
 * the Toss contract is available. It is opt-in through `TOSS_LOGIN_MODE=dummy`,
 * every response that used it is tagged `mode: "dummy"`, and the client badges
 * itself accordingly — a dummy session must never be mistakable for a real one.
 */
export const isDummyMode = process.env.TOSS_LOGIN_MODE === "dummy";

/** Deterministic, so the same code always resolves to the same fake user. */
function dummyUserKey(authorizationCode: string, referrer?: string): string {
  const digest = createHash("sha256").update(`${authorizationCode}:${referrer ?? ""}`).digest("hex");
  return `dummy_${digest.slice(0, 24)}`;
}

/**
 * Returns the Toss `userKey` for an authorization code.
 *
 * NOTE: the two fetch calls below are not written yet. Filling them in needs the
 * exact endpoint contract; everything around this function — routing, validation,
 * storage, error handling — is complete and tested.
 */
export async function resolveUserKey(authorizationCode: string, referrer?: string): Promise<string> {
  if (isDummyMode) {
    console.warn("TOSS_LOGIN_MODE=dummy — 실제 토스 인증 없이 가짜 userKey 를 발급합니다");
    return dummyUserKey(authorizationCode, referrer);
  }

  const config = readConfig();
  if (!config) {
    throw new HttpError(503, "토스 로그인이 아직 설정되지 않았어요");
  }

  // 1) POST config.tokenUrl  — authorizationCode + clientId/clientSecret → accessToken
  // 2) GET  config.userInfoUrl — accessToken → 암호화된 사용자 정보
  // 3) config.decryptKey 로 복호화 → userKey
  throw new HttpError(501, "토스 토큰 교환이 아직 구현되지 않았어요");
}
