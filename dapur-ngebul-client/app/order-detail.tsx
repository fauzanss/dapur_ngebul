import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, OrderDetail } from '@/lib/api';

const BRAND_PRIMARY = '#B22222';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await api.getOrderById(Number(id));
      setDetail(d);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat memuat detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status: 'CANCELLED' | 'DELIVERED' | 'PAID') => {
    try {
      const updated = await api.updateOrderStatus(Number(id), status);
      setDetail(updated);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengubah status');
    }
  };

  if (loading) return <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />;
  if (!detail) return <Text style={{ margin: 16 }}>Order tidak ditemukan</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{detail.id}</Text>
      {!!detail.customer_name && <Text style={styles.sub}>Customer: {detail.customer_name}</Text>}
      <Text style={styles.sub}>Status: {detail.status}</Text>
      <View style={{ marginTop: 12 }}>
        {detail.items?.map(it => (
          <View key={it.id} style={styles.itemRow}>
            <Text style={{ flex: 1 }}>{it.name} x{it.quantity}</Text>
            <Text>{formatIDR(it.price * it.quantity)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.totalRow}>
        <Text style={{ fontWeight: '800' }}>Total</Text>
        <Text style={{ fontWeight: '900', color: BRAND_PRIMARY }}>{formatIDR(detail.total_amount)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#999' }]} onPress={() => changeStatus('CANCELLED')}>
          <Text style={styles.btnText}>Cancelled</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF8C00' }]} onPress={() => changeStatus('DELIVERED')}>
          <Text style={styles.btnText}>Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: BRAND_PRIMARY }]} onPress={() => changeStatus('PAID')}>
          <Text style={styles.btnText}>Paid</Text>
        </TouchableOpacity>
      </View>
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
  container: { flex: 1, backgroundColor: '#F7F7F7', padding: 16 },
  title: { fontSize: 18, fontWeight: '900', color: '#222' },
  sub: { marginTop: 4, color: '#666' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, backgroundColor: '#fff', padding: 10, borderRadius: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
});


