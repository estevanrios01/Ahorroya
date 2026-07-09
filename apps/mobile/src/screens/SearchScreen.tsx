import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { products, Product } from '../services/api';

export function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try { const r = await products.search(query); setResults(r.data.results); } catch {}
    setLoading(false);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Buscar</Text>
      <View style={s.inputRow}>
        <TextInput style={s.input} placeholder="Arroz, leche, acetaminofén..." placeholderTextColor="#71717a"
          value={query} onChangeText={setQuery} onSubmitEditing={search} returnKeyType="search" />
        <TouchableOpacity style={s.btn} onPress={search}><Text style={s.btnText}>Buscar</Text></TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#34d399" style={{ marginTop: 20 }} />}

      <FlatList data={results} keyExtractor={(item) => item.id} renderItem={({ item }) => (
        <TouchableOpacity style={s.result} onPress={() => navigation.navigate('Product', { slug: item.slug })}>
          <Text style={s.rName}>{item.name}</Text>
          <Text style={s.rBrand}>{item.brand}</Text>
          <Text style={s.rPrice}>${item.price?.toLocaleString('es-CO')}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48, marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', color: '#f4f4f5', fontSize: 16 },
  btn: { backgroundColor: '#059669', padding: 14, borderRadius: 12, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  result: { backgroundColor: '#18181b', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#27272a' },
  rName: { color: '#f4f4f5', fontWeight: '600', fontSize: 15 },
  rBrand: { color: '#71717a', fontSize: 12, marginTop: 2 },
  rPrice: { color: '#34d399', fontWeight: 'bold', fontSize: 18, marginTop: 4 },
});
