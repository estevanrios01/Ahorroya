import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MOCK_STORES = [
  { id: '1', name: 'D1', address: 'Carrera 100 # 11-60', distance: '0.5 km', lat: 3.4372, lng: -76.5225 },
  { id: '2', name: 'Éxito', address: 'Calle 5 # 38D-35', distance: '1.2 km', lat: 3.4512, lng: -76.5319 },
  { id: '3', name: 'Olímpica', address: 'Av Pasoancho # 50-12', distance: '2.1 km', lat: 3.4298, lng: -76.5104 },
  { id: '4', name: 'Cruz Verde', address: 'Cra 66 # 5-45', distance: '0.3 km', lat: 3.4401, lng: -76.5287 },
];

export function MapScreen({ navigation }: any) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Tiendas Cercanas</Text>
      <View style={s.mapPlaceholder}>
        <Text style={s.mapIcon}>🗺️</Text>
        <Text style={s.mapText}>Mapa interactivo</Text>
        <Text style={s.mapSub}>Las tiendas aparecerán aquí</Text>
      </View>
      <View style={s.list}>
        {MOCK_STORES.map((store) => (
          <View key={store.id} style={s.storeCard}>
            <View style={s.storeInfo}>
              <Text style={s.storeName}>{store.name}</Text>
              <Text style={s.storeAddr}>{store.address}</Text>
            </View>
            <Text style={s.storeDist}>{store.distance}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48, marginBottom: 16 },
  mapPlaceholder: { height: 200, backgroundColor: '#18181b', borderRadius: 16, borderWidth: 1, borderColor: '#27272a', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  mapIcon: { fontSize: 48 },
  mapText: { color: '#f4f4f5', fontWeight: 'bold', fontSize: 16, marginTop: 8 },
  mapSub: { color: '#71717a', fontSize: 12, marginTop: 4 },
  list: { gap: 8 },
  storeCard: { flexDirection: 'row', backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', justifyContent: 'space-between', alignItems: 'center' },
  storeInfo: { flex: 1 },
  storeName: { color: '#f4f4f5', fontWeight: '600', fontSize: 15 },
  storeAddr: { color: '#71717a', fontSize: 12, marginTop: 2 },
  storeDist: { color: '#34d399', fontWeight: 'bold' },
});
