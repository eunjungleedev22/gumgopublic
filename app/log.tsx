import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOW } from "@/constants/colors";
import { estimateNutrition, suggestFoodNames } from "@/lib/estimate";
import { formatKcal, formatWon } from "@/lib/format";

const SERVING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3];
const PRICE_STEPS = [1000, 5000, 10000];

export default function LogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ foodName?: string }>();
  const [foodName, setFoodName] = useState(params.foodName ?? "");
  const [servings, setServings] = useState(1);
  const [priceText, setPriceText] = useState("");

  const suggestions = useMemo(() => suggestFoodNames(foodName), [foodName]);
  const estimate = useMemo(() => estimateNutrition(foodName || "이 음식", servings), [foodName, servings]);
  const price = Number(priceText) || 0;
  const canContinue = foodName.trim().length > 0 && price > 0;

  function bumpPrice(amount: number) {
    setPriceText(String(price + amount));
  }

  // Kept as digits in state and only grouped for display, so the caret never
  // fights with the separators the user did not type.
  function onPriceChange(next: string) {
    setPriceText(next.replace(/[^0-9]/g, ""));
  }

  function goToHypnosis() {
    if (!canContinue) return;
    router.push({
      pathname: "/hypnosis",
      params: { foodName: foodName.trim(), servings: String(servings), price: String(price) },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.backRow} onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>참을 음식</Text>
        </Pressable>

        <TextInput
          style={styles.nameInput}
          placeholder="음식 이름"
          placeholderTextColor={COLORS.placeholder}
          value={foodName}
          onChangeText={setFoodName}
        />
        {foodName.length > 0 && suggestions.length > 0 && (
          <View style={styles.chipRow}>
            {suggestions.map((s) => (
              <Pressable key={s} style={styles.chip} onPress={() => setFoodName(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* What the app thinks you typed, so a wrong match is obvious before you commit. */}
        <View style={styles.matchCard}>
          <View style={styles.matchChip}>
            <Text style={styles.matchEmoji}>{estimate.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.matchName}>{foodName.trim() || "음식을 입력해보세요"}</Text>
            <Text style={styles.matchSub}>
              {servings}인분 {formatKcal(estimate.calories)} · 탄{estimate.carbs} 단{estimate.protein} 지{estimate.fat}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>얼마나 먹으려 했나요?</Text>
        <View style={styles.chipRow}>
          {SERVING_STEPS.map((s) => {
            const on = servings === s;
            return (
              <Pressable
                key={s}
                style={[styles.servingChip, on && styles.servingChipOn]}
                onPress={() => setServings(s)}
              >
                <Text style={[styles.servingText, on && styles.servingTextOn]}>{s}인분</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>얼마짜리였나요?</Text>
        <View style={[styles.priceWrap, price > 0 && styles.priceWrapOn]}>
          <TextInput
            style={styles.priceInput}
            placeholder="0"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="number-pad"
            value={price > 0 ? price.toLocaleString("ko-KR") : ""}
            onChangeText={onPriceChange}
          />
          <Text style={styles.priceUnit}>원</Text>
        </View>
        <View style={styles.stepRow}>
          {PRICE_STEPS.map((amount) => (
            <Pressable key={amount} style={styles.stepChip} onPress={() => bumpPrice(amount)}>
              <Text style={styles.stepText}>+{amount.toLocaleString("ko-KR")}</Text>
            </Pressable>
          ))}
        </View>

        {/* The payoff, shown before the button rather than after it. */}
        <View style={styles.payoff}>
          <Text style={styles.payoffLabel}>참으면 이만큼</Text>
          <View style={styles.payoffRow}>
            <Text style={styles.payoffMoney}>{formatWon(price)}</Text>
            <Text style={styles.payoffKcal}>{formatKcal(estimate.calories)}</Text>
          </View>
        </View>

        <Pressable style={[styles.cta, !canContinue && styles.ctaOff]} onPress={goToHypnosis} disabled={!canContinue}>
          <Text style={[styles.ctaText, !canContinue && styles.ctaTextOff]}>먹은 셈 치기</Text>
        </Pressable>
        <Text style={styles.hint}>상상으로 먹고, 돈은 통장에 남깁니다</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingTop: 12, paddingBottom: 40 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 16 },
  backChevron: { fontSize: 19, color: COLORS.textDim, lineHeight: 22 },
  backLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },

  nameInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLine,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 12,
    ...SHADOW.soft,
  },
  matchChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  matchEmoji: { fontSize: 23 },
  matchName: { fontSize: 17, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  matchSub: { fontSize: 12.5, color: COLORS.textFaint, marginTop: 2 },

  label: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.3, marginTop: 20, marginBottom: 8 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLine,
  },
  chipText: { fontSize: 13, color: COLORS.textDim, fontWeight: "600" },
  servingChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLine,
  },
  servingChipOn: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  servingText: { fontSize: 14, color: COLORS.textDim, fontWeight: "700", letterSpacing: -0.2 },
  servingTextOn: { color: COLORS.accentInk },

  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceLine,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  priceWrapOn: { borderColor: COLORS.accent },
  priceInput: { flex: 1, paddingVertical: 14, fontSize: 20, fontWeight: "800", color: COLORS.text, letterSpacing: -0.7 },
  priceUnit: { fontSize: 15, color: COLORS.textFaint, fontWeight: "600" },

  stepRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  stepChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceLine,
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
  },
  stepText: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.3 },

  payoff: {
    backgroundColor: COLORS.hero,
    borderWidth: 1,
    borderColor: COLORS.heroLine,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 22,
    ...SHADOW.lift,
  },
  payoffLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.2 },
  payoffRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 8 },
  payoffMoney: { fontSize: 30, fontWeight: "800", color: COLORS.accent, letterSpacing: -1.3 },
  payoffKcal: { fontSize: 16, fontWeight: "700", color: COLORS.kcal, letterSpacing: -0.5 },

  cta: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 14,
    ...SHADOW.button,
  },
  ctaOff: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceLine, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: COLORS.accentInk, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  ctaTextOff: { color: COLORS.textFaint },

  hint: { textAlign: "center", fontSize: 12.5, color: COLORS.textFaint, fontWeight: "600", marginTop: 11 },
});
