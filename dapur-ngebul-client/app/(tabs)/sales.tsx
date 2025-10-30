import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Alert, TextInput, Platform } from 'react-native';
import { ConnectionError } from '@/components/connection-error';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, SalesSummary } from '@/lib/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors, Brand } from '@/constants/theme';
const BRAND_PRIMARY = Brand.FireRed;
const BG_NEUTRAL = Brand.CoffeeBeige;

export default function SalesScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [dateISO, setDateISO] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [customCosts, setCustomCosts] = useState<string>('');
  const [financialData, setFinancialData] = useState<{
    revenue: number;
    costs: number;
    profit: number;
    profitMargin: number;
    period: string;
  } | null>(null);

  const fetchSales = async () => {
    try {
      setError(null);
      const data = await api.getSales(dateISO);
      setSummary(data);

      // Calculate financial data for single day
      const revenue = data.totalAmount || 0;
      const costs = revenue * 0.6; // Default 60% cost of goods sold
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      setFinancialData({
        revenue,
        costs,
        profit,
        profitMargin,
        period: dateISO
      });
    } catch (e) {
      setError('📶 Gagal memuat ringkasan penjualan. Periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesRange = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch sales data for the range
      const startDateStr = startDate.toISOString().slice(0, 10);
      const endDateStr = endDate.toISOString().slice(0, 10);

      // Use the new range API endpoint
      const data = await api.getSalesRange(startDateStr, endDateStr);

      const revenue = data.total || 0;
      const costs = customCosts ? parseFloat(customCosts) : revenue * 0.6;
      const profit = revenue - costs;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      setFinancialData({
        revenue,
        costs,
        profit,
        profitMargin,
        period: `${startDateStr} - ${endDateStr}`
      });

    } catch (e) {
      setError('📶 Gagal memuat laporan keuangan. Periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSales();
  }, [dateISO]);

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, [dateISO])
  );

  const exportToExcel = async () => {
    if (!summary || !financialData) return;

    try {
      const csvContent = `Periode,Total Penjualan,Total Order,Biaya Operasional,Keuntungan,Margin Keuntungan
${financialData.period},${summary.totalAmount},${summary.totalOrders},${financialData.costs},${financialData.profit},${financialData.profitMargin.toFixed(2)}%`;

      const fileName = `laporan_keuangan_${financialData.period.replace(' - ', '_to_')}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Laporan Keuangan',
        });
      } else {
        if (Platform.OS === 'web') {
          try {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch (e) {
            Alert.alert('Error', 'Gagal mengunduh file di web');
          }
        } else {
          Alert.alert('Error', 'Sharing tidak tersedia di perangkat ini');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengexport data');
    }
  };

  return (
    <ScrollView
      style={[styles.container, Platform.OS === 'web' && styles.containerWeb, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSales} />}
    >
      {error && (
        <ConnectionError message={error} onRetry={fetchSales} />
      )}
      {!error && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>📊 Laporan Keuangan</Text>
          </View>

          <View style={styles.periodInfo}>
            <Text style={styles.periodText}>Periode: {financialData?.period || 'Belum dipilih'}</Text>
          </View>

          <View style={styles.rangeSection}>
            <Text style={styles.sectionTitle}>📅 Pilih Periode Laporan</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>📅 Tanggal Mulai</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {startDate.toLocaleDateString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  Platform.OS === 'web' ? (
                    // @ts-ignore - using native input for web environment
                    <input
                      type="date"
                      value={startDate.toISOString().slice(0, 10)}
                      onChange={(e: any) => {
                        const v = e?.target?.value;
                        setShowStartDatePicker(false);
                        if (v) {
                          const selectedDate = new Date(v);
                          setStartDate(selectedDate);
                          if (endDate < selectedDate) {
                            setEndDate(selectedDate);
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        fontSize: 16,
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        marginTop: 8,
                      }}
                    />
                  ) : (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) {
                          setStartDate(selectedDate);
                          // Auto-set end date if it's before start date
                          if (endDate < selectedDate) {
                            setEndDate(selectedDate);
                          }
                        }
                      }}
                    />
                  )
                )}
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>📅 Tanggal Akhir</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {endDate.toLocaleDateString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  Platform.OS === 'web' ? (
                    // @ts-ignore - using native input for web environment
                    <input
                      type="date"
                      value={endDate.toISOString().slice(0, 10)}
                      min={startDate.toISOString().slice(0, 10)}
                      onChange={(e: any) => {
                        const v = e?.target?.value;
                        setShowEndDatePicker(false);
                        if (v) {
                          const selectedDate = new Date(v);
                          setEndDate(selectedDate);
                        }
                      }}
                      style={{
                        width: '100%',
                        fontSize: 16,
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        marginTop: 8,
                      }}
                    />
                  ) : (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      minimumDate={startDate}
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                      }}
                    />
                  )
                )}
              </View>
            </View>

            <View style={styles.costInputContainer}>
              <Text style={styles.costLabel}>💰 Total Modal/Biaya (Opsional)</Text>
              <View style={styles.costInputWrapper}>
                <Text style={styles.currencySymbol}>Rp</Text>
                <TextInput
                  style={styles.costInput}
                  value={customCosts}
                  onChangeText={setCustomCosts}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.costHint}>
                💡 Kosongkan untuk menggunakan 60% dari penjualan sebagai estimasi
              </Text>
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={fetchSalesRange}>
              <Text style={styles.generateBtnText}>📊 Generate Laporan</Text>
              <Text style={styles.generateBtnSubtext}>Hitung keuntungan berdasarkan periode</Text>
            </TouchableOpacity>
          </View>

          {financialData && (
            <View style={styles.financialSection}>
              <Text style={styles.sectionTitle}>📊 Hasil Analisis Keuangan</Text>

              <View style={styles.financialGrid}>
                <View style={[styles.financialCard, styles.revenueCard]}>
                  <View style={styles.financialIconContainer}>
                    <Text style={styles.financialIcon}>💰</Text>
                  </View>
                  <View style={styles.financialContent}>
                    <Text style={styles.financialLabel}>Total Penjualan</Text>
                    <Text style={styles.financialValue}>{formatIDR(financialData.revenue)}</Text>
                    <Text style={styles.financialSubtext}>Pendapatan kotor</Text>
                  </View>
                </View>

                <View style={[styles.financialCard, styles.costCard]}>
                  <View style={styles.financialIconContainer}>
                    <Text style={styles.financialIcon}>💸</Text>
                  </View>
                  <View style={styles.financialContent}>
                    <Text style={styles.financialLabel}>Biaya Operasional</Text>
                    <Text style={styles.financialValue}>{formatIDR(financialData.costs)}</Text>
                    <Text style={styles.financialSubtext}>Modal & biaya</Text>
                  </View>
                </View>

                <View style={[styles.financialCard, styles.profitCard, {
                  backgroundColor: financialData.profit >= 0 ? Brand.SuccessGreen + '15' : Brand.FireRed + '15',
                  borderColor: financialData.profit >= 0 ? Brand.SuccessGreen : Brand.FireRed
                }]}>
                  <View style={styles.financialIconContainer}>
                    <Text style={styles.financialIcon}>📈</Text>
                  </View>
                  <View style={styles.financialContent}>
                    <Text style={styles.financialLabel}>Keuntungan Bersih</Text>
                    <Text style={[styles.financialValue, { color: financialData.profit >= 0 ? Brand.SuccessGreen : Brand.FireRed }]}>
                      {formatIDR(financialData.profit)}
                    </Text>
                    <Text style={styles.financialSubtext}>
                      {financialData.profit >= 0 ? 'Untung' : 'Rugi'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.financialCard, styles.marginCard, {
                  backgroundColor: financialData.profitMargin >= 0 ? Brand.SuccessGreen + '15' : Brand.FireRed + '15',
                  borderColor: financialData.profitMargin >= 0 ? Brand.SuccessGreen : Brand.FireRed
                }]}>
                  <View style={styles.financialIconContainer}>
                    <Text style={styles.financialIcon}>📊</Text>
                  </View>
                  <View style={styles.financialContent}>
                    <Text style={styles.financialLabel}>Margin Keuntungan</Text>
                    <Text style={[styles.financialValue, { color: financialData.profitMargin >= 0 ? Brand.SuccessGreen : Brand.FireRed }]}>
                      {financialData.profitMargin.toFixed(2)}%
                    </Text>
                    <Text style={styles.financialSubtext}>
                      {financialData.profitMargin >= 0 ? 'Efisien' : 'Perlu evaluasi'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {financialData && (
            <View style={styles.exportSection}>
              <TouchableOpacity style={styles.exportBtn} onPress={exportToExcel}>
                <Text style={styles.exportBtnText}>📤 Export ke Excel</Text>
                <Text style={styles.exportBtnSubtext}>Download laporan lengkap</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_NEUTRAL },
  containerWeb: { marginHorizontal: 12, marginTop: 12, marginBottom: 12 },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', marginBottom: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  title: { fontSize: 20, fontWeight: '900', color: Brand.CharcoalBlack, textAlign: 'center' },
  errorText: { color: BRAND_PRIMARY, textAlign: 'center', marginTop: 24 },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  metricLabel: { color: Brand.WarmGold, fontSize: 12 },
  metricValue: { color: Brand.CharcoalBlack, fontSize: 24, fontWeight: '900' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Brand.CharcoalBlack,
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '700',
  },
  financialSection: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  financialGrid: {
    gap: 16,
  },
  financialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  financialIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Brand.CoffeeBeige + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  financialIcon: {
    fontSize: 24,
  },
  financialContent: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.CharcoalBlack,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Brand.CharcoalBlack,
    marginBottom: 2,
  },
  financialSubtext: {
    fontSize: 12,
    color: Brand.WarmGold,
    fontWeight: '500',
  },
  revenueCard: {
    borderColor: Brand.SuccessGreen,
  },
  costCard: {
    borderColor: Brand.WarmGold,
  },
  profitCard: {
    borderColor: Brand.SuccessGreen,
  },
  marginCard: {
    borderColor: Brand.FireRed,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    backgroundColor: Brand.SuccessGreen,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Brand.SuccessGreen,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  exportBtnSubtext: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    opacity: 0.9,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#999',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  periodInfo: {
    backgroundColor: Brand.CoffeeBeige + '50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.CharcoalBlack,
    textAlign: 'center',
  },
  rangeSection: {
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.CharcoalBlack,
    marginBottom: 20,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.CharcoalBlack,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: Brand.WarmGold,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Brand.WarmGold,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dateInputText: {
    fontSize: 14,
    color: Brand.CharcoalBlack,
    fontWeight: '600',
    flex: 1,
  },
  dateIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  costInputContainer: {
    marginBottom: 20,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.CharcoalBlack,
    marginBottom: 8,
  },
  costInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Brand.WarmGold,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: Brand.WarmGold,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.CharcoalBlack,
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 16,
    color: Brand.CharcoalBlack,
    fontWeight: '600',
    paddingVertical: 12,
  },
  costHint: {
    fontSize: 12,
    color: Brand.WarmGold,
    marginTop: 8,
    fontStyle: 'italic',
  },
  generateBtn: {
    backgroundColor: Brand.FireRed,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Brand.FireRed,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  generateBtnSubtext: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    opacity: 0.9,
  },
  exportSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
});


