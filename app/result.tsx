import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { formatKcal, formatWon } from "@/lib/format";
import { MacroBar } from "@/components/MacroBar";

export default function ResultScreen() {
  const router = useRouter();
  const { entries, isLoading, allTimeTotals } = useCravings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = entries.find((e) => e.id === id);

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
          <Text style={styles.foodEmoji}>{entry.emoji}</Text>
          <Text style={styles.foodName}>{entry.foodName}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.kcalRow}>
            <Text style={styles.kcalLabel}>피한 칼로리</Text>
            <Text style={styles.kcalValue}>{formatKcal(entry.calories)}</Text>
          </View>
          <MacroBar carbs={entry.carbs} protein={entry.protein} fat={entry.fat} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>지금까지 누적</Text>
          <Row label="총 절약 금액" value={formatWon(allTimeTotals.moneySaved)} accent />
          <Row label="총 회피 칼로리" value={formatKcal(allTimeTotals.calories)} />
          <Row label="참아낸 횟수" value={`${allTimeTotals.count}회`} />
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

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: COLORS.accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { color: COLORS.textDim },
  container: { padding: 20, paddingTop: 24, paddingBottom: 40, gap: 12 },

  kicker: { fontSize: 15, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.3 },
  amount: { fontSize: 60, fontWeight: "800", color: COLORS.accent, letterSpacing: -3, marginTop: 4 },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 18 },
  foodEmoji: { fontSize: 20 },
  foodName: { fontSize: 16, color: COLORS.textDim, fontWeight: "600", letterSpacing: -0.3 },

  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 20, gap: 14 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.2 },
  kcalRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  kcalLabel: { fontSize: 14, color: COLORS.textDim, fontWeight: "600" },
  kcalValue: { fontSize: 30, fontWeight: "800", color: COLORS.heat, letterSpacing: -1.4 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 14, color: COLORS.textDim },
  rowValue: { fontSize: 16, fontWeight: "700", color: COLORS.text, letterSpacing: -0.4 },

  primary: { backgroundColor: COLORS.accent, borderRadius: RADIUS.sm, paddingVertical: 17, alignItems: "center", marginTop: 8 },
  primaryText: { color: COLORS.accentInk, fontSize: 16, fontWeight: "800", letterSpacing: -0.4 },
  secondary: { paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: COLORS.textDim, fontSize: 14, fontWeight: "600" },
});
