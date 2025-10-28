import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Brand } from '@/constants/theme';
import { api, SalesSummary } from '@/lib/api';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todaySales, setTodaySales] = useState<SalesSummary | null>(null);
  const [monthToDateSales, setMonthToDateSales] = useState<SalesSummary | null>(null);
  const [allTimeSales, setAllTimeSales] = useState<SalesSummary | null>(null);
  const [orderStats, setOrderStats] = useState<{
    cancelled: number;
    paid: number;
    cooking: number;
    delivered: number;
  }>({ cancelled: 0, paid: 0, cooking: 0, delivered: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setLoading(true);
        const [today, mtd, all, orders] = await Promise.all([
          api.getSalesToday(),
          api.getSalesMonthToDate(),
          api.getSalesAllTime(),
          api.getOrders(),
        ]);
        setTodaySales(today);
        setMonthToDateSales(mtd);
        setAllTimeSales(all);

        // Count orders by status
        const stats = {
          cancelled: orders.filter(o => o.status === 'CANCELLED').length,
          paid: orders.filter(o => o.status === 'PAID').length,
          cooking: orders.filter(o => o.status === 'COOKING').length,
          delivered: orders.filter(o => o.status === 'DELIVERED').length,
        };
        setOrderStats(stats);
      } catch (e) {
        setError('Gagal memuat ringkasan penjualan.');
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
        const [today, mtd, all, orders] = await Promise.all([
          api.getSalesToday(),
          api.getSalesMonthToDate(),
          api.getSalesAllTime(),
          api.getOrders(),
        ]);
        setTodaySales(today);
        setMonthToDateSales(mtd);
        setAllTimeSales(all);

        // Count orders by status
        const stats = {
          cancelled: orders.filter(o => o.status === 'CANCELLED').length,
          paid: orders.filter(o => o.status === 'PAID').length,
          cooking: orders.filter(o => o.status === 'COOKING').length,
          delivered: orders.filter(o => o.status === 'DELIVERED').length,
        };
        setOrderStats(stats);
      } catch { }
      setRefreshing(false);
    })();
  };

  const body = useMemo(() => {
    if (loading) return <ActivityIndicator color={Brand.FireRed} size="large" style={{ marginTop: 24 }} />;
    if (error) return <Text style={styles.errorText}>{error}</Text>;
    return (
      <>
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/dapur-ngebul-logo.png')}
                style={styles.logo}
                resizeMode="cover"
              />
              <View style={styles.logoGlow} />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hi Tuanku,</Text>
              <Text style={styles.greetingTime}>{getTimeBasedGreeting()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.orderStatsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Today's Summary</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.badgeText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.orderStatsGrid}>
            <View style={[styles.orderStatCard, { borderColor: '#999' }]}>
              <View style={styles.cardContent}>
                <Text style={styles.statusIcon}>❌</Text>
                <View style={styles.cardText}>
                  <Text style={styles.orderStatNumber}>{orderStats.cancelled}</Text>
                  <Text style={[styles.orderStatLabel, { color: '#555' }]}>CANCELLED</Text>
                </View>
              </View>
            </View>
            <View style={[styles.orderStatCard, { borderColor: Brand.SuccessGreen }]}>
              <View style={styles.cardContent}>
                <Text style={styles.statusIcon}>✅</Text>
                <View style={styles.cardText}>
                  <Text style={styles.orderStatNumber}>{orderStats.paid}</Text>
                  <Text style={[styles.orderStatLabel, { color: Brand.SuccessGreen }]}>PAID</Text>
                </View>
              </View>
            </View>
            <View style={[styles.orderStatCard, { borderColor: Brand.BurntOrange }]}>
              <View style={styles.cardContent}>
                <Text style={styles.statusIcon}>👨‍🍳</Text>
                <View style={styles.cardText}>
                  <Text style={styles.orderStatNumber}>{orderStats.cooking}</Text>
                  <Text style={[styles.orderStatLabel, { color: Brand.BurntOrange }]}>COOKING</Text>
                </View>
              </View>
            </View>
            <View style={[styles.orderStatCard, { borderColor: Brand.WarmGold }]}>
              <View style={styles.cardContent}>
                <Text style={styles.statusIcon}>🚚</Text>
                <View style={styles.cardText}>
                  <Text style={styles.orderStatNumber}>{orderStats.delivered}</Text>
                  <Text style={[styles.orderStatLabel, { color: Brand.WarmGold }]}>DELIVERED</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Ringkasan Penjualan</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.badgeText}>LIVE</Text>
            </View>
          </View>

          <View style={[styles.card, styles.todayCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.cardIcon}>📅</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Penjualan Hari Ini</Text>
                <Text style={styles.cardSubtitle}>Real-time</Text>
              </View>
              <View style={styles.trendIndicator}>
                <Text style={styles.trendText}>↗</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{formatIDR(todaySales?.total ?? 0)}</Text>
            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todaySales?.count ?? 0}</Text>
                <Text style={styles.statLabel}>Transaksi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todaySales?.count ? Math.round(todaySales.total / todaySales.count) : 0}</Text>
                <Text style={styles.statLabel}>Rata-rata</Text>
              </View>
            </View>
            <Text style={styles.cardDate}>{new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</Text>
          </View>

          <View style={[styles.card, styles.monthCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.cardIcon}>📈</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Penjualan Bulan Ini</Text>
                <Text style={styles.cardSubtitle}>Month-to-date</Text>
              </View>
              <View style={styles.trendIndicator}>
                <Text style={styles.trendText}>📊</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{formatIDR(monthToDateSales?.total ?? 0)}</Text>
            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{monthToDateSales?.count ?? 0}</Text>
                <Text style={styles.statLabel}>Transaksi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{monthToDateSales?.count ? Math.round(monthToDateSales.total / monthToDateSales.count) : 0}</Text>
                <Text style={styles.statLabel}>Rata-rata</Text>
              </View>
            </View>
            <Text style={styles.cardDate}>{new Date().toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long'
            })}</Text>
          </View>

          <View style={[styles.card, styles.allTimeCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.cardIcon}>🏆</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Total Penjualan Keseluruhan</Text>
                <Text style={styles.cardSubtitle}>All-time</Text>
              </View>
              <View style={styles.trendIndicator}>
                <Text style={styles.trendText}>⭐</Text>
              </View>
            </View>
            <Text style={styles.cardValue}>{formatIDR(allTimeSales?.total ?? 0)}</Text>
            <View style={styles.cardStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{allTimeSales?.count ?? 0}</Text>
                <Text style={styles.statLabel}>Transaksi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{allTimeSales?.count ? Math.round(allTimeSales.total / allTimeSales.count) : 0}</Text>
                <Text style={styles.statLabel}>Rata-rata</Text>
              </View>
            </View>
            <Text style={styles.cardDate}>Sejak awal operasi</Text>
          </View>
        </View>

        {/* <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>⚡ Statistik Cepat</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todaySales?.count ?? 0}</Text>
              <Text style={styles.statLabel}>Order Hari Ini</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthToDateSales?.count ?? 0}</Text>
              <Text style={styles.statLabel}>Order Bulan Ini</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{allTimeSales?.count ?? 0}</Text>
              <Text style={styles.statLabel}>Total Order</Text>
            </View>
          </View>
        </View> */}
      </>
    );
  }, [loading, error, todaySales, monthToDateSales, allTimeSales]);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Brand.FireRed} />}
    >
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

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Selamat Pagi';
  } else if (hour >= 12 && hour < 15) {
    return 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
}

const BRAND_PRIMARY = Brand.FireRed;
const BG_NEUTRAL = Brand.CoffeeBeige;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.CoffeeBeige },
  content: { padding: 16, paddingBottom: 24 },
  errorText: { color: Brand.FireRed, marginTop: 24, textAlign: 'center' },

  // Header Card
  headerCard: {
    backgroundColor: '#1B0E07',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: Brand.WarmGold + '30',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  logoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    // borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: Brand.WarmGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    // borderRadius: 20,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: Brand.FireRed + '20',
    // borderRadius: 60,
    zIndex: -1,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 18,
    color: Brand.WarmGold,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingTime: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '900',
    textShadowColor: Brand.FireRed + '50',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Order Stats Section
  orderStatsSection: {
    marginBottom: 24,
  },
  orderStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  orderStatCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 2,
    borderColor: Brand.CoffeeBeige,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusIcon: {
    fontSize: 24,
  },
  orderStatNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: Brand.FireRed,
    marginBottom: 2,
  },
  orderStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'left',
  },

  // Summary Section
  summarySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Brand.CharcoalBlack,
  },
  sectionBadge: {
    backgroundColor: Brand.FireRed,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    borderWidth: 1,
    borderColor: Brand.WarmGold + '30',
  },
  todayCard: {
    borderLeftWidth: 6,
    borderLeftColor: Brand.FireRed,
    backgroundColor: '#fef7f7',
  },
  monthCard: {
    borderLeftWidth: 6,
    borderLeftColor: Brand.BurntOrange,
    backgroundColor: '#fef9f5',
  },
  allTimeCard: {
    borderLeftWidth: 6,
    borderLeftColor: Brand.SuccessGreen,
    backgroundColor: '#f5f9f5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Brand.WarmGold + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.CharcoalBlack,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Brand.WarmGold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.FireRed + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Brand.FireRed,
    marginBottom: 12,
    textAlign: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: Brand.CoffeeBeige + '70',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.CharcoalBlack,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Brand.WarmGold,
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Brand.WarmGold + '30',
  },
  cardDate: {
    fontSize: 12,
    color: Brand.CharcoalBlack,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Quick Stats Section
  quickStatsSection: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
