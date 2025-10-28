import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Brand } from '@/constants/theme';
import { api } from '@/lib/api';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mtdTotal, setMtdTotal] = useState<number>(0);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [allTimeTotal, setAllTimeTotal] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setLoading(true);
        const [today, mtd, all] = await Promise.all([
          api.getSalesToday(),
          api.getSalesMonthToDate(),
          api.getSalesAllTime(),
        ]);
        setTodayTotal(Number(today?.total ?? 0));
        setMtdTotal(Number(mtd?.total ?? 0));
        setAllTimeTotal(Number(all?.total ?? 0));
      } catch (e) {
        setError('Gagal memuat total penjualan bulan ini.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    run();
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    (async () => {
      try {
        const [today, mtd, all] = await Promise.all([
          api.getSalesToday(),
          api.getSalesMonthToDate(),
          api.getSalesAllTime(),
        ]);
        setTodayTotal(Number(today?.total ?? 0));
        setMtdTotal(Number(mtd?.total ?? 0));
        setAllTimeTotal(Number(all?.total ?? 0));
      } catch { }
      setRefreshing(false);
    })();
  };

  const body = useMemo(() => {
    if (loading) return <ActivityIndicator color={BRAND_PRIMARY} style={{ marginTop: 24 }} />;
    if (error) return <Text style={styles.errorText}>{error}</Text>;
    return (
      <>
        <View style={styles.card}>
          <Text style={styles.label}>Penjualan Hari Ini</Text>
          <Text style={styles.value}>{formatIDR(todayTotal)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Penjualan Bulan Ini</Text>
          <Text style={styles.value}>{formatIDR(mtdTotal)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Total Penjualan Keseluruhan</Text>
          <Text style={styles.value}>{formatIDR(allTimeTotal)}</Text>
        </View>
      </>
    );
  }, [loading, error, mtdTotal]);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.welcome}>Selamat datang di Dapur Ngebul</Text>
      {body}
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

const BRAND_PRIMARY = Brand.FireRed;
const BG_NEUTRAL = Brand.CoffeeBeige;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_NEUTRAL },
  content: { padding: 16 },
  welcome: { fontSize: 18, fontWeight: '900', color: Brand.CharcoalBlack },
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
  label: { color: Brand.WarmGold, fontSize: 12 },
  value: { color: BRAND_PRIMARY, fontSize: 28, fontWeight: '900', marginTop: 4 },
});
