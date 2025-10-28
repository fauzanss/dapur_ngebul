import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, SalesSummary } from '@/lib/api';

const BRAND_PRIMARY = '#B22222';
const BG_NEUTRAL = '#F7F7F7';

export default function SalesScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const fetchSales = async () => {
    try {
      setError(null);
      const data = await api.getSales(dateISO);
      setSummary(data);
    } catch (e) {
      setError('Gagal memuat ringkasan penjualan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSales();
  }, [dateISO]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales - {dateISO}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchSales}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.metricLabel}>Total Transaksi</Text>
          <Text style={styles.metricValue}>{summary?.count ?? 0}</Text>
          <View style={{ height: 12 }} />
          <Text style={styles.metricLabel}>Total Penjualan</Text>
          <Text style={[styles.metricValue, { color: BRAND_PRIMARY }]}>{formatIDR(summary?.total ?? 0)}</Text>
        </View>
      )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_NEUTRAL },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: '#222' },
  refreshBtn: { backgroundColor: '#eee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  refreshText: { color: '#333', fontWeight: '700' },
  errorText: { color: BRAND_PRIMARY, textAlign: 'center', marginTop: 24 },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  metricLabel: { color: '#666', fontSize: 12 },
  metricValue: { color: '#111', fontSize: 24, fontWeight: '900' },
});


