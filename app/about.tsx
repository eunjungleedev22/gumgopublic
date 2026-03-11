import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.body}>
        GUMGO의 소개, 장르, 연락처/에이전시, SNS 링크 등을 여기에 넣어주세요.
      </Text>
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
