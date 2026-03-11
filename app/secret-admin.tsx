import { Link, Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Event, EventType, SiteData } from '@/constants/schema';
import {
  isValidISODate,
  isValidURL,
  loadSiteData,
  saveSiteData,
  sortEvents,
  validateSiteData,
} from '@/constants/site-data';

const ADMIN_PASSCODE = process.env.EXPO_PUBLIC_ADMIN_PASSCODE;

const COLORS = {
  bg: '#050505',
  panel: '#0C0C0C',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.72)',
  border: 'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.22)',
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextIdFor(type: EventType, existing: Event[]) {
  const prefix = type === 'upcoming' ? 'u' : 'h';
  const nums = existing
    .filter((e) => e.id.startsWith(prefix))
    .map((e) => Number(e.id.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${next}`;
}

export default function SecretAdminScreen() {
  const router = useRouter();

  const [passcode, setPasscode] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);

  const [saved, setSaved] = useState<SiteData>(() => loadSiteData());
  const [draft, setDraft] = useState<SiteData>(saved);
  const passcodeRef = useRef<TextInput>(null);

  const isDirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(saved);
  }, [draft, saved]);

  const { upcoming, history } = useMemo(() => sortEvents(draft.events ?? []), [draft.events]);

  const onLogin = () => {
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthed(true);
      setPasscode('');
      return;
    }
    Alert.alert('Denied', '패스코드가 올바르지 않습니다.');
  };

  const onSave = () => {
    const errors = validateSiteData(draft);
    if (errors.length) {
      Alert.alert('Invalid input', errors.slice(0, 6).join('\n'));
      return;
    }
    saveSiteData(draft);
    const persisted = loadSiteData();
    setSaved(persisted);
    setDraft(persisted);
    Alert.alert('Saved', '변경사항이 저장되었습니다.');
  };

  const onBackToSite = () => {
    const go = () => router.replace('/(tabs)');
    if (!isDirty) return go();
    Alert.alert('Discard changes?', '저장되지 않은 변경사항이 있습니다.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: go },
    ]);
  };

  const addEvent = (type: EventType) => {
    setDraft((prev) => ({
      ...prev,
      events: [
        ...(prev.events ?? []),
        {
          id: nextIdFor(type, prev.events ?? []),
          date: '',
          title: '',
          location: '',
          link: '',
          isSoldOut: false,
          type,
        },
      ],
    }));
  };

  const removeEvent = (id: string) => {
    setDraft((prev) => ({ ...prev, events: (prev.events ?? []).filter((e) => e.id !== id) }));
  };

  const updateEvent = (id: string, patch: Partial<Event>) => {
    setDraft((prev) => ({
      ...prev,
      events: (prev.events ?? []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const setProfileField = <K extends keyof SiteData['profile']>(key: K, value: SiteData['profile'][K]) => {
    setDraft((p) => ({ ...p, profile: { ...p.profile, [key]: value } }));
  };

  return (
    <>
      <Head>
        <title>GUMGO Admin</title>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
      </Head>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!isAuthed ? (
          <View style={styles.authWrap}>
            <Text style={styles.authTitle}>GUMGO</Text>
            <Text style={styles.authSubtitle}>PRIVATE ADMIN ACCESS</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Passcode</Text>
              <TextInput
                ref={passcodeRef}
                value={passcode}
                onChangeText={setPasscode}
                placeholder="Enter passcode"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="go"
                onSubmitEditing={onLogin}
                style={styles.input}
              />
            </View>

            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]} onPress={onLogin}>
              <Text style={styles.primaryBtnText}>ACCESS</Text>
            </Pressable>

            <Link href="/(tabs)" asChild>
              <Pressable style={styles.tinyLinkBtn}>
                <Text style={styles.tinyLinkText}>Back to Site</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.pageTitle}>GUMGO ADMIN</Text>
                <Text style={styles.pageHint}>Local draft only (no DB)</Text>
              </View>
              <View style={styles.dirtyChip}>
                <Text style={styles.dirtyChipText}>{isDirty ? 'UNSAVED' : 'SAVED'}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile</Text>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={draft.profile.name}
                onChangeText={(t) => setProfileField('name', t)}
                placeholder="활동명 (예: GUMGO)"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="characters"
                style={styles.input}
              />
              <Text style={styles.label}>Location</Text>
              <TextInput
                value={draft.profile.location}
                onChangeText={(t) => setProfileField('location', t)}
                placeholder="거주/활동지 (예: Singapore)"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
              />
              <Text style={styles.label}>Hero Image (URL)</Text>
              <TextInput
                value={draft.profile.heroImage}
                onChangeText={(t) => setProfileField('heroImage', t)}
                placeholder="https://..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  draft.profile.heroImage && !isValidURL(draft.profile.heroImage) ? styles.inputInvalid : null,
                ]}
              />
              <Text style={styles.label}>Bio</Text>
              <TextInput
                value={draft.profile.bio}
                onChangeText={(t) => setProfileField('bio', t)}
                placeholder="긴 소개 문장을 입력하세요."
                placeholderTextColor="rgba(255,255,255,0.35)"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.textarea]}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <Pressable
                  style={({ pressed }) => [styles.ghostBtn, pressed && styles.btnPressed]}
                  onPress={() => addEvent('upcoming')}>
                  <Text style={styles.ghostBtnText}>+ ADD</Text>
                </Pressable>
              </View>

              <View style={styles.eventsWrap}>
                {upcoming.length === 0 ? (
                  <Text style={styles.emptyText}>No events. Add one.</Text>
                ) : (
                  upcoming.map((ev, idx) => (
                    <View key={ev.id} style={styles.eventCard}>
                      <View style={styles.eventCardTop}>
                        <Text style={styles.eventIndex}>{ev.id} • #{idx + 1}</Text>
                        <Pressable
                          style={({ pressed }) => [styles.dangerTinyBtn, pressed && styles.btnPressed]}
                          onPress={() => removeEvent(ev.id)}>
                          <Text style={styles.dangerTinyText}>DELETE</Text>
                        </Pressable>
                      </View>

                      <View style={styles.eventGrid}>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Date</Text>
                          <TextInput
                            value={ev.date}
                            onChangeText={(t) => updateEvent(ev.id, { date: t })}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            autoCapitalize="none"
                            style={[styles.input, ev.date && !isValidISODate(ev.date) ? styles.inputInvalid : null]}
                          />
                        </View>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Title</Text>
                          <TextInput
                            value={ev.title}
                            onChangeText={(t) => updateEvent(ev.id, { title: t })}
                            placeholder="공연/이벤트명"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            style={styles.input}
                          />
                        </View>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Location</Text>
                          <TextInput
                            value={ev.location}
                            onChangeText={(t) => updateEvent(ev.id, { location: t })}
                            placeholder="클럽/장소/도시"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            style={styles.input}
                          />
                        </View>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Link (URL)</Text>
                          <TextInput
                            value={ev.link}
                            onChangeText={(t) => updateEvent(ev.id, { link: t })}
                            placeholder="https://... (없으면 빈칸)"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={[styles.input, ev.link && !isValidURL(ev.link) ? styles.inputInvalid : null]}
                          />
                        </View>
                        <View style={styles.eventCardTop}>
                          <Text style={styles.label}>Sold out</Text>
                          <Pressable
                            style={({ pressed }) => [
                              styles.toggleBtn,
                              ev.isSoldOut ? styles.toggleBtnOn : styles.toggleBtnOff,
                              pressed && styles.btnPressed,
                            ]}
                            onPress={() => updateEvent(ev.id, { isSoldOut: !ev.isSoldOut })}
                          >
                            <Text style={[styles.toggleText, ev.isSoldOut ? styles.toggleTextOn : null]}>
                              {ev.isSoldOut ? 'YES' : 'NO'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>History Events</Text>
                <Pressable
                  style={({ pressed }) => [styles.ghostBtn, pressed && styles.btnPressed]}
                  onPress={() => addEvent('history')}>
                  <Text style={styles.ghostBtnText}>+ ADD</Text>
                </Pressable>
              </View>

              <View style={styles.eventsWrap}>
                {history.length === 0 ? (
                  <Text style={styles.emptyText}>No history events. Add one.</Text>
                ) : (
                  history.map((ev, idx) => (
                    <View key={ev.id} style={styles.eventCard}>
                      <View style={styles.eventCardTop}>
                        <Text style={styles.eventIndex}>{ev.id} • #{idx + 1}</Text>
                        <Pressable
                          style={({ pressed }) => [styles.dangerTinyBtn, pressed && styles.btnPressed]}
                          onPress={() => removeEvent(ev.id)}>
                          <Text style={styles.dangerTinyText}>DELETE</Text>
                        </Pressable>
                      </View>

                      <View style={styles.eventGrid}>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Date</Text>
                          <TextInput
                            value={ev.date}
                            onChangeText={(t) => updateEvent(ev.id, { date: t })}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            autoCapitalize="none"
                            style={[styles.input, ev.date && !isValidISODate(ev.date) ? styles.inputInvalid : null]}
                          />
                        </View>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Title</Text>
                          <TextInput
                            value={ev.title}
                            onChangeText={(t) => updateEvent(ev.id, { title: t })}
                            placeholder="공연/이벤트명"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            style={styles.input}
                          />
                        </View>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Location</Text>
                          <TextInput
                            value={ev.location}
                            onChangeText={(t) => updateEvent(ev.id, { location: t })}
                            placeholder="클럽/장소/도시"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            style={styles.input}
                          />
                        </View>
                        <View style={styles.eventCol}>
                          <Text style={styles.label}>Link (URL)</Text>
                          <TextInput
                            value={ev.link}
                            onChangeText={(t) => updateEvent(ev.id, { link: t })}
                            placeholder="https://... (없으면 빈칸)"
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={[styles.input, ev.link && !isValidURL(ev.link) ? styles.inputInvalid : null]}
                          />
                        </View>
                        <View style={styles.eventCardTop}>
                          <Text style={styles.label}>Sold out</Text>
                          <Pressable
                            style={({ pressed }) => [
                              styles.toggleBtn,
                              ev.isSoldOut ? styles.toggleBtnOn : styles.toggleBtnOff,
                              pressed && styles.btnPressed,
                            ]}
                            onPress={() => updateEvent(ev.id, { isSoldOut: !ev.isSoldOut })}
                          >
                            <Text style={[styles.toggleText, ev.isSoldOut ? styles.toggleTextOn : null]}>
                              {ev.isSoldOut ? 'YES' : 'NO'}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]} onPress={onSave}>
              <Text style={styles.primaryBtnText}>SAVE CHANGES</Text>
            </Pressable>

            <Pressable style={styles.tinyLinkBtn} onPress={onBackToSite}>
              <Text style={styles.tinyLinkText}>Back to Site</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  authWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  authTitle: {
    color: COLORS.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 2.4,
    textAlign: 'center',
  },
  authSubtitle: {
    marginTop: 10,
    marginBottom: 26,
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-end',
    paddingBottom: 6,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pageHint: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
  },
  dirtyChip: {
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.panel,
  },
  dirtyChipText: {
    color: COLORS.text,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  section: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  field: {
    marginBottom: 12,
    gap: 8,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  inputInvalid: {
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },
  eventsWrap: {
    gap: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    paddingVertical: 6,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  eventCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventIndex: {
    color: COLORS.text,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  eventGrid: {
    gap: 10,
  },
  eventCol: {
    gap: 8,
  },
  primaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ghostBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  dangerTinyBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dangerTinyText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  toggleBtn: {
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  toggleBtnOn: {
    backgroundColor: '#FFFFFF',
  },
  toggleBtnOff: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#FFFFFF',
  },
  toggleTextOn: {
    color: '#000000',
  },
  tinyLinkBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tinyLinkText: {
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1.2,
    textDecorationLine: 'underline',
  },
  btnPressed: {
    opacity: 0.75,
  },
});
