import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function ProfileScreen({ navigation }: any) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Mi Perfil</Text>
      <View style={s.card}>
        <Text style={s.avatar}>👤</Text>
        <Text style={s.email}>usuario@ahorroya.com</Text>
        <Text style={s.member}>Miembro desde Julio 2026</Text>
      </View>

      <View style={s.menu}>
        {[
          { icon: '🛒', label: 'Lista de Compras', onPress: () => navigation.navigate('Cart') },
          { icon: '❤️', label: 'Favoritos', onPress: () => navigation.navigate('Favorites') },
          { icon: '🔔', label: 'Alertas de Precio', onPress: () => {} },
          { icon: '🗺️', label: 'Mis Tiendas', onPress: () => navigation.navigate('Map') },
          { icon: '📊', label: 'Historial', onPress: () => {} },
          { icon: '⚙️', label: 'Configuración', onPress: () => {} },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={s.menuItem} onPress={item.onPress}>
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48, marginBottom: 16 },
  card: { backgroundColor: '#18181b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#27272a', alignItems: 'center', marginBottom: 24 },
  avatar: { fontSize: 48, marginBottom: 12 },
  email: { color: '#f4f4f5', fontSize: 16, fontWeight: '600' },
  member: { color: '#71717a', fontSize: 12, marginTop: 4 },
  menu: { gap: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#27272a' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, color: '#f4f4f5', fontSize: 15 },
  menuArrow: { color: '#71717a', fontSize: 20 },
});
