import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOW } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { formatKcal, formatWon } from "@/lib/format";
import { currentStreak } from "@/lib/streak";
import { StatCard } from "@/components/StatCard";
import { EntryRow } from "@/components/EntryRow";

export default function HomeScreen() {
  const router = useRouter();
  const { entries, allTimeTotals, todayTotals } = useCravings();
  const [foodName, setFoodName] = useState("");
  const streak = useMemo(() => currentStreak(entries), [entries]);

  function startFlow() {
    const name = foodName.trim();
    router.push({ pathname: "/log", params: name ? { foodName: name } : {} });
    setFoodName("");
  }

  async function openToss() {
    const tossUrl = "supertoss://";
    const canOpen = await Linking.canOpenURL(tossUrl).catch(() => false);
    Linking.openURL(canOpen ? tossUrl : "https://toss.im");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.wordmark}>통장통통</Text>

        {/* Entering the app means one thing: log the thing you want. So the input
            owns the top of the screen and the running total is demoted below it. */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>오늘 뭐 먹고 싶어요?</Text>
          <TextInput
            style={styles.input}
            placeholder="치킨, 떡볶이, 케이크…"
            placeholderTextColor={COLORS.placeholder}
            value={foodName}
            onChangeText={setFoodName}
            onSubmitEditing={startFlow}
            returnKeyType="next"
          />
          <Pressable style={styles.cta} onPress={startFlow}>
            <Text style={styles.ctaText}>대신 참아보기</Text>
          </Pressable>
        </View>

        <View style={styles.strip}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>{streak}일</Text>
          </View>
          <Text style={styles.stripLabel}>연속 참는 중</Text>
          <Text style={styles.stripCaption}>누적</Text>
          <Text style={styles.stripValue}>{formatWon(allTimeTotals.moneySaved)}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="오늘 아낀 돈" value={formatWon(todayTotals.moneySaved)} accentColor={COLORS.accent} />
          <StatCard label="오늘 피한 칼로리" value={formatKcal(todayTotals.calories)} accentColor={COLORS.kcal} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {entries.length > 0 && (
            <Pressable onPress={() => router.push("/history")} hitSlop={8}>
              <Text style={styles.link}>전체보기</Text>
            </Pressable>
          )}
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 기록이 없어요.{"\n"}배고플 때 위에 입력해보세요.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {entries.slice(0, 3).map((e, i) => (
              <EntryRow
                key={e.id}
                emoji={e.emoji}
                name={e.foodName}
                sub={formatKcal(e.calories)}
                price={e.price}
                divided={i > 0}
              />
            ))}
          </View>
        )}

        <Pressable style={styles.tossButton} onPress={openToss}>
          <Text style={styles.tossButtonText}>토스에서 모으기 →</Text>
        </Pressable>
        <Text style={styles.tossHint}>
          자동 적립은 아직 지원되지 않아요. 토스 앱이 열리면 직접 이체하면 돼요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingTop: 12, paddingBottom: 40 },

  wordmark: { fontSize: 14.5, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.3, marginBottom: 13 },

  hero: {
    backgroundColor: COLORS.hero,
    borderWidth: 1,
    borderColor: COLORS.heroLine,
    borderRadius: RADIUS.lg,
    padding: 22,
    gap: 13,
    ...SHADOW.lift,
  },
  heroTitle: { fontSize: 23, fontWeight: "800", color: COLORS.text, letterSpacing: -0.9, lineHeight: 30 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.heroLine,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  cta: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 18,
    alignItems: "center",
    ...SHADOW.button,
  },
  ctaText: { color: COLORS.accentInk, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },

  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginTop: 12,
    ...SHADOW.soft,
  },
  streakBadge: { backgroundColor: COLORS.accentTint, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  streakBadgeText: { fontSize: 15, fontWeight: "800", color: COLORS.accent, letterSpacing: -0.4 },
  stripLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },
  stripCaption: { fontSize: 12.5, color: COLORS.textFaint, fontWeight: "600" },
  stripValue: { fontSize: 15, fontWeight: "800", color: COLORS.accent, letterSpacing: -0.4 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 10 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, letterSpacing: -0.4 },
  link: { fontSize: 13.5, color: COLORS.textDim, fontWeight: "600" },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 28,
    alignItems: "center",
    ...SHADOW.soft,
  },
  emptyText: { color: COLORS.textFaint, textAlign: "center", lineHeight: 22, fontSize: 14 },

  list: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: 14, ...SHADOW.soft },

  tossButton: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLine,
    borderRadius: RADIUS.sm,
    paddingVertical: 15,
    alignItems: "center",
  },
  tossButtonText: { color: COLORS.text, fontWeight: "700", fontSize: 15, letterSpacing: -0.3 },
  tossHint: { fontSize: 12, color: COLORS.textFaint, textAlign: "center", lineHeight: 18, marginTop: 8 },
});
