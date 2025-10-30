import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, MenuItem } from '@/lib/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Brand } from '@/constants/theme';

type CartItem = { item: MenuItem; quantity: number };

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const BRAND_PRIMARY = Brand.FireRed;
  const BRAND_ACCENT = Brand.BurntOrange;
  const BG_NEUTRAL = Brand.CoffeeBeige;

  const fetchMenu = async () => {
    try {
      setError(null);
      const data = await api.getMenu();
      const sorted = [...data].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' }));
      setMenu(sorted);
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

  useFocusEffect(
    useCallback(() => {
      fetchMenu();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenu();
  };

  const filteredMenu = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter(m =>
      (m.name?.toLowerCase().includes(q)) ||
      (m.description?.toLowerCase().includes(q)) ||
      (m.category?.toLowerCase().includes(q))
    );
  }, [menu, searchQuery]);

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
        customer_name: customerName || undefined,
        items: Object.values(cart).map((ci) => ({ menu_item_id: ci.item.id, quantity: ci.quantity })),
      });
      setCart({});
      setCustomerName('');
      setCheckoutVisible(false);
      alert('Order dibuat dengan status COOKING.');
    } catch (e) {
      alert('Gagal membuat order.');
    }
  };

  const renderItem = ({ item }: { item: MenuItem }) => {
    const cartItem = cart[item.id];
    const quantity = cartItem?.quantity || 0;
    const isInCart = quantity > 0;

    return (
      <View style={[
        styles.card,
        isInCart && styles.cardSelected
      ]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          {item.available === false && <Text style={styles.badgeUnavailable}>Habis</Text>}
          {isInCart && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
          )}
        </View>
        <Text
          style={styles.cardDesc}
          numberOfLines={2}
        >{item.description || ''}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatIDR(item.price)}</Text>
          <View style={styles.buttonContainer}>
            {isInCart && (
              <TouchableOpacity
                style={[styles.btn, styles.btnRemove]}
                onPress={() => removeFromCart(item)}
              >
                <Text style={styles.btnText}>-</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.btn,
                isInCart ? styles.btnAdd : styles.btnPrimary
              ]}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.btnText}>
                {isInCart ? '+' : 'Tambah'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ActivityIndicator color={BRAND_PRIMARY} size="large" style={{ marginTop: 24 }} />
    </View>
  );

  if (error) return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.checkoutBtn, { marginTop: 12 }]} onPress={() => fetchMenu()}>
          <Text style={styles.checkoutText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!menu.length) return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.emptyText}>Menu kosong</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.containerWeb, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari menu..."
          style={styles.searchInput}
        />
        <FlatList
          data={filteredMenu}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
        />
      </View>
      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatIDR(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            const cartArr = Object.values(cart).map(ci => ({ id: ci.item.id, name: ci.item.name, price: Number(ci.item.price), quantity: ci.quantity }));
            router.push({ pathname: '/confirm-order', params: { cart: JSON.stringify(cartArr), customerName } });
          }}
          disabled={!Object.keys(cart).length}
        >
          <Text style={styles.checkoutText}>Buat Order</Text>
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
  containerWeb: { marginHorizontal: 12, marginTop: 12, marginBottom: 12 },
  content: { flex: 1 },
  searchInput: { marginHorizontal: 12, marginTop: 8, marginBottom: 4, borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  listContent: { padding: 12, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#f8f9ff',
    borderColor: BRAND_PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    flex: 1,
    lineHeight: 24
  },
  badgeUnavailable: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden'
  },
  quantityBadge: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { backgroundColor: '#F1F1F1', color: '#555', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, fontSize: 12 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: {
    color: BRAND_PRIMARY,
    fontWeight: '900',
    fontSize: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: BRAND_PRIMARY,
  },
  btnAdd: {
    backgroundColor: BRAND_ACCENT,
  },
  btnRemove: {
    backgroundColor: '#ff6b6b',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: BRAND_PRIMARY, textAlign: 'center' },
  emptyText: { color: '#555' },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Brand.DarkBrown,
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
  totalLabel: { color: Brand.WarmGold, fontSize: 12 },
  totalValue: { color: Brand.SalmonLight, fontWeight: '900', fontSize: 18 },
  checkoutBtn: { backgroundColor: BRAND_ACCENT, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  checkoutText: { color: '#fff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#222', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
});


