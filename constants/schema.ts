export interface Profile {
  name: string;
  location: string;
  bio: string;
  heroImage: string; // URL
}

export type EventType = 'upcoming' | 'history';

export interface Event {
  id: string; // e.g. 'u1', 'h1'
  date: string; // ISO 8601: YYYY-MM-DD
  title: string;
  location: string;
  link: string; // URL or ""
  isSoldOut: boolean;
  type: EventType;
}

export interface SiteData {
  profile: Profile;
  events: Event[];
}

