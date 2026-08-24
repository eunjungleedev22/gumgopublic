import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  label: string;
  value: string;
  accentColor?: string;
  emoji?: string;
};

export function StatCard({ label, value, accentColor = COLORS.primary, emoji }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: COLORS.subtext,
    fontWeight: "600",
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
  },
});
