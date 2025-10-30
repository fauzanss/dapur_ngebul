import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Pressable, Platform } from 'react-native';
import { ConnectionError } from '@/components/connection-error';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, OrderDetail, OrderSummary } from '@/lib/api';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors, Brand } from '@/constants/theme';
const BRAND_PRIMARY = Brand.FireRed;
const BG_NEUTRAL = Brand.CoffeeBeige;

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateISO, setTempDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setError(null);
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const data = await api.getOrders(dateISO, status);
      setOrders(data);
    } catch (e) {
      setError('📶 Gagal memuat orders. Periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const statusOptions = [
    { value: 'ALL', label: 'Semua Status' },
    { value: 'COOKING', label: 'Cooking' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Semua Status';
  };

  const getDateLabel = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'COOKING':
        return '👨‍🍳';
      case 'DELIVERED':
        return '🚚';
      case 'PAID':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.containerWeb, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            console.log('Filter button pressed!');
            setShowFilterModal(true);
          }}
        >
          <Text style={styles.filterButtonText}>🔍 Filter Orders</Text>
        </TouchableOpacity>

        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            📅 {getDateLabel(dateISO)}
          </Text>
          <Text style={styles.filterInfoText}>
            📊 {getStatusLabel(selectedStatus)}
          </Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />
      ) : error ? (
        <ConnectionError message={error} onRetry={fetchOrders} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.item, { borderLeftColor: statusColor(item.status), borderLeftWidth: 4 }]} onPress={() => router.push({ pathname: '/(tabs)/order-detail', params: { id: String(item.id) } })}>
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleContainer}>
                  <Text style={styles.itemTitle}>#{item.id}</Text>
                  <Text style={styles.itemUuid}>{item.order_uuid}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                  <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemAmount}>{formatIDR(item.total_amount)}</Text>
                  <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleString('id-ID')}</Text>
                </View>
                {item.customer_name && (
                  <Text style={styles.customerName}>👤 {item.customer_name}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
        />
      )}

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={[styles.modalOverlay, Platform.OS === 'web' && styles.modalOverlayWeb]}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={[styles.modalContent, Platform.OS === 'web' && styles.modalContentWeb]}>
            <Text style={styles.modalTitle}>Filter Orders</Text>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Tanggal Order</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setTempDateISO(dateISO);
                  setShowFilterModal(false);
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateButtonText}>{getDateLabel(dateISO)}</Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status Order</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      selectedStatus === option.value && styles.statusOptionActive
                    ]}
                    onPress={() => setSelectedStatus(option.value)}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      selectedStatus === option.value && styles.statusOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilterModal(false);
                  fetchOrders();
                }}
              >
                <Text style={styles.applyButtonText}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <Pressable
              style={styles.datePickerBackdrop}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={[styles.datePickerContent, Platform.OS === 'web' && styles.datePickerContentWeb]}>
              <Text style={styles.datePickerTitle}>Pilih Tanggal Order</Text>
              {Platform.OS === 'web' ? (
                // @ts-ignore - using native input for web environment
                <input
                  type="date"
                  value={tempDateISO}
                  onChange={(e: any) => {
                    const v = e?.target?.value;
                    if (v) setTempDateISO(v);
                  }}
                  style={{
                    width: '100%',
                    fontSize: 16,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #e0e0e0',
                  }}
                />
              ) : (
                <DateTimePicker
                  value={new Date(tempDateISO)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      setTempDateISO(selectedDate.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerCancel}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePickerConfirm}
                  onPress={() => {
                    setDateISO(tempDateISO);
                    setShowDatePicker(false);
                    setShowFilterModal(true);
                  }}
                >
                  <Text style={styles.datePickerConfirmText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  containerWeb: { marginHorizontal: 12, marginTop: 12, marginBottom: 12 },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  title: { fontSize: 16, fontWeight: '800', color: Brand.CharcoalBlack },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: Brand.WarmGold,
  },
  filterButton: {
    backgroundColor: Brand.FireRed,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: Brand.FireRed,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  filterInfo: {
    gap: 4,
  },
  filterInfoText: {
    fontSize: 12,
    color: Brand.WarmGold,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayWeb: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalContentWeb: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 430,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.CharcoalBlack,
    marginBottom: 20,
    textAlign: 'center',
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.CharcoalBlack,
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: Brand.CharcoalBlack,
    flex: 1,
  },
  dateButtonIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  statusOptions: {
    gap: 8,
  },
  statusOption: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusOptionActive: {
    backgroundColor: BRAND_PRIMARY,
    borderColor: BRAND_PRIMARY,
  },
  statusOptionText: {
    fontSize: 14,
    color: Brand.CharcoalBlack,
    textAlign: 'center',
  },
  statusOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: Brand.BurntOrange,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.BurntOrange,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: { color: BRAND_PRIMARY, textAlign: 'center', marginTop: 24 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginHorizontal: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '800',
    color: Brand.CharcoalBlack,
    fontSize: 16,
    marginBottom: 2,
  },
  itemUuid: {
    color: Brand.WarmGold,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemContent: {
    gap: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND_PRIMARY,
  },
  itemDate: {
    fontSize: 11,
    color: Brand.WarmGold,
  },
  customerName: {
    fontSize: 12,
    color: Brand.CharcoalBlack,
    fontWeight: '500',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 300,
    alignItems: 'center',
  },
  datePickerContentWeb: {
    width: '90%',
    maxWidth: 430,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.CharcoalBlack,
    marginBottom: 20,
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  datePickerCancel: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  datePickerCancelText: {
    color: Brand.CharcoalBlack,
    fontWeight: '600',
    fontSize: 14,
  },
  datePickerConfirm: {
    backgroundColor: BRAND_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  datePickerConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});


