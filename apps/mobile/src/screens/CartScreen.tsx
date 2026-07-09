import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const MOCK_CART = [
  { id: '1', name: 'Arroz Diana Premium 1kg', price: 3800, quantity: 2 },
  { id: '2', name: 'Leche Entera Colanta 1L', price: 2600, quantity: 1 },
];

export function CartScreen({ navigation }: any) {
  const total = MOCK_CART.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <View style={s.container}>
      <Text style={s.title}>Lista de Compras</Text>
      <FlatList data={MOCK_CART} keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={s.itemInfo}>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={s.itemQty}>Cant: {item.quantity}</Text>
            </View>
            <Text style={s.itemPrice}>${(item.price * item.quantity).toLocaleString('es-CO')}</Text>
          </View>
        )}
      />
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalValue}>${total.toLocaleString('es-CO')}</Text>
      </View>
      <TouchableOpacity style={s.shareBtn}><Text style={s.shareText}>📤 Compartir lista</Text></TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48, marginBottom: 16 },
  item: { flexDirection: 'row', backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 8, justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { color: '#f4f4f5', fontWeight: '600' },
  itemQty: { color: '#71717a', fontSize: 12, marginTop: 2 },
  itemPrice: { color: '#34d399', fontWeight: 'bold', fontSize: 18 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, padding: 16, backgroundColor: '#18181b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a' },
  totalLabel: { color: '#f4f4f5', fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: '#34d399', fontSize: 24, fontWeight: 'bold' },
  shareBtn: { backgroundColor: '#1c1917', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#292524', marginTop: 16, alignItems: 'center' },
  shareText: { color: '#fb923c', fontWeight: 'bold', fontSize: 16 },
});
