import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { products, Product, PriceEntry } from '../services/api';

export function ProductScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    products.getBySlug(slug).then((r) => {
      setProduct(r.data);
      setPrices((r.data as any).prices || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator color="#34d399" style={{ marginTop: 100 }} />;
  if (!product) return <Text style={{ color: '#fff', padding: 20 }}>Producto no encontrado</Text>;

  const bestPrice = prices.length ? Math.min(...prices.map(p => p.price)) : product.price;

  return (
    <ScrollView style={s.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Volver</Text></TouchableOpacity>

      <View style={s.header}>
        <Text style={s.brand}>{product.brand}</Text>
        <Text style={s.name}>{product.name}</Text>
        <Text style={s.price}>${bestPrice.toLocaleString('es-CO')}</Text>
        {product.oldPrice && <Text style={s.oldPrice}>${product.oldPrice.toLocaleString('es-CO')}</Text>}
      </View>

      {product.description && <Text style={s.desc}>{product.description}</Text>}

      <Text style={s.sectionTitle}>Comparativa de Precios</Text>
      {prices.map((p, i) => (
        <TouchableOpacity key={i} style={s.priceCard} onPress={() => navigation.navigate('Map')}>
          <View style={s.priceRow}>
            <Text style={s.storeName}>{p.store}</Text>
            <Text style={p.price === bestPrice ? s.bestPrice : s.storePrice}>
              ${p.price.toLocaleString('es-CO')}
            </Text>
          </View>
          {p.oldPrice && <Text style={s.discount}>Ahorras ${(p.oldPrice - p.price).toLocaleString('es-CO')}</Text>}
          <Text style={s.distance}>📍 {p.distance} km • {p.address}</Text>
        </TouchableOpacity>
      ))}

      <View style={s.actions}>
        <TouchableOpacity style={s.compareBtn}><Text style={s.compareText}>🛒 Comparar precios</Text></TouchableOpacity>
        <TouchableOpacity style={s.saveBtn}><Text style={s.saveText}>❤️ Guardar</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  back: { color: '#34d399', fontSize: 16, marginTop: 48, marginBottom: 16 },
  header: { marginBottom: 24 },
  brand: { color: '#71717a', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  name: { color: '#f4f4f5', fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  price: { color: '#34d399', fontSize: 32, fontWeight: 'bold' },
  oldPrice: { color: '#71717a', fontSize: 18, textDecorationLine: 'line-through', marginTop: 2 },
  desc: { color: '#a1a1aa', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  sectionTitle: { color: '#f4f4f5', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  priceCard: { backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { color: '#f4f4f5', fontWeight: '600', fontSize: 15 },
  storePrice: { color: '#f4f4f5', fontWeight: 'bold', fontSize: 18 },
  bestPrice: { color: '#34d399', fontWeight: 'bold', fontSize: 18 },
  discount: { color: '#f43f5e', fontSize: 12, marginTop: 2 },
  distance: { color: '#71717a', fontSize: 11, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 48 },
  compareBtn: { flex: 1, backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center' },
  compareText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { flex: 1, backgroundColor: '#18181b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', alignItems: 'center' },
  saveText: { color: '#f4f4f5', fontWeight: 'bold', fontSize: 16 },
});
