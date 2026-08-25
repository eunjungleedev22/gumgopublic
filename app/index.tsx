import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { formatKcal, formatWon } from "@/lib/format";
import { StatCard } from "@/components/StatCard";

export default function HomeScreen() {
  const router = useRouter();
  const { entries, allTimeTotals, todayTotals } = useCravings();
  const [foodName, setFoodName] = useState("");

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

        {/* The running total is the whole point of the app, so it leads. */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>지금까지 아낀 돈</Text>
          <Text style={styles.heroValue}>{formatWon(allTimeTotals.moneySaved)}</Text>
          <Text style={styles.heroSub}>
            {allTimeTotals.count}번 참고 {formatKcal(allTimeTotals.calories)} 덜 먹었어요
          </Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>오늘 뭐 먹고 싶어요?</Text>
          <TextInput
            style={styles.input}
            placeholder="치킨, 떡볶이, 케이크…"
            placeholderTextColor={COLORS.textFaint}
            value={foodName}
            onChangeText={setFoodName}
            onSubmitEditing={startFlow}
            returnKeyType="next"
          />
          <Pressable style={styles.cta} onPress={startFlow}>
            <Text style={styles.ctaText}>대신 참아보기</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="오늘 아낀 돈" value={formatWon(todayTotals.moneySaved)} filled />
          <StatCard label="오늘 피한 칼로리" value={formatKcal(todayTotals.calories)} accentColor={COLORS.heat} />
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
            {entries.slice(0, 4).map((e) => (
              <View key={e.id} style={styles.entryRow}>
                <Text style={styles.entryEmoji}>{e.emoji}</Text>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{e.foodName}</Text>
                  <Text style={styles.entrySub}>{formatKcal(e.calories)}</Text>
                </View>
                <Text style={styles.entryPrice}>{formatWon(e.price)}</Text>
              </View>
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
  container: { padding: 20, paddingTop: 8, paddingBottom: 40, gap: 12 },

  wordmark: { fontSize: 15, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.3, marginBottom: 12 },

  hero: { paddingHorizontal: 2, paddingBottom: 18 },
  heroLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textDim, letterSpacing: -0.3 },
  heroValue: { fontSize: 52, fontWeight: "800", color: COLORS.accent, letterSpacing: -2.6, marginTop: 6 },
  heroSub: { fontSize: 14, color: COLORS.textDim, marginTop: 8, letterSpacing: -0.3 },

  promptCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 20, gap: 12 },
  promptLabel: { fontSize: 19, fontWeight: "700", color: COLORS.text, letterSpacing: -0.6 },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  cta: { backgroundColor: COLORS.accent, borderRadius: RADIUS.sm, paddingVertical: 16, alignItems: "center" },
  ctaText: { color: COLORS.accentInk, fontSize: 16, fontWeight: "800", letterSpacing: -0.4 },

  statsRow: { flexDirection: "row", gap: 10 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, letterSpacing: -0.4 },
  link: { fontSize: 14, color: COLORS.textDim, fontWeight: "600" },

  emptyCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 28, alignItems: "center" },
  emptyText: { color: COLORS.textFaint, textAlign: "center", lineHeight: 22, fontSize: 14 },

  list: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: 16 },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15 },
  entryEmoji: { fontSize: 22 },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 15, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },
  entrySub: { fontSize: 13, color: COLORS.textFaint, marginTop: 2 },
  entryPrice: { fontSize: 15, fontWeight: "700", color: COLORS.accent, letterSpacing: -0.4 },

  tossButton: {
    marginTop: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    paddingVertical: 15,
    alignItems: "center",
  },
  tossButtonText: { color: COLORS.text, fontWeight: "700", fontSize: 15, letterSpacing: -0.3 },
  tossHint: { fontSize: 12, color: COLORS.textFaint, textAlign: "center", lineHeight: 18, marginTop: 8 },
});
