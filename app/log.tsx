import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS } from "@/constants/colors";
import { estimateNutrition, suggestFoodNames } from "@/lib/estimate";
import { formatKcal, formatWon } from "@/lib/format";
import { MacroBar } from "@/components/MacroBar";

const SERVING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3];

export default function LogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ foodName?: string }>();
  const [foodName, setFoodName] = useState(params.foodName ?? "");
  const [servings, setServings] = useState(1);
  const [priceText, setPriceText] = useState("");

  const suggestions = useMemo(() => suggestFoodNames(foodName), [foodName]);
  const estimate = useMemo(() => estimateNutrition(foodName || "이 음식", servings), [foodName, servings]);
  const price = Number(priceText.replace(/[^0-9]/g, "")) || 0;
  const canContinue = foodName.trim().length > 0 && price > 0;

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
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>참을 음식</Text>

        <View style={styles.field}>
          <Text style={styles.label}>음식 이름</Text>
          <TextInput
            style={styles.input}
            placeholder="후라이드치킨"
            placeholderTextColor={COLORS.textFaint}
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>양</Text>
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>가격</Text>
          <View style={styles.priceWrap}>
            <TextInput
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor={COLORS.textFaint}
              keyboardType="number-pad"
              value={priceText}
              onChangeText={setPriceText}
            />
            <Text style={styles.priceUnit}>원</Text>
          </View>
        </View>

        <View style={styles.preview}>
          <View style={styles.previewHead}>
            <Text style={styles.previewEmoji}>{estimate.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewName}>{foodName.trim() || "음식을 입력해보세요"}</Text>
              <Text style={styles.previewMatch}>
                {estimate.matchQuality === "exact"
                  ? `${estimate.matchedName} 기준`
                  : estimate.matchQuality === "category"
                  ? `${estimate.matchedName} 평균 추정`
                  : "평균값 추정"}
              </Text>
            </View>
          </View>

          <View style={styles.kcalRow}>
            <Text style={styles.kcal}>{formatKcal(estimate.calories)}</Text>
            {price > 0 && <Text style={styles.previewPrice}>{formatWon(price)}</Text>}
          </View>

          <MacroBar carbs={estimate.carbs} protein={estimate.protein} fat={estimate.fat} />
        </View>

        <Pressable style={[styles.cta, !canContinue && styles.ctaOff]} onPress={goToHypnosis} disabled={!canContinue}>
          <Text style={styles.ctaText}>먹었다고 믿어보기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingTop: 8, paddingBottom: 40, gap: 22 },
  back: { color: COLORS.textDim, fontSize: 15, fontWeight: "600" },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.text, letterSpacing: -1.2, marginTop: 4 },

  field: { gap: 10 },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textDim, letterSpacing: -0.2 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.surfaceAlt },
  chipText: { fontSize: 13, color: COLORS.textDim, fontWeight: "600" },
  servingChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, backgroundColor: COLORS.surface },
  servingChipOn: { backgroundColor: COLORS.accent },
  servingText: { fontSize: 14, color: COLORS.textDim, fontWeight: "700", letterSpacing: -0.2 },
  servingTextOn: { color: COLORS.accentInk },

  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
  },
  priceInput: { flex: 1, paddingVertical: 15, fontSize: 22, fontWeight: "700", color: COLORS.text, letterSpacing: -0.8 },
  priceUnit: { fontSize: 16, color: COLORS.textDim, fontWeight: "700" },

  preview: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 20, gap: 16 },
  previewHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewEmoji: { fontSize: 30 },
  previewName: { fontSize: 16, fontWeight: "700", color: COLORS.text, letterSpacing: -0.4 },
  previewMatch: { fontSize: 12, color: COLORS.textFaint, marginTop: 3 },
  kcalRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  kcal: { fontSize: 38, fontWeight: "800", color: COLORS.heat, letterSpacing: -1.8 },
  previewPrice: { fontSize: 20, fontWeight: "800", color: COLORS.accent, letterSpacing: -0.8 },

  cta: { backgroundColor: COLORS.accent, borderRadius: RADIUS.sm, paddingVertical: 17, alignItems: "center" },
  ctaOff: { backgroundColor: COLORS.surfaceAlt },
  ctaText: { color: COLORS.accentInk, fontSize: 16, fontWeight: "800", letterSpacing: -0.4 },
});
