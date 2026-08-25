import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  carbs: number;
  protein: number;
  fat: number;
};

export function MacroBar({ carbs, protein, fat }: Props) {
  const total = Math.max(carbs + protein + fat, 1);

  return (
    <View>
      <View style={styles.bar}>
        <View style={[styles.segment, { flex: carbs / total, backgroundColor: COLORS.carb }]} />
        <View style={[styles.segment, { flex: protein / total, backgroundColor: COLORS.protein }]} />
        <View style={[styles.segment, { flex: fat / total, backgroundColor: COLORS.fat }]} />
      </View>
      <View style={styles.legendRow}>
        <LegendItem color={COLORS.carb} label="탄수" value={carbs} />
        <LegendItem color={COLORS.protein} label="단백" value={protein} />
        <LegendItem color={COLORS.fat} label="지방" value={fat} />
      </View>
    </View>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceLine,
    gap: 3,
  },
  segment: { height: "100%", borderRadius: 3 },
  legendRow: { flexDirection: "row", gap: 16, marginTop: 13 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendLabel: { fontSize: 12.5, color: COLORS.textDim, fontWeight: "600" },
  legendValue: { fontSize: 12.5, color: COLORS.text, fontWeight: "700", letterSpacing: -0.2 },
});
