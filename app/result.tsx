import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOW } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { formatKcal, formatWon } from "@/lib/format";
import { currentStreak } from "@/lib/streak";
import { MacroBar } from "@/components/MacroBar";

export default function ResultScreen() {
  const router = useRouter();
  const { entries, isLoading, allTimeTotals } = useCravings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = entries.find((e) => e.id === id);
  const streak = useMemo(() => currentStreak(entries), [entries]);

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loading}>{isLoading ? "불러오는 중…" : "기록을 찾을 수 없어요"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>참아냈어요</Text>

        {/* The saved amount is the reward, so it gets the whole top of the screen. */}
        <Text style={styles.amount}>{formatWon(entry.price)}</Text>
        <View style={styles.foodRow}>
          <View style={styles.foodChip}>
            <Text style={styles.foodEmoji}>{entry.emoji}</Text>
          </View>
          <Text style={styles.foodName}>{entry.foodName}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.kcalRow}>
            <Text style={styles.kcalLabel}>피한 칼로리</Text>
            <Text style={styles.kcalValue}>{formatKcal(entry.calories)}</Text>
          </View>
          <MacroBar carbs={entry.carbs} protein={entry.protein} fat={entry.fat} />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHead}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{streak}일째</Text>
            </View>
            <Text style={styles.panelTitle}>연속으로 참는 중</Text>
          </View>
          <Row label="총 절약 금액" value={formatWon(allTimeTotals.moneySaved)} />
          <Row label="총 회피 칼로리" value={formatKcal(allTimeTotals.calories)} divided />
          <Row label="참아낸 횟수" value={`${allTimeTotals.count}회`} divided />
        </View>

        <Pressable style={styles.primary} onPress={() => router.replace("/")}>
          <Text style={styles.primaryText}>홈으로</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.push("/history")} hitSlop={8}>
          <Text style={styles.secondaryText}>전체 기록 보기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, divided }: { label: string; value: string; divided?: boolean }) {
  return (
    <View style={[styles.row, divided && styles.rowDivided]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { color: COLORS.textDim },
  container: { padding: 20, paddingTop: 24, paddingBottom: 40 },

  kicker: { fontSize: 15, fontWeight: "600", color: COLORS.textDim, letterSpacing: -0.3 },
  amount: { fontSize: 58, fontWeight: "700", color: COLORS.accent, letterSpacing: -2.9, marginTop: 4 },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 6, marginBottom: 20 },
  foodChip: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  foodEmoji: { fontSize: 16 },
  foodName: { fontSize: 15, color: COLORS.textDim, fontWeight: "500", letterSpacing: -0.3 },

  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, gap: 14, ...SHADOW.soft },
  kcalRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  kcalLabel: { fontSize: 14, color: COLORS.textDim, fontWeight: "500" },
  kcalValue: { fontSize: 28, fontWeight: "700", color: COLORS.kcal, letterSpacing: -1.2 },

  panel: {
    backgroundColor: COLORS.hero,
    borderWidth: 1,
    borderColor: COLORS.heroLine,
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
  },
  panelHead: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 14 },
  streakBadge: { backgroundColor: COLORS.surface, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4 },
  streakBadgeText: { fontSize: 13, fontWeight: "700", color: COLORS.accent, letterSpacing: -0.3 },
  panelTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, letterSpacing: -0.3 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
  rowDivided: { borderTopWidth: 1, borderTopColor: COLORS.heroLine },
  rowLabel: { fontSize: 13.5, color: COLORS.textDim, fontWeight: "500" },
  rowValue: { fontSize: 15, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },

  primary: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 18,
    ...SHADOW.button,
  },
  primaryText: { color: COLORS.accentInk, fontSize: 16, fontWeight: "700", letterSpacing: -0.4 },
  secondary: { paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: COLORS.textDim, fontSize: 14, fontWeight: "500" },
});
