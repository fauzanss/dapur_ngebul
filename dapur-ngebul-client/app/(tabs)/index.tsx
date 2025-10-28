import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { api } from '@/lib/api';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mtdTotal, setMtdTotal] = useState<number>(0);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setLoading(true);
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        let cursor = new Date(first);
        let sum = 0;
        // naive MTD: call daily sales and sum
        while (cursor <= now) {
          const dateISO = cursor.toISOString().slice(0, 10);
          const s = await api.getSales(dateISO);
          sum += Number(s?.total ?? 0);
          cursor.setDate(cursor.getDate() + 1);
        }
        setMtdTotal(sum);
      } catch (e) {
        setError('Gagal memuat total penjualan bulan ini.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const body = useMemo(() => {
    if (loading) return <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />;
    if (error) return <Text style={styles.errorText}>{error}</Text>;
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Total Penjualan Bulan Ini</Text>
        <Text style={styles.value}>{formatIDR(mtdTotal)}</Text>
      </View>
    );
  }, [loading, error, mtdTotal]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.welcome}>Selamat datang di Dapur Ngebul</Text>
      {body}
    </View>
  );
}

function formatIDR(n: number) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
  }
}

const BRAND_PRIMARY = '#B22222';
const BG_NEUTRAL = '#F7F7F7';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_NEUTRAL, padding: 16 },
  welcome: { fontSize: 18, fontWeight: '900', color: '#222' },
  errorText: { color: BRAND_PRIMARY, marginTop: 24 },
  card: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: { color: '#666', fontSize: 12 },
  value: { color: BRAND_PRIMARY, fontSize: 28, fontWeight: '900', marginTop: 4 },
});
