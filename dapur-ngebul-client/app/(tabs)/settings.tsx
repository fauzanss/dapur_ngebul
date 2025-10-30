import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, Platform, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApiBase, setApiBase } from '@/lib/settings';
import { Colors, Brand } from '@/constants/theme';

const BRAND_PRIMARY = Brand.FireRed;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const [apiBase, setApiBaseState] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400); // nothing dynamic yet
  };
  React.useEffect(() => {
    (async () => {
      const current = await getApiBase();
      setApiBaseState(current);
    })();
  }, []);

  const onSave = async () => {
    const trimmed = (apiBase || '').trim();
    if (!/^https?:\/\//.test(trimmed)) {
      Alert.alert('Format salah', 'Isi dengan URL lengkap, contoh: http://localhost:3001');
      return;
    }
    try {
      setSaving(true);
      await setApiBase(trimmed);
      Alert.alert('Tersimpan', 'Base URL API telah diperbarui.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <ScrollView
      style={[styles.container, Platform.OS === 'web' && styles.containerWeb, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Pengaturan</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Server API</Text>
        <TextInput
          value={apiBase}
          onChangeText={setApiBaseState}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://localhost:3001"
        />
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onSave} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.help}>Perubahan berlaku langsung. Simpan URL lengkap (http/https).</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.CoffeeBeige, padding: 16 },
  containerWeb: { marginHorizontal: 12, marginTop: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '900', color: Brand.CharcoalBlack },
  card: { backgroundColor: '#fff', marginTop: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  label: { color: Brand.WarmGold, fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: Brand.FireRed },
  buttonText: { color: '#fff', fontWeight: '800' },
  help: { marginTop: 8, color: BRAND_PRIMARY, fontSize: 12 },
});


