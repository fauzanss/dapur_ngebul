import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, MenuItem } from '@/lib/api';
import { Colors } from '@/constants/theme';

type CartItem = { item: MenuItem; quantity: number };

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const BRAND_PRIMARY = '#B22222';
  const BRAND_ACCENT = '#FF8C00';
  const BG_NEUTRAL = '#F7F7F7';

  const fetchMenu = async () => {
    try {
      setError(null);
      const data = await api.getMenu();
      setMenu(data);
    } catch (e) {
      setError('Gagal memuat menu. Pastikan server berjalan di 4002.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenu();
  };

  const categories = useMemo(() => {
    const cats = ['Semua', ...Array.from(new Set(menu.map(m => m.category).filter(Boolean))).sort()];
    return cats;
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'Semua') return menu;
    return menu.filter(m => m.category === activeCategory);
  }, [menu, activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const nextQty = (existing?.quantity ?? 0) + 1;
      return { ...prev, [item.id]: { item, quantity: nextQty } };
    });
  };

  const removeFromCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (!existing) return prev;
      const nextQty = existing.quantity - 1;
      const next = { ...prev } as Record<number, CartItem>;
      if (nextQty <= 0) delete next[item.id];
      else next[item.id] = { item, quantity: nextQty };
      return next;
    });
  };

  const total = useMemo(() =>
    Object.values(cart).reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0),
    [cart]);

  const checkout = async () => {
    if (!Object.keys(cart).length) return;
    try {
      const order_uuid = cryptoRandom();
      await api.createOrder({
        order_uuid,
        cashier: 'Kasir',
        items: Object.values(cart).map((ci) => ({ menu_item_id: ci.item.id, quantity: ci.quantity })),
        paid_amount: total,
      });
      setCart({});
      alert('Order berhasil dibuat.');
    } catch (e) {
      alert('Gagal membuat order.');
    }
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.available === false && <Text style={styles.badgeUnavailable}>Habis</Text>}
      </View>
      {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
      <View style={styles.cardFooter}>
        <Text style={styles.price}>{formatIDR(item.price)}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#ddd' }]} onPress={() => removeFromCart(item)}>
            <Text style={[styles.btnText, { color: '#333' }]}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: BRAND_ACCENT }]} onPress={() => addToCart(item)}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const content = useMemo(() => {
    if (loading) return <ActivityIndicator color={BRAND_PRIMARY} size="large" style={{ marginTop: 24 }} />;
    if (error) return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.checkoutBtn, { marginTop: 12 }]} onPress={fetchMenu}>
          <Text style={styles.checkoutText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
    if (!menu.length) return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Menu kosong</Text>
      </View>
    );
    return (
      <View style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.tabActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FlatList
          data={filteredMenu}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
        />
      </View>
    );
  }, [loading, error, menu, refreshing]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {content}
      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatIDR(total)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={checkout} disabled={!Object.keys(cart).length}>
          <Text style={styles.checkoutText}>Bayar</Text>
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

function cryptoRandom() {
  // Simple uuid-ish fallback for environments without crypto.randomUUID
  // Not for cryptographic use
  try {
    // @ts-ignore
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
  } catch { }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const BRAND_PRIMARY = '#B22222';
const BRAND_ACCENT = '#FF8C00';
const BG_NEUTRAL = '#F7F7F7';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_NEUTRAL, paddingBottom: 84 },
  content: { flex: 1 },
  tabContainer: { paddingHorizontal: 12, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#fff' },
  tabActive: { backgroundColor: BRAND_PRIMARY },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { padding: 12, paddingBottom: 24, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    minHeight: 140,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  badgeUnavailable: { backgroundColor: '#ddd', color: '#555', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  cardDesc: { fontSize: 12, color: '#666' },
  cardFooter: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: BRAND_PRIMARY, fontWeight: '800', fontSize: 16 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: BRAND_PRIMARY, textAlign: 'center' },
  emptyText: { color: '#555' },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  totalLabel: { color: '#666', fontSize: 12 },
  totalValue: { color: BRAND_PRIMARY, fontWeight: '900', fontSize: 18 },
  checkoutBtn: { backgroundColor: BRAND_ACCENT, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  checkoutText: { color: '#fff', fontWeight: '800' },
});


