import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SHADOW } from "@/constants/colors";

type Props = {
  label: string;
  value: string;
  /** Rendered smaller and dimmer, right after the value (e.g. a unit). */
  unit?: string;
  accentColor?: string;
};

export function StatCard({ label, value, unit, accentColor = COLORS.text }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: accentColor }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 17,
    ...SHADOW.soft,
  },
  label: { fontSize: 12.5, fontWeight: "500", color: COLORS.textDim, letterSpacing: -0.2 },
  valueRow: { flexDirection: "row", alignItems: "baseline", marginTop: 7 },
  value: { fontSize: 21, fontWeight: "700", letterSpacing: -0.8 },
  unit: { fontSize: 14, fontWeight: "600", marginLeft: 2, letterSpacing: -0.3 },
});
