import type { Event, EventType } from '@/constants/schema';
import { formatDateDisplay, loadSiteData, sortEvents, type SiteData } from '@/constants/site-data';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

const SHEETS_CSV_URL = process.env.EXPO_PUBLIC_SHEETS_CSV_URL ?? 'MISSING_URL';

function csvToJSON(csvText: string) {
  // Minimal RFC4180-ish CSV parser (handles quotes, commas, newlines).
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        continue;
      }
      cell += ch;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\r') continue;
    if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  rows.push(row);

  const header = (rows.shift() ?? []).map((h) => h.trim());
  const objects = rows
    .filter((r) => r.some((v) => (v ?? '').trim() !== ''))
    .map((r) => {
      const obj: Record<string, string> = {};
      for (let c = 0; c < header.length; c++) {
        const key = header[c];
        if (!key) continue;
        obj[key] = (r[c] ?? '').trim();
      }
      return obj;
    });

  return objects;
}

function coerceEventType(value: string): EventType | null {
  const v = value.trim().toLowerCase();
  if (v === 'upcoming') return 'upcoming';
  if (v === 'history') return 'history';
  return null;
}

export default function App() {
  const scrollY = new Animated.Value(0);
  const [data, setData] = useState<SiteData>(() => loadSiteData());
  const [isLoading, setIsLoading] = useState<boolean>(!!SHEETS_CSV_URL);
  const [loadError, setLoadError] = useState<string>('');
  const didFetchRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setData(loadSiteData());
    }, [])
  );

  useEffect(() => {
    if (!SHEETS_CSV_URL) {
      setIsLoading(false);
      return;
    }
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const run = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const res = await fetch(SHEETS_CSV_URL, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const csv = await res.text();
        const rows = csvToJSON(csv);

        const base = loadSiteData();
        const events = rows
          .map((r, idx): Event | undefined => {
            const type = coerceEventType(r.type ?? '');
            if (!type) return undefined;
            const date = (r.date ?? '').trim();
            const title = (r.title ?? '').trim();
            const location = (r.location ?? '').trim();
            const link = (r.link ?? '').trim();
            const id = `${type === 'upcoming' ? 'u' : 'h'}${idx + 1}`;
            const isSoldOut = String(r.isSoldOut ?? '').trim().toLowerCase() === 'true';

            return { id, date, title, location, link, isSoldOut, type };
          })
          .filter(Boolean) as Event[];

        setData({ profile: base.profile, events });
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  const { upcoming, history } = useMemo(() => sortEvents(data.events ?? []), [data.events]);
  const profile = data.profile;

  // 헤더 텍스트 애니메이션 (스크롤 시 서서히 사라짐)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingBrand}>GUMGO</Text>
        <Text style={styles.loadingSub}>LOADING DATA</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        snapToInterval={height} // 섹션별로 딱딱 걸리는 느낌 (스냅)
        decelerationRate="fast"
      >
        {/* 1. HERO SECTION */}
        <View style={styles.section}>
          <ImageBackground
            source={{
              uri:
                profile.heroImage?.trim() ||
                'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2070&auto=format&fit=crop',
            }} // fallback image
            style={styles.heroImage}
          >
            <Animated.View style={[styles.heroOverlay, { opacity: headerOpacity }]}>
              <Text style={styles.heroTitle}>{profile.name || 'GUMGO'}</Text>
              <Text style={styles.heroSub}>{(profile.location || 'TECHNO').toUpperCase()}</Text>
            </Animated.View>
          </ImageBackground>
        </View>

        {/* 2. UPCOMING SECTION */}
        <View style={[styles.section, styles.contentSection]}>
          <Text style={styles.sectionTitle}>UPCOMING</Text>
          {!!loadError && <Text style={styles.loadError}>DATA LOAD FAILED • {loadError}</Text>}
          {upcoming.length === 0 ? (
            <Text style={styles.bioText}>No upcoming events.</Text>
          ) : (
            upcoming.map((ev) => (
              <TouchableOpacity
                key={ev.id}
                style={styles.eventItem}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Text style={styles.eventDate}>{formatDateDisplay(ev.date)}</Text>
                <Text style={styles.eventLocation}>{(ev.title || ev.location || '').toUpperCase()}</Text>
                {!!ev.location && <Text style={styles.eventMeta}>{ev.location.toUpperCase()}</Text>}
                <View style={styles.line} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 3. HISTORY SECTION */}
        <View style={[styles.section, styles.contentSection]}>
          <Text style={styles.sectionTitle}>HISTORY</Text>
          {history.length === 0 ? (
            <Text style={styles.bioText}>No history yet.</Text>
          ) : (
            history.slice(0, 6).map((ev) => (
              <View key={ev.id} style={styles.historyRow}>
                <Text style={styles.historyYear}>{ev.date.slice(0, 4)}</Text>
                <Text style={styles.historyText}>
                  {(ev.title || ev.location || '').toUpperCase()}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 4. BIO SECTION */}
        <View style={[styles.section, styles.contentSection]}>
          <Text style={styles.sectionTitle}>BIO</Text>
          <Text style={styles.bioText}>
            {profile.bio?.trim()
              ? profile.bio
              : `South Korea-born, Singapore-based DJ pushing the boundaries of Techno.
From minimal house to high-energy 140+ BPM industrial sounds.`}
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handlePress}>
            <Text style={styles.contactText}>GET IN TOUCH</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingBrand: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 2.4,
  },
  loadingSub: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    letterSpacing: 3,
  },
  section: {
    height: height,
    width: '100%',
    justifyContent: 'center',
  },
  contentSection: {
    paddingHorizontal: 30,
    backgroundColor: '#000',
  },
  heroImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 80,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  heroSub: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 4,
    marginTop: 10,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#555',
    letterSpacing: 3,
    marginBottom: 50,
  },
  loadError: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    letterSpacing: 1.6,
    marginBottom: 18,
  },
  eventItem: {
    marginBottom: 40,
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  eventMeta: {
    marginTop: 8,
    fontSize: 13,
    color: '#888',
    letterSpacing: 1.5,
  },
  line: {
    height: 1,
    backgroundColor: '#222',
    marginTop: 20,
  },
  historyRow: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'baseline',
  },
  historyYear: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    width: 80,
  },
  historyText: {
    fontSize: 16,
    color: '#888',
  },
  bioText: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 34,
    fontWeight: '300',
  },
  contactButton: {
    marginTop: 50,
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: 'flex-start',
  },
  contactText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 2,
  },
});