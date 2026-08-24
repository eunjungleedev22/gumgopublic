import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
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
          <Text style={styles.loadingText}>{isLoading ? "불러오는 중..." : "기록을 찾을 수 없어요"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.celebrate}>🎉 참아냈어요!</Text>
        <View style={styles.resultCard}>
          <Text style={styles.emoji}>{entry.emoji}</Text>
          <Text style={styles.foodName}>{entry.foodName}</Text>

          <View style={styles.bigStatsRow}>
            <View style={styles.bigStat}>
              <Text style={styles.bigStatLabel}>아낀 돈</Text>
              <Text style={[styles.bigStatValue, { color: COLORS.success }]}>{formatWon(entry.price)}</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={styles.bigStatLabel}>피한 칼로리</Text>
              <Text style={[styles.bigStatValue, { color: COLORS.primary }]}>{formatKcal(entry.calories)}</Text>
            </View>
          </View>

          <MacroBar carbs={entry.carbs} protein={entry.protein} fat={entry.fat} />
        </View>

        <View style={styles.totalsCard}>
          <Text style={styles.totalsTitle}>지금까지 누적</Text>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>총 절약 금액</Text>
            <Text style={styles.totalsValue}>{formatWon(allTimeTotals.moneySaved)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>총 회피 칼로리</Text>
            <Text style={styles.totalsValue}>{formatKcal(allTimeTotals.calories)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>참아낸 횟수</Text>
            <Text style={styles.totalsValue}>{allTimeTotals.count}회</Text>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.replace("/")}>
          <Text style={styles.primaryButtonText}>홈으로</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/history")}>
          <Text style={styles.secondaryButtonText}>전체 기록 보기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: COLORS.subtext },
  container: { padding: 20, paddingBottom: 40, gap: 16, alignItems: "stretch" },
  celebrate: { fontSize: 24, fontWeight: "800", color: COLORS.text, textAlign: "center", marginTop: 8 },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: { fontSize: 80 },
  foodName: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  bigStatsRow: { flexDirection: "row", gap: 24, marginVertical: 8 },
  bigStat: { alignItems: "center" },
  bigStatLabel: { fontSize: 13, color: COLORS.subtext, marginBottom: 4 },
  bigStatValue: { fontSize: 24, fontWeight: "800" },
  totalsCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  totalsTitle: { fontSize: 14, fontWeight: "700", color: COLORS.success, marginBottom: 4 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between" },
  totalsLabel: { fontSize: 14, color: COLORS.text },
  totalsValue: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryButton: { paddingVertical: 10, alignItems: "center" },
  secondaryButtonText: { color: COLORS.subtext, fontSize: 14, fontWeight: "600" },
});
