import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOW } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { CravingEntry } from "@/lib/types";
import { formatKcal, formatWon } from "@/lib/format";
import { EntryRow } from "@/components/EntryRow";

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

  const weekTotal = useMemo(() => {
    const since = Date.now() - WEEK_MS;
    return entries.filter((e) => e.createdAt >= since).reduce((a, e) => a + e.price, 0);
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
        <Pressable style={styles.backRow} onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>전체 기록</Text>
        </Pressable>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>지금까지 아낀 돈</Text>
          <Text style={styles.summaryValue}>{formatWon(allTimeTotals.moneySaved)}</Text>
          <View style={styles.summaryRow}>
            <Metric label="참아낸 횟수" value={`${allTimeTotals.count}회`} />
            <Metric label="회피 칼로리" value={formatKcal(allTimeTotals.calories)} />
            <Metric label="최근 7일" value={formatWon(weekTotal)} />
          </View>
        </View>

        {grouped.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 기록이 없어요.</Text>
          </View>
        ) : (
          grouped.map(([date, dayEntries]) => (
            <View key={date}>
              <Text style={styles.dayLabel}>{date}</Text>
              <View style={styles.list}>
                {dayEntries.map((e, i) => (
                  <Pressable key={e.id} onLongPress={() => confirmDelete(e)}>
                    <EntryRow
                      emoji={e.emoji}
                      name={e.foodName}
                      sub={`${formatKcal(e.calories)} · 탄${e.carbs} 단${e.protein} 지${e.fat}`}
                      price={e.price}
                      divided={i > 0}
                    />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingTop: 12, paddingBottom: 40 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 16 },
  backChevron: { fontSize: 19, color: COLORS.textDim, lineHeight: 22 },
  backLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },

  summary: {
    backgroundColor: COLORS.hero,
    borderWidth: 1,
    borderColor: COLORS.heroLine,
    borderRadius: 22,
    padding: 20,
    ...SHADOW.lift,
  },
  summaryLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.2 },
  summaryValue: { fontSize: 38, fontWeight: "800", color: COLORS.accent, letterSpacing: -1.7, marginTop: 5 },
  summaryRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.heroLine,
  },
  metric: { flex: 1 },
  metricLabel: { fontSize: 12.5, color: COLORS.textDim, fontWeight: "600" },
  metricValue: { fontSize: 15, fontWeight: "800", color: COLORS.text, letterSpacing: -0.4, marginTop: 3 },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 28,
    alignItems: "center",
    marginTop: 18,
    ...SHADOW.soft,
  },
  emptyText: { color: COLORS.textFaint, fontSize: 14 },

  dayLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textFaint, letterSpacing: -0.2, marginTop: 18, marginBottom: 8 },
  list: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: 14, ...SHADOW.soft },
});
