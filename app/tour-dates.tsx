import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadSiteData, sortEvents, formatDateDisplay } from '@/constants/site-data';

export default function TourDatesScreen() {
  const data = loadSiteData();
  const { upcoming, history } = sortEvents(data.events ?? []);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tour Dates</Text>

      <Text style={styles.sectionTitle}>Upcoming</Text>
      {upcoming.length === 0 ? (
        <Text style={styles.body}>예정된 일정이 없습니다.</Text>
      ) : (
        upcoming.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.date}>{formatDateDisplay(e.date)}</Text>
            <Text style={styles.headline}>{(e.title || e.location).toUpperCase()}</Text>
            {!!e.location && <Text style={styles.meta}>{e.location}</Text>}
            {!!e.link && <Text style={styles.link}>{e.link}</Text>}
            {e.isSoldOut && <Text style={styles.soldout}>SOLD OUT</Text>}
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>History</Text>
      {history.length === 0 ? (
        <Text style={styles.body}>지난 일정이 없습니다.</Text>
      ) : (
        history.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.date}>{formatDateDisplay(e.date)}</Text>
            <Text style={styles.headline}>{(e.title || e.location).toUpperCase()}</Text>
            {!!e.location && <Text style={styles.meta}>{e.location}</Text>}
            {!!e.link && <Text style={styles.link}>{e.link}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 10,
  },
  body: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  date: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    letterSpacing: 1.6,
  },
  headline: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  meta: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
  },
  link: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  soldout: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.75,
  },
});
