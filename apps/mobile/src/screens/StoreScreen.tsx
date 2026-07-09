import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { stores, products, Product, Store } from '../services/api';

export function StoreScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      stores.getBySlug(slug),
      products.getAll(),
    ]).then(([s, p]) => {
      setStore(s.data);
      setStoreProducts(p.data.slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator color="#34d399" style={{ marginTop: 100 }} />;

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Volver</Text></TouchableOpacity>
      <Text style={s.title}>{store?.name}</Text>
      <Text style={s.type}>{store?.type === 'farmacia' ? '💊 Farmacia' : '🛒 Supermercado'}</Text>

      <FlatList data={storeProducts} keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Product', { slug: item.slug })}>
            <Text style={s.cardBrand}>{item.brand}</Text>
            <Text style={s.cardName}>{item.name}</Text>
            <Text style={s.cardPrice}>${item.price?.toLocaleString('es-CO')}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  back: { color: '#34d399', fontSize: 16, marginTop: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5' },
  type: { fontSize: 14, color: '#71717a', marginBottom: 24 },
  card: { backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 8 },
  cardBrand: { color: '#71717a', fontSize: 11, textTransform: 'uppercase' },
  cardName: { color: '#f4f4f5', fontWeight: '600', fontSize: 15, marginVertical: 4 },
  cardPrice: { color: '#34d399', fontWeight: 'bold', fontSize: 18 },
});
