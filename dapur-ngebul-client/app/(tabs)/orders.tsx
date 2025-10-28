import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, OrderSummary } from '@/lib/api';

const BRAND_PRIMARY = '#B22222';
const BG_NEUTRAL = '#F7F7F7';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const fetchOrders = async () => {
    try {
      setError(null);
      const data = await api.getOrders(dateISO);
      setOrders(data);
    } catch (e) {
      setError('Gagal memuat orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [dateISO]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders - {dateISO}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>#{item.id} • {item.order_uuid}</Text>
              <Text style={styles.itemSub}>{item.status} • {formatIDR(item.total_amount)}</Text>
              <Text style={styles.itemSub}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 12, gap: 10 }}
        />
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
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  itemTitle: { fontWeight: '800', color: '#222' },
  itemSub: { color: '#555', fontSize: 12 },
});


