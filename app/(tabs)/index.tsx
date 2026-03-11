import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

type Countdown = {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeCountdown(targetMs: number, nowMs: number): Countdown {
  const diff = targetMs - nowMs;
  const isPast = diff <= 0;
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { isPast, days, hours, minutes, seconds };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export default function HomeScreen() {
  const targetMs = useMemo(() => {
    // June 25 (Berlin time). On this date Berlin is CEST (+02:00).
    return new Date('2026-06-25T00:00:00+02:00').getTime();
  }, []);

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const cd = useMemo(() => computeCountdown(targetMs, nowMs), [targetMs, nowMs]);

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.countdownKicker}>D-DAY</Text>
        <Text style={styles.countdownTitle}>
          {cd.isPast ? 'HÖR Berlin — LIVE' : 'HÖR Berlin — 6.25까지 남은 시간'}
        </Text>
        <View style={styles.countdownRow}>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{cd.days}</Text>
            <Text style={styles.pillLabel}>DAYS</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{pad2(cd.hours)}</Text>
            <Text style={styles.pillLabel}>HRS</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{pad2(cd.minutes)}</Text>
            <Text style={styles.pillLabel}>MIN</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{pad2(cd.seconds)}</Text>
            <Text style={styles.pillLabel}>SEC</Text>
          </View>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.brand}>GUMGO</Text>
        <Text style={styles.tagline}>DJ / Producer</Text>
      </View>

      <View style={styles.menu}>
        <Link href="/latest-mix" asChild>
          <Pressable style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
            <Text style={styles.menuButtonText}>Latest Mix</Text>
          </Pressable>
        </Link>
        <Link href="/tour-dates" asChild>
          <Pressable style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
            <Text style={styles.menuButtonText}>Tour Dates</Text>
          </Pressable>
        </Link>
        <Link href="/about" asChild>
          <Pressable style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
            <Text style={styles.menuButtonText}>About</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const COLORS = {
  bg: '#050505',
  panel: '#0C0C0C',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.72)',
  neon: '#39FF14',
  border: 'rgba(57,255,20,0.35)',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  top: {
    gap: 10,
  },
  countdownKicker: {
    color: COLORS.neon,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  countdownTitle: {
    color: COLORS.text,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  countdownRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 78,
    alignItems: 'center',
  },
  pillValue: {
    color: COLORS.neon,
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(57,255,20,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pillLabel: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1.3,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  brand: {
    color: COLORS.text,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(255,255,255,0.12)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    marginTop: 8,
    color: COLORS.neon,
    fontSize: 14,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
  },
  menu: {
    gap: 12,
  },
  menuButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuButtonPressed: {
    borderColor: COLORS.border,
    backgroundColor: 'rgba(57,255,20,0.08)',
  },
  menuButtonText: {
    color: COLORS.text,
    fontSize: 16,
    letterSpacing: 0.8,
  },
});
