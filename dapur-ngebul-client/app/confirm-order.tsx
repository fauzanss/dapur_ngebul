import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api, CreateOrderItem } from '@/lib/api';

type CartParam = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
};

export default function ConfirmOrderScreen() {
  const params = useLocalSearchParams<{ cart: string; customerName?: string }>();
  const router = useRouter();
  const initialCart: CartParam[] = useMemo(() => {
    try { return JSON.parse(params.cart || '[]'); } catch { return []; }
  }, [params.cart]);
  const [items, setItems] = useState<CartParam[]>(initialCart);
  const [customerName, setCustomerName] = useState<string>(params.customerName || '');

  const total = useMemo(() => items.reduce((s, it) => s + it.price * it.quantity, 0), [items]);

  const inc = (id: number) => setItems(v => v.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const dec = (id: number) => setItems(v => v.flatMap(i => {
    if (i.id !== id) return [i];
    const q = i.quantity - 1; return q > 0 ? [{ ...i, quantity: q }] : [];
  }));
  const setNote = (id: number, note: string) => setItems(v => v.map(i => i.id === id ? { ...i, note } : i));

  const submit = async () => {
    if (!items.length) return Alert.alert('Keranjang kosong');
    try {
      const order_uuid = cryptoRandom();
      const payloadItems: CreateOrderItem[] = items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, note: i.note }));
      await api.createOrder({ order_uuid, cashier: 'Kasir', customer_name: customerName || undefined, items: payloadItems });
      Alert.alert('Order dibuat', 'Status: COOKING');
      router.replace('/(tabs)/orders');
    } catch {
      Alert.alert('Gagal', 'Tidak dapat membuat order');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nama Customer</Text>
      <TextInput style={styles.input} placeholder="Masukkan nama" value={customerName} onChangeText={setCustomerName} />
      <FlatList
        data={items}
        keyExtractor={it => String(it.id)}
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemPrice}>Rp {Math.round(item.price).toLocaleString('id-ID')}</Text>
              <TextInput
                placeholder="Catatan (optional)"
                value={item.note || ''}
                onChangeText={(t) => setNote(item.id, t)}
                style={styles.note}
              />
            </View>
            <View style={styles.qtyCol}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#ddd' }]} onPress={() => dec(item.id)}>
                <Text style={[styles.btnText, { color: '#333' }]}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF8C00' }]} onPress={() => inc(item.id)}>
                <Text style={styles.btnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: Rp {Math.round(total).toLocaleString('id-ID')}</Text>
        <TouchableOpacity style={styles.submit} onPress={submit}>
          <Text style={styles.submitText}>Buat Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function cryptoRandom() {
  try { // @ts-ignore
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
  } catch { }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7', padding: 16 },
  title: { fontWeight: '800', color: '#222' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8, backgroundColor: '#fff' },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemTitle: { fontWeight: '800', color: '#222' },
  itemPrice: { color: '#B22222', marginTop: 4 },
  note: { marginTop: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  qtyCol: { alignItems: 'center' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  qty: { marginVertical: 6, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  total: { color: '#B22222', fontWeight: '900', fontSize: 18 },
  submit: { backgroundColor: '#FF8C00', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  submitText: { color: '#fff', fontWeight: '800' },
});


