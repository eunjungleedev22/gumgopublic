import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useCravings } from "@/context/CravingsContext";
import { CravingEntry } from "@/lib/types";
import { formatKcal, formatWon } from "@/lib/format";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function dateKey(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
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
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>전체 기록</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>최근 7일</Text>
          <View style={styles.summaryRow}>
            <SummaryItem label="절약 금액" value={formatWon(weekTotals.moneySaved)} />
            <SummaryItem label="회피 칼로리" value={formatKcal(weekTotals.calories)} />
            <SummaryItem label="참은 횟수" value={`${weekTotals.count}회`} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.summaryTitle}>전체 누적</Text>
          <View style={styles.summaryRow}>
            <SummaryItem label="절약 금액" value={formatWon(allTimeTotals.moneySaved)} />
            <SummaryItem label="회피 칼로리" value={formatKcal(allTimeTotals.calories)} />
            <SummaryItem label="참은 횟수" value={`${allTimeTotals.count}회`} />
          </View>
        </View>

        {grouped.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 기록이 없어요.</Text>
          </View>
        ) : (
          grouped.map(([date, dayEntries]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayLabel}>{date}</Text>
              {dayEntries.map((e) => (
                <Pressable key={e.id} style={styles.entryRow} onLongPress={() => confirmDelete(e)}>
                  <Text style={styles.entryEmoji}>{e.emoji}</Text>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{e.foodName}</Text>
                    <Text style={styles.entrySub}>
                      {formatWon(e.price)} · {formatKcal(e.calories)} · 탄{e.carbs} 단{e.protein} 지{e.fat}
                    </Text>
                  </View>
                  <Pressable hitSlop={8} onPress={() => confirmDelete(e)}>
                    <Text style={styles.deleteText}>삭제</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40, gap: 14 },
  back: { color: COLORS.subtext, fontSize: 14 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: COLORS.subtext },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { alignItems: "flex-start" },
  summaryLabel: { fontSize: 11, color: COLORS.subtext },
  summaryValue: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.subtext },
  dayGroup: { gap: 8 },
  dayLabel: { fontSize: 13, fontWeight: "700", color: COLORS.subtext, marginTop: 4 },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryEmoji: { fontSize: 26 },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  entrySub: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  deleteText: { fontSize: 12, color: COLORS.fat, fontWeight: "600" },
});
