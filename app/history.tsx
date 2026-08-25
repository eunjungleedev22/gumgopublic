import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { CravingEntry } from "@/lib/types";
import { formatKcal, formatWon } from "@/lib/format";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function dateKey(ts: number): string {
  return new Date(ts).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function groupByDate(entries: CravingEntry[]): [string, CravingEntry[]][] {
  const map = new Map<string, CravingEntry[]>();
  for (const e of entries) {
    const key = dateKey(e.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

export default function HistoryScreen() {
  const router = useRouter();
  const { entries, removeEntry, allTimeTotals } = useCravings();

  const weekTotals = useMemo(() => {
    const since = Date.now() - WEEK_MS;
    const recent = entries.filter((e) => e.createdAt >= since);
    return {
      moneySaved: recent.reduce((a, e) => a + e.price, 0),
      calories: recent.reduce((a, e) => a + e.calories, 0),
      count: recent.length,
    };
  }, [entries]);

  const grouped = useMemo(() => groupByDate(entries), [entries]);

  function confirmDelete(entry: CravingEntry) {
    Alert.alert("기록 삭제", `"${entry.foodName}" 기록을 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => removeEntry(entry.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>전체 기록</Text>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>최근 7일</Text>
          <Text style={styles.summaryValue}>{formatWon(weekTotals.moneySaved)}</Text>
          <Text style={styles.summarySub}>
            {weekTotals.count}회 · {formatKcal(weekTotals.calories)}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.summaryLabel}>전체 누적</Text>
          <Text style={[styles.summaryValue, styles.summaryValueDim]}>
            {formatWon(allTimeTotals.moneySaved)}
          </Text>
          <Text style={styles.summarySub}>
            {allTimeTotals.count}회 · {formatKcal(allTimeTotals.calories)}
          </Text>
        </View>

        {grouped.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 기록이 없어요.</Text>
          </View>
        ) : (
          grouped.map(([date, dayEntries]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayLabel}>{date}</Text>
              <View style={styles.list}>
                {dayEntries.map((e) => (
                  <Pressable key={e.id} style={styles.entryRow} onLongPress={() => confirmDelete(e)}>
                    <Text style={styles.entryEmoji}>{e.emoji}</Text>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryName}>{e.foodName}</Text>
                      <Text style={styles.entrySub}>
                        {formatKcal(e.calories)} · 탄{e.carbs} 단{e.protein} 지{e.fat}
                      </Text>
                    </View>
                    <Text style={styles.entryPrice}>{formatWon(e.price)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingTop: 8, paddingBottom: 40, gap: 10 },
  back: { color: COLORS.textDim, fontSize: 15, fontWeight: "600" },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.text, letterSpacing: -1.2, marginTop: 4, marginBottom: 10 },

  summary: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 22 },
  summaryLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.2 },
  summaryValue: { fontSize: 36, fontWeight: "800", color: COLORS.accent, letterSpacing: -1.8, marginTop: 6 },
  summaryValueDim: { color: COLORS.text },
  summarySub: { fontSize: 13, color: COLORS.textFaint, marginTop: 6 },
  divider: { height: 1, backgroundColor: COLORS.surfaceAlt, marginVertical: 20 },

  emptyCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 28, alignItems: "center" },
  emptyText: { color: COLORS.textFaint, fontSize: 14 },

  dayGroup: { gap: 8, marginTop: 14 },
  dayLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textFaint, letterSpacing: -0.2 },
  list: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: 16 },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15 },
  entryEmoji: { fontSize: 22 },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 15, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },
  entrySub: { fontSize: 12, color: COLORS.textFaint, marginTop: 3 },
  entryPrice: { fontSize: 15, fontWeight: "700", color: COLORS.accent, letterSpacing: -0.4 },
});
