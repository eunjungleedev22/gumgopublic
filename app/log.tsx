import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
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
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>참을 음식을 기록해요</Text>

        <View style={styles.field}>
          <Text style={styles.label}>음식 이름</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 후라이드치킨"
            placeholderTextColor={COLORS.subtext}
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
          <Text style={styles.label}>양 (1인분 기준)</Text>
          <View style={styles.chipRow}>
            {SERVING_STEPS.map((s) => (
              <Pressable
                key={s}
                style={[styles.servingChip, servings === s && styles.servingChipActive]}
                onPress={() => setServings(s)}
              >
                <Text style={[styles.servingChipText, servings === s && styles.servingChipTextActive]}>{s}인분</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>가격 (원)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 18000"
            placeholderTextColor={COLORS.subtext}
            keyboardType="number-pad"
            value={priceText}
            onChangeText={setPriceText}
          />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewEmoji}>{estimate.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{foodName.trim() || "음식을 입력해보세요"}</Text>
              <Text style={styles.previewMatch}>
                {estimate.matchQuality === "exact"
                  ? `"${estimate.matchedName}" 데이터 기준`
                  : estimate.matchQuality === "category"
                  ? `"${estimate.matchedName}" 평균으로 추정`
                  : "정확한 매칭이 없어 평균값으로 추정"}
              </Text>
            </View>
          </View>
          <Text style={styles.previewCalories}>{formatKcal(estimate.calories)}</Text>
          <MacroBar carbs={estimate.carbs} protein={estimate.protein} fat={estimate.fat} />
          {price > 0 && <Text style={styles.previewPrice}>{formatWon(price)}을 아낄 수 있어요</Text>}
        </View>

        <Pressable style={[styles.cta, !canContinue && styles.ctaDisabled]} onPress={goToHypnosis} disabled={!canContinue}>
          <Text style={styles.ctaText}>이미 먹었다고 믿어볼게요 🌀</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40, gap: 16 },
  back: { color: COLORS.subtext, fontSize: 14, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 13, color: COLORS.text },
  servingChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  servingChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  servingChipText: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  servingChipTextActive: { color: "#fff" },
  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  previewEmoji: { fontSize: 36 },
  previewTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  previewMatch: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  previewCalories: { fontSize: 26, fontWeight: "800", color: COLORS.primary },
  previewPrice: { fontSize: 14, color: COLORS.success, fontWeight: "700" },
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
