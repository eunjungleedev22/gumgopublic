import { StyleSheet, Text, View } from 'react-native';

export default function LatestMixScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Latest Mix</Text>
      <Text style={styles.body}>여기에 최신 믹스 링크(예: SoundCloud / Mixcloud)를 넣어주세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  body: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
  },
});
