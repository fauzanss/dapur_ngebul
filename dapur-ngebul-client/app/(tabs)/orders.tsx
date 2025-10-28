import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, OrderDetail, OrderSummary } from '@/lib/api';

import { Colors, Brand } from '@/constants/theme';
const BRAND_PRIMARY = Brand.FireRed;
const BG_NEUTRAL = Brand.CoffeeBeige;

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const router = useRouter();

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

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [dateISO])
  );

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
            <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: '/(tabs)/order-detail', params: { id: String(item.id) } })}>
              <Text style={styles.itemTitle}>#{item.id} • {item.order_uuid}</Text>
              <Text style={styles.itemSub}>
                <Text style={{ color: statusColor(item.status) }}>{item.status}</Text>
                <Text> • {formatIDR(item.total_amount)}</Text>
              </Text>
              <Text style={styles.itemSub}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
        />
      )}
      {null}
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

function statusColor(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'PAID':
      return Brand.SuccessGreen;
    case 'DELIVERED':
      return Brand.BurntOrange;
    case 'CANCELLED':
      return '#999999';
    default:
      return Brand.FireRed;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_NEUTRAL },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: Brand.CharcoalBlack },
  refreshBtn: { backgroundColor: Brand.SalmonLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  refreshText: { color: '#fff', fontWeight: '700' },
  errorText: { color: BRAND_PRIMARY, textAlign: 'center', marginTop: 24 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  itemTitle: { fontWeight: '800', color: Brand.CharcoalBlack },
  itemSub: { color: Brand.WarmGold, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#222' },
  modalSub: { marginTop: 4, color: '#666' },
  submit: { backgroundColor: '#FF8C00', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, alignSelf: 'flex-end' },
  submitText: { color: '#fff', fontWeight: '800' },
});


