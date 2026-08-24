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
  const carbPct = (carbs / total) * 100;
  const proteinPct = (protein / total) * 100;
  const fatPct = (fat / total) * 100;

  return (
    <View>
      <View style={styles.bar}>
        <View style={[styles.segment, { width: `${carbPct}%`, backgroundColor: COLORS.carb }]} />
        <View style={[styles.segment, { width: `${proteinPct}%`, backgroundColor: COLORS.protein }]} />
        <View style={[styles.segment, { width: `${fatPct}%`, backgroundColor: COLORS.fat }]} />
      </View>
      <View style={styles.legendRow}>
        <LegendItem color={COLORS.carb} label={`탄수화물 ${carbs}g`} />
        <LegendItem color={COLORS.protein} label={`단백질 ${protein}g`} />
        <LegendItem color={COLORS.fat} label={`지방 ${fat}g`} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  segment: {
    height: "100%",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.subtext,
  },
});
