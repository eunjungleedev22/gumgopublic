import { StyleSheet, Text, View } from 'react-native';

export default function TourDatesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Tour Dates</Text>
      <Text style={styles.body}>공연 일정 리스트를 여기에 추가하세요.</Text>
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
