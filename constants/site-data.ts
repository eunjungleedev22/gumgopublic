import { Platform } from 'react-native';
import type { Event, EventType, Profile, SiteData } from '@/constants/schema';

const STORAGE_KEY_V1 = 'gumgo_site_data_v1';
const LEGACY_KEY = 'gumgo_site_content_v1';

export const DEFAULT_PROFILE: Profile = {
  name: 'GUMGO',
  location: '',
  bio: '',
  heroImage: '',
};

export const DEFAULT_SITE_DATA: SiteData = {
  profile: DEFAULT_PROFILE,
  events: [
    {
      id: 'u1',
      date: '2026-06-25',
      title: 'HÖR Berlin',
      location: 'Berlin',
      link: '',
      isSoldOut: false,
      type: 'upcoming',
    },
  ],
};

let memoryCache: SiteData | null = null;

export function isValidISODate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(`${date}T00:00:00Z`);
  return (
    !Number.isNaN(dt.getTime()) &&
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
}

export function isValidURL(url: string) {
  if (url.trim() === '') return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatDateDisplay(iso: string) {
  if (!isValidISODate(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[m - 1]} ${String(d).padStart(2, '0')}. ${y}`;
}

export function sortEvents(events: Event[]) {
  const upcoming = events
    .filter((e) => e.type === 'upcoming')
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date)); // 가까운 날짜가 위

  const history = events
    .filter((e) => e.type === 'history')
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date)); // 최근 과거가 위

  return { upcoming, history, all: [...upcoming, ...history] };
}

export function validateSiteData(d: SiteData) {
  const errors: string[] = [];

  if (typeof d.profile?.name !== 'string') errors.push('Profile.name must be a string.');
  if (typeof d.profile?.location !== 'string') errors.push('Profile.location must be a string.');
  if (typeof d.profile?.bio !== 'string') errors.push('Profile.bio must be a string.');
  if (typeof d.profile?.heroImage !== 'string') errors.push('Profile.heroImage must be a string URL.');
  if (d.profile?.heroImage && !isValidURL(d.profile.heroImage)) errors.push('Profile.heroImage must be a valid URL.');

  if (!Array.isArray(d.events)) errors.push('Events must be an array.');
  for (const e of d.events ?? []) {
    if (typeof e.id !== 'string' || e.id.trim() === '') errors.push('Event.id must be a non-empty string.');
    if (typeof e.date !== 'string' || !isValidISODate(e.date)) errors.push(`Event.date must be YYYY-MM-DD: ${e.id}`);
    if (typeof e.title !== 'string') errors.push(`Event.title must be a string: ${e.id}`);
    if (typeof e.location !== 'string') errors.push(`Event.location must be a string: ${e.id}`);
    if (typeof e.link !== 'string' || !isValidURL(e.link)) errors.push(`Event.link must be a URL (or ""): ${e.id}`);
    if (typeof e.isSoldOut !== 'boolean') errors.push(`Event.isSoldOut must be boolean: ${e.id}`);
    if (e.type !== 'upcoming' && e.type !== 'history') errors.push(`Event.type must be upcoming|history: ${e.id}`);
  }

  return errors;
}

function coerceEventType(t: unknown): EventType {
  return t === 'history' ? 'history' : 'upcoming';
}

export function normalizeSiteData(input: SiteData): SiteData {
  const profile: Profile = {
    name: String(input.profile?.name ?? DEFAULT_PROFILE.name).trim(),
    location: String(input.profile?.location ?? DEFAULT_PROFILE.location).trim(),
    bio: String(input.profile?.bio ?? DEFAULT_PROFILE.bio).trim(),
    heroImage: String(input.profile?.heroImage ?? DEFAULT_PROFILE.heroImage).trim(),
  };

  const events: Event[] = (Array.isArray(input.events) ? input.events : []).map((e, idx) => ({
    id: String(e?.id ?? `e${idx + 1}`).trim(),
    date: String(e?.date ?? '').trim(),
    title: String(e?.title ?? '').trim(),
    location: String(e?.location ?? '').trim(),
    link: String(e?.link ?? '').trim(),
    isSoldOut: Boolean(e?.isSoldOut),
    type: coerceEventType(e?.type),
  }));

  const { all } = sortEvents(events);
  return { profile, events: all };
}

function migrateLegacyToV1(rawLegacy: string): SiteData | null {
  try {
    const legacy = JSON.parse(rawLegacy) as any;
    const heroText = typeof legacy?.heroText === 'string' ? legacy.heroText : DEFAULT_PROFILE.name;
    const bio = typeof legacy?.bio === 'string' ? legacy.bio : '';
    const upcomingEvents = Array.isArray(legacy?.upcomingEvents) ? legacy.upcomingEvents : [];

    const events: Event[] = upcomingEvents.map((e: any, i: number) => ({
      id: typeof e?.id === 'string' ? e.id : `u${i + 1}`,
      date: typeof e?.date === 'string' ? e.date : '',
      title: '',
      location: typeof e?.location === 'string' ? e.location : '',
      link: '',
      isSoldOut: false,
      type: 'upcoming',
    }));

    return normalizeSiteData({
      profile: { ...DEFAULT_PROFILE, name: heroText, bio },
      events,
    });
  } catch {
    return null;
  }
}

export function loadSiteData(): SiteData {
  if (Platform.OS !== 'web') {
    return memoryCache ?? DEFAULT_SITE_DATA;
  }

  try {
    const raw = window?.localStorage?.getItem(STORAGE_KEY_V1);
    if (raw) return normalizeSiteData(JSON.parse(raw) as SiteData);

    const legacyRaw = window?.localStorage?.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacyToV1(legacyRaw);
      if (migrated) {
        saveSiteData(migrated);
        return migrated;
      }
    }

    return DEFAULT_SITE_DATA;
  } catch {
    return DEFAULT_SITE_DATA;
  }
}

export function saveSiteData(next: SiteData) {
  const normalized = normalizeSiteData(next);
  memoryCache = normalized;
  if (Platform.OS !== 'web') return;
  try {
    window?.localStorage?.setItem(STORAGE_KEY_V1, JSON.stringify(normalized));
  } catch {
    // ignore storage failures
  }
}

export type { SiteData };

