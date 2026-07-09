import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileStore } from '../store';

const MOCK_FAVORIES = [
  { id: '1', name: 'Arroz Diana Premium 1kg', brand: 'Diana', price: 3800, slug: 'arroz-diana-premium' },
  { id: '2', name: 'Leche Entera Colanta 1L', brand: 'Colanta', price: 2600, slug: 'leche-entera-colanta' },
];

export function FavoritesScreen({ navigation }: any) {
  const { favorites } = useMobileStore();
  const items = MOCK_FAVORIES;

  return (
    <View style={s.container}>
      <Text style={s.title}>Favoritos</Text>
      {items.length === 0 ? (
        <Text style={s.empty}>No tienes productos favoritos aún</Text>
      ) : (
        <FlatList data={items} keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Product', { slug: item.slug })}>
              <Text style={s.brand}>{item.brand}</Text>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.price}>${item.price.toLocaleString('es-CO')}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48, marginBottom: 16 },
  empty: { color: '#71717a', fontSize: 16, textAlign: 'center', marginTop: 60 },
  card: { backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 8 },
  brand: { color: '#71717a', fontSize: 11, textTransform: 'uppercase' },
  name: { color: '#f4f4f5', fontWeight: '600', fontSize: 15, marginVertical: 4 },
  price: { color: '#34d399', fontWeight: 'bold', fontSize: 20 },
});
