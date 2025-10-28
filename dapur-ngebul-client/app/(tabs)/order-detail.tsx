import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, OrderDetail } from '@/lib/api';
import { Brand } from '@/constants/theme';

const BRAND_PRIMARY = Brand.FireRed;
const ACCENT = Brand.BurntOrange;
const BG = Brand.CoffeeBeige;

export default function OrderDetailTabScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
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
      if (!id) return;
      const updated = await api.updateOrderStatus(Number(id), status);
      setDetail(updated);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengubah status');
    }
  };

  const printReceipt = () => {
    if (!detail) return;

    const receiptData = {
      orderId: detail.id,
      orderUuid: detail.order_uuid,
      customerName: detail.customer_name || 'Walk-in Customer',
      status: detail.status,
      items: detail.items || [],
      totalAmount: detail.total_amount,
      createdAt: new Date(detail.created_at).toLocaleString('id-ID'),
    };

    // For now, show receipt in alert. In production, this would send to thermal printer
    const receiptText = generateReceiptText(receiptData);
    Alert.alert('Struk Order', receiptText, [
      { text: 'Tutup', style: 'cancel' },
      {
        text: 'Print', onPress: () => {
          // TODO: Implement actual thermal printing
          Alert.alert('Info', 'Fitur print ke printer termal akan segera tersedia');
        }
      }
    ], {
      cancelable: true,
      userInterfaceStyle: 'light' // Force light mode for better text readability
    });
  };

  if (loading) return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />
    </View>
  );

  if (!detail) return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={{ margin: 16 }}>Order tidak ditemukan</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <View style={[styles.card, { backgroundColor: getStatusBackgroundColor(detail.status) }]}>
        <Text style={styles.title}>Order #{detail.id}</Text>
        <Text style={styles.orderUuid}>{detail.order_uuid}</Text>
        {!!detail.customer_name && <Text style={styles.sub}>Customer: {detail.customer_name}</Text>}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValue, { color: statusColor(detail.status) }]}>{detail.status}</Text>
        </View>
        {detail.status === 'CANCELLED' && (
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledText}>❌ ORDER DIBATALKAN</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Item</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Item</Text>
            <Text style={styles.tableHeaderText}>Qty</Text>
            <Text style={styles.tableHeaderText}>Harga</Text>
            <Text style={styles.tableHeaderText}>Total</Text>
          </View>
          {detail.items?.map(it => (
            <View key={it.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{it.name}</Text>
              <Text style={styles.tableCell}>{it.quantity}</Text>
              <Text style={styles.tableCell}>{formatIDR(it.price)}</Text>
              <Text style={styles.tableCell}>{formatIDR(it.price * it.quantity)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalRow}>
          <Text style={{ fontWeight: '800' }}>Total</Text>
          <Text style={{ fontWeight: '900', color: BRAND_PRIMARY }}>{formatIDR(detail.total_amount)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ubah Status</Text>
        <View style={styles.statusButtonRow}>
          <TouchableOpacity style={[styles.statusBtn, { borderColor: '#999' }]} onPress={() => changeStatus('CANCELLED')}>
            <Text style={styles.statusIcon}>❌</Text>
            <Text style={[styles.statusText, { color: '#555' }]}>Cancelled</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statusBtn, { borderColor: ACCENT }]} onPress={() => changeStatus('DELIVERED')}>
            <Text style={styles.statusIcon}>🚚</Text>
            <Text style={[styles.statusText, { color: ACCENT }]}>Delivered</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statusBtn, { borderColor: Brand.SuccessGreen }]} onPress={() => changeStatus('PAID')}>
            <Text style={styles.statusIcon}>✅</Text>
            <Text style={[styles.statusText, { color: Brand.SuccessGreen }]}>Paid</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.info}>Catatan: Hanya order berstatus PAID yang dihitung ke penjualan.</Text>
      </View>

      {(detail.status === 'DELIVERED' || detail.status === 'PAID') && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cetak Struk</Text>
          <TouchableOpacity style={styles.printBtn} onPress={printReceipt}>
            <Text style={styles.printBtnText}>🖨️ Cetak Struk</Text>
          </TouchableOpacity>
          <Text style={styles.info}>Struk akan dicetak ke printer termal yang terhubung</Text>
        </View>
      )}
    </ScrollView>
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

function getStatusBackgroundColor(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'PAID':
      return '#f0f9f0'; // Light green background
    case 'DELIVERED':
      return '#fff4e6'; // Light orange background
    case 'CANCELLED':
      return '#ffe6e6'; // Light red background
    default:
      return '#fff'; // Default white background
  }
}

function generateReceiptText(data: any) {
  const header = 'DAPUR NGEBUL\n';
  const separator = '========================\n';
  const orderInfo = `Order #${data.orderId}\n${data.orderUuid}\nCustomer: ${data.customerName}\nStatus: ${data.status}\nTanggal: ${data.createdAt}\n\n`;

  // Table header - using fixed width columns for proper alignment
  let items = 'ITEM:\n';
  items += '======================\n';
  items += 'Item'.padEnd(16) + 'Qty'.padStart(3) + 'Harga'.padStart(8) + 'Total'.padStart(10) + '\n';
  items += '======================\n';

  // Table rows - using fixed width columns for proper alignment
  data.items.forEach((item: any) => {
    const itemName = item.name.length > 14 ? item.name.substring(0, 12) + '..' : item.name;
    const qty = item.quantity.toString();
    const price = formatIDR(item.price);
    const total = formatIDR(item.price * item.quantity);

    // Fixed width columns: Item(16) + Qty(3) + Harga(8) + Total(10) = 37 chars total
    items += itemName.padEnd(16) + qty.padStart(3) + price.padStart(8) + total.padStart(10) + '\n';
  });

  const total = `\n======================\nTOTAL: ${formatIDR(data.totalAmount).padStart(25)}\n======================\n`;
  const footer = '\nTerima kasih atas kunjungannya!\n';
  const watermark = '\n\n      DAPUR NGEBUL\n   Order Management System\n';

  return header + separator + orderInfo + items + total + separator + footer + watermark;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  title: { fontSize: 18, fontWeight: '900', color: '#222' },
  orderUuid: { fontSize: 12, color: '#999', marginTop: 2, textAlign: 'center' },
  sub: { marginTop: 6, color: '#666' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '800'
  },
  cancelledBadge: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center'
  },
  cancelledText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12
  },
  sectionTitle: { fontWeight: '800', color: '#222', marginBottom: 8 },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6 },
  tableHeaderText: { flex: 1, fontWeight: '700', color: '#333', textAlign: 'center', fontSize: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableCell: { flex: 1, color: '#333', textAlign: 'center', fontSize: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' },
  statusButtonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  statusBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  statusIcon: {
    fontSize: 16
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12
  },
  info: { marginTop: 10, fontSize: 12, color: '#666' },
  printBtn: { backgroundColor: Brand.FireRed, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  printBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});


