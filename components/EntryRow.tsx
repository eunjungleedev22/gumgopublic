import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { formatWon } from "@/lib/format";

type Props = {
  emoji: string;
  name: string;
  sub: string;
  price: number;
  /** Every row but the first draws a hairline, so the list reads as one block. */
  divided?: boolean;
};

export function EntryRow({ emoji, name, sub, price, divided }: Props) {
  return (
    <View style={[styles.row, divided && styles.divided]}>
      <View style={styles.chip}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <Text style={styles.price}>{formatWon(price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11 },
  divided: { borderTopWidth: 1, borderTopColor: COLORS.surfaceLine },
  chip: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: COLORS.text, letterSpacing: -0.3 },
  sub: { fontSize: 12, color: COLORS.textFaint, marginTop: 1 },
  price: { fontSize: 14, fontWeight: "700", color: COLORS.accent, letterSpacing: -0.3 },
});
