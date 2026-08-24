import AsyncStorage from "@react-native-async-storage/async-storage";
import { CravingEntry } from "./types";

const STORAGE_KEY = "meogeuncheok:entries:v1";

export async function loadEntries(): Promise<CravingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: CravingEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
