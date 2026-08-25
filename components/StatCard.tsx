import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "@/constants/colors";

type Props = {
  label: string;
  value: string;
  /** Rendered smaller and dimmer, right after the value (e.g. a unit). */
  unit?: string;
  accentColor?: string;
  /** Fills the block with the accent colour — use for the single most important stat. */
  filled?: boolean;
};

export function StatCard({ label, value, unit, accentColor = COLORS.text, filled }: Props) {
  const valueColor = filled ? COLORS.accentInk : accentColor;
  const labelColor = filled ? "rgba(11,12,14,.62)" : COLORS.textDim;

  return (
    <View style={[styles.card, filled && styles.cardFilled]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: valueColor }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
  cardFilled: { backgroundColor: COLORS.accent },
  label: { fontSize: 13, fontWeight: "600", letterSpacing: -0.2 },
  valueRow: { flexDirection: "row", alignItems: "baseline", marginTop: 10 },
  value: { fontSize: 28, fontWeight: "800", letterSpacing: -1.2 },
  unit: { fontSize: 15, fontWeight: "700", marginLeft: 2, letterSpacing: -0.3 },
});
