import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '@/constants/config';
import { Colors, Brand } from '@/constants/theme';

const BRAND_PRIMARY = Brand.FireRed;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400); // nothing dynamic yet
  };
  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Pengaturan</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Server API</Text>
        <TextInput
          value={API_BASE}
          editable={false}
          style={styles.input}
        />
        <Text style={styles.help}>Konfigurasi lewat constants/config.ts</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.CoffeeBeige, padding: 16 },
  title: { fontSize: 18, fontWeight: '900', color: Brand.CharcoalBlack },
  card: { backgroundColor: '#fff', marginTop: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  label: { color: Brand.WarmGold, fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  help: { marginTop: 8, color: BRAND_PRIMARY, fontSize: 12 },
});


