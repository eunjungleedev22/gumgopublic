import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { estimateNutrition } from "@/lib/estimate";
import { useCravings } from "@/context/CravingsContext";

const STEPS = [
  { text: "눈을 감고, 냄새를 떠올려보세요", duration: 1800 },
  { text: "한 입 크게 베어물어요", duration: 2000 },
  { text: "천천히... 씹어보세요", duration: 2000 },
  { text: "꿀꺽, 삼켰어요", duration: 1600 },
  { text: "배가 부르고 만족스러워요 😌", duration: 2200 },
];

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
        Animated.timing(scale, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
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
        Animated.sequence([
          Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
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
        }).then((entry) => {
          router.replace({ pathname: "/result", params: { id: entry.id } });
        });
      }
    }, STEPS[stepIndex].duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>{estimate.emoji}</Animated.Text>
        <Text style={styles.foodName}>{foodName}</Text>
        <Animated.Text style={[styles.stepText, { opacity: textOpacity }]}>{STEPS[stepIndex].text}</Animated.Text>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#191F28" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18, padding: 24 },
  emoji: { fontSize: 140 },
  foodName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  stepText: { fontSize: 17, color: "#C6CBD2", textAlign: "center", minHeight: 24 },
  dots: { flexDirection: "row", gap: 8, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3A4048" },
  dotActive: { backgroundColor: "#FF5A5F" },
});
