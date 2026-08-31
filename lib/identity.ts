import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_ID_KEY = "meogeuncheok:localId:v1";

export type IdentitySource = "toss" | "local";

export type Identity = {
  /** Stable per-user key. Namespaces stored records and is what a server would key on. */
  id: string;
  source: IdentitySource;
};

/**
 * Reads the user's Apps in Toss key.
 *
 * The SDK only works inside the Toss webview, so it is imported lazily: on the
 * plain web build the module never loads and cannot take the app down. Every
 * documented failure mode — an old Toss app (`undefined`), an internal failure
 * (`"ERROR"`), or a throw outside Toss — falls through to the local identity.
 *
 * Note this uses `User.getAnonymousKey`, not the `getUserKeyForGame` shown in
 * Toss's migration guide: in web-framework v3 that name is a deprecated v2
 * alias for the same call, and its `INVALID_CATEGORY` branch no longer exists.
 */
async function readTossKey(): Promise<string | null> {
  try {
    const { User } = await import("@apps-in-toss/web-framework");
    const result = await User.getAnonymousKey();
    if (result && typeof result === "object" && result.type === "HASH") {
      return result.hash;
    }
    return null;
  } catch {
    return null;
  }
}

/** Random, non-guessable id for anyone outside Toss, so records still stay together. */
async function readOrCreateLocalId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(LOCAL_ID_KEY);
    if (existing) return existing;
  } catch {
    // fall through and mint a fresh one
  }

  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

  try {
    await AsyncStorage.setItem(LOCAL_ID_KEY, id);
  } catch {
    // a non-persisted id still works for this session
  }
  return id;
}

export async function resolveIdentity(): Promise<Identity> {
  const tossKey = await readTossKey();
  if (tossKey) return { id: tossKey, source: "toss" };
  return { id: await readOrCreateLocalId(), source: "local" };
}
