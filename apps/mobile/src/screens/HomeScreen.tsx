import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { products, Product } from '../services/api';

export function HomeScreen({ navigation }: any) {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    products.getAll().then((res) => { setFeatured(res.data.slice(0, 6)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.title}>AhorroYa</Text>
      <Text style={s.subtitle}>Encuentra el mejor precio cerca de ti</Text>

      <TouchableOpacity style={s.searchBar} onPress={() => navigation.navigate('Search')}>
        <Text style={s.searchText}>🔍 Buscar productos...</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.scannerBtn} onPress={() => navigation.navigate('Scanner')}>
        <Text style={s.scannerText}>📷 Escanear código de barras</Text>
      </TouchableOpacity>

      <Text style={s.sectionTitle}>Productos Destacados</Text>
      {loading ? (
        <ActivityIndicator color="#34d399" />
      ) : (
        <FlatList
          data={featured}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Product', { slug: item.slug })}>
              <View style={s.cardImage}>
                <Text style={s.cardEmoji}>{item.category === 'Farmacia' ? '💊' : '🛒'}</Text>
              </View>
              <Text style={s.cardBrand}>{item.brand}</Text>
              <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
              <Text style={s.cardPrice}>${item.price?.toLocaleString('es-CO')}</Text>
              {item.oldPrice && <Text style={s.cardOldPrice}>${item.oldPrice?.toLocaleString('es-CO')}</Text>}
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={s.mapBtn} onPress={() => navigation.navigate('Map')}>
        <Text style={s.mapBtnText}>🗺️ Tiendas cercanas</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48 },
  subtitle: { fontSize: 14, color: '#71717a', marginBottom: 24 },
  searchBar: { backgroundColor: '#18181b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 12 },
  searchText: { color: '#71717a', fontSize: 16 },
  scannerBtn: { backgroundColor: '#052e16', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#166534', marginBottom: 24, alignItems: 'center' },
  scannerText: { color: '#34d399', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f4f4f5', marginBottom: 12 },
  card: { flex: 1, backgroundColor: '#18181b', borderRadius: 12, padding: 12, margin: 4, borderWidth: 1, borderColor: '#27272a' },
  cardImage: { height: 100, backgroundColor: '#27272a', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardEmoji: { fontSize: 32 },
  cardBrand: { fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1 },
  cardName: { fontSize: 13, color: '#f4f4f5', fontWeight: '600', marginVertical: 4 },
  cardPrice: { fontSize: 18, fontWeight: 'bold', color: '#34d399' },
  cardOldPrice: { fontSize: 12, color: '#71717a', textDecorationLine: 'line-through' },
  mapBtn: { backgroundColor: '#1c1917', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#292524', marginTop: 16, alignItems: 'center' },
  mapBtnText: { color: '#fb923c', fontSize: 16, fontWeight: '600' },
});
