import AsyncStorage from "@react-native-async-storage/async-storage";
import { CravingEntry } from "./types";

/** Pre-identity key. Kept as the migration source and never deleted, so a bad
 *  identity read can't strand someone's history. */
const LEGACY_KEY = "meogeuncheok:entries:v1";
const CLAIMED_BY_KEY = "meogeuncheok:entries:claimedBy:v1";

const keyFor = (identityId: string) => `${LEGACY_KEY}:${identityId}`;

function parseEntries(raw: string | null): CravingEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Records written before identities existed belong to whoever opens the app
 * first. The claim is recorded so a second identity on the same device does not
 * also inherit them.
 */
async function adoptLegacyEntries(identityId: string): Promise<CravingEntry[]> {
  const claimedBy = await AsyncStorage.getItem(CLAIMED_BY_KEY);
  if (claimedBy && claimedBy !== identityId) return [];

  const legacy = parseEntries(await AsyncStorage.getItem(LEGACY_KEY));
  if (legacy.length === 0) return [];

  await AsyncStorage.setItem(keyFor(identityId), JSON.stringify(legacy));
  await AsyncStorage.setItem(CLAIMED_BY_KEY, identityId);
  return legacy;
}

export async function loadEntries(identityId: string): Promise<CravingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(identityId));
    if (raw !== null) return parseEntries(raw);
    return await adoptLegacyEntries(identityId);
  } catch {
    return [];
  }
}

export async function saveEntries(identityId: string, entries: CravingEntry[]): Promise<void> {
  await AsyncStorage.setItem(keyFor(identityId), JSON.stringify(entries));
}
