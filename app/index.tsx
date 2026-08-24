import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
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
    if (canOpen) {
      Linking.openURL(tossUrl);
    } else {
      Linking.openURL("https://toss.im");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>먹은척 🍽️</Text>
          <Text style={styles.subtitle}>배고픔에 지지 않고, 돈도 지키는 법</Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>오늘 뭐 먹고 싶어요?</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 치킨, 떡볶이, 케이크..."
            placeholderTextColor={COLORS.subtext}
            value={foodName}
            onChangeText={setFoodName}
            onSubmitEditing={startFlow}
            returnKeyType="next"
          />
          <Pressable style={styles.cta} onPress={startFlow}>
            <Text style={styles.ctaText}>대신 참아볼게요 →</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="오늘 아낀 돈" value={formatWon(todayTotals.moneySaved)} accentColor={COLORS.success} emoji="💰" />
          <StatCard label="오늘 피한 칼로리" value={formatKcal(todayTotals.calories)} accentColor={COLORS.primary} emoji="🔥" />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="누적 절약 금액" value={formatWon(allTimeTotals.moneySaved)} accentColor={COLORS.success} emoji="🏦" />
          <StatCard label="누적 참은 횟수" value={`${allTimeTotals.count}회`} accentColor={COLORS.primary} emoji="✅" />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {entries.length > 0 && (
            <Pressable onPress={() => router.push("/history")}>
              <Text style={styles.link}>전체보기</Text>
            </Pressable>
          )}
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 기록이 없어요.{"\n"}배고플 때 위에 입력해보세요!</Text>
          </View>
        ) : (
          entries.slice(0, 5).map((e) => (
            <View key={e.id} style={styles.entryRow}>
              <Text style={styles.entryEmoji}>{e.emoji}</Text>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{e.foodName}</Text>
                <Text style={styles.entrySub}>
                  {formatWon(e.price)} 절약 · {formatKcal(e.calories)} 회피
                </Text>
              </View>
            </View>
          ))
        )}

        <Pressable style={styles.tossButton} onPress={openToss}>
          <Text style={styles.tossButtonText}>토스 앱에서 모으기 확인하기 →</Text>
        </Pressable>
        <Text style={styles.tossHint}>
          아낀 돈을 자동으로 넣어주는 기능은 아직 지원되지 않아요. 버튼을 누르면 토스 앱이 열리고, 직접 모으기로 이체하면 돼요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40, gap: 16 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.subtext },
  promptCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptLabel: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 14, default: 10 }),
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 12 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  link: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.subtext, textAlign: "center", lineHeight: 20 },
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
  entryEmoji: { fontSize: 28 },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  entrySub: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  tossButton: {
    marginTop: 12,
    backgroundColor: "#191F28",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  tossButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  tossHint: { fontSize: 11, color: COLORS.subtext, textAlign: "center", lineHeight: 16 },
});
