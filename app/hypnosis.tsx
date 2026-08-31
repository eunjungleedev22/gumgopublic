import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { estimateNutrition } from "@/lib/estimate";
import { useCravings } from "@/context/CravingsContext";

const STEPS = [
  { text: "눈을 감고, 냄새를 떠올려보세요", duration: 1800 },
  { text: "한 입 크게 베어물어요", duration: 2000 },
  { text: "천천히 씹어보세요", duration: 2000 },
  { text: "꿀꺽, 삼켰어요", duration: 1600 },
  { text: "배가 부르고 만족스러워요", duration: 2200 },
];

const RINGS = [430, 320, 215];

function safeHaptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
}

export default function HypnosisScreen() {
  const router = useRouter();
  const { addEntry } = useCravings();
  const params = useLocalSearchParams<{ foodName: string; servings: string; price: string }>();
  const [stepIndex, setStepIndex] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const savedRef = useRef(false);

  const foodName = params.foodName ?? "그 음식";
  const servings = Number(params.servings) || 1;
  const price = Number(params.price) || 0;
  const estimate = useMemo(() => estimateNutrition(foodName, servings), [foodName, servings]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.14, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale]);

  useEffect(() => {
    safeHaptic();
    const timer = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          setStepIndex((i) => i + 1);
          Animated.timing(textOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        });
      } else if (!savedRef.current) {
        savedRef.current = true;
        addEntry({
          foodName,
          servings,
          price,
          calories: estimate.calories,
          carbs: estimate.carbs,
          protein: estimate.protein,
          fat: estimate.fat,
          matchQuality: estimate.matchQuality,
          matchedName: estimate.matchedName,
          emoji: estimate.emoji,
        }).then((entry) => router.replace({ pathname: "/result", params: { id: entry.id } }));
      }
    }, STEPS[stepIndex].duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  return (
    /* The only screen that changes ground colour and drops every card: the shift
       from butter to peach is itself the signal that you are "eating" now. */
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.rings} pointerEvents="none">
          {RINGS.map((size) => (
            <View key={size} style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]} />
          ))}
          <View style={styles.disc} />
        </View>

        <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>{estimate.emoji}</Animated.Text>
        <Text style={styles.foodName}>{foodName}</Text>
        <Animated.Text style={[styles.stepText, { opacity: textOpacity }]}>
          {STEPS[stepIndex].text}
        </Animated.Text>
      </View>

      {/* Segmented progress reads as a timeline rather than decorative dots. */}
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.segment, i <= stepIndex && styles.segmentOn]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.trance },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },

  rings: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1.5, borderColor: COLORS.tranceRing },
  disc: { position: "absolute", width: 230, height: 230, borderRadius: 115, backgroundColor: COLORS.tranceDeep },

  emoji: { fontSize: 122 },
  foodName: { fontSize: 14.5, fontWeight: "600", color: COLORS.textDim, letterSpacing: -0.3, marginTop: 26 },
  stepText: {
    fontSize: 25,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 34,
    minHeight: 34,
  },

  progress: { flexDirection: "row", gap: 6, paddingHorizontal: 24, paddingBottom: 32 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.tranceRing },
  segmentOn: { backgroundColor: COLORS.accent },
});
