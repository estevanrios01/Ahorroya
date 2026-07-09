import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { barcode } from '../services/api';

export function ScannerScreen({ navigation }: any) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        const r = await barcode.lookup('7702010000011');
        setResult(r.data);
        setScanning(false);
      } catch { setScanning(false); }
    }, 2000);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Escanear Producto</Text>

      <View style={s.scannerArea}>
        {scanning ? (
          <Text style={s.scanningText}>🔍 Escaneando...</Text>
        ) : (
          <TouchableOpacity style={s.scanBtn} onPress={handleScan}>
            <Text style={s.scanIcon}>📷</Text>
            <Text style={s.scanLabel}>Tocar para escanear</Text>
          </TouchableOpacity>
        )}
      </View>

      {result && (
        <TouchableOpacity style={s.resultCard} onPress={() => navigation.navigate('Product', { slug: result.slug })}>
          <Text style={s.resultName}>{result.name}</Text>
          <Text style={s.resultPrice}>${result.price?.toLocaleString('es-CO')}</Text>
          <Text style={s.resultStore}>Disponible en {result.storesCount} comercios</Text>
        </TouchableOpacity>
      )}

      <View style={s.manualSection}>
        <Text style={s.manualTitle}>O ingresa el código manualmente</Text>
        <View style={s.manualRow}>
          {['7702010000011', '7702010000035', '7702010000066'].map((code) => (
            <TouchableOpacity key={code} style={s.codeChip} onPress={async () => {
              try { const r = await barcode.lookup(code); setResult(r.data); } catch {}
            }}>
              <Text style={s.codeText}>{code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f4f4f5', marginTop: 48, marginBottom: 24 },
  scannerArea: { height: 250, backgroundColor: '#18181b', borderRadius: 20, borderWidth: 2, borderColor: '#27272a', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  scanBtn: { alignItems: 'center' },
  scanIcon: { fontSize: 64 },
  scanLabel: { color: '#34d399', fontSize: 16, fontWeight: '600', marginTop: 12 },
  scanningText: { color: '#34d399', fontSize: 18 },
  resultCard: { backgroundColor: '#18181b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 24 },
  resultName: { color: '#f4f4f5', fontWeight: 'bold', fontSize: 18 },
  resultPrice: { color: '#34d399', fontWeight: 'bold', fontSize: 24, marginTop: 4 },
  resultStore: { color: '#71717a', fontSize: 13, marginTop: 4 },
  manualSection: { marginTop: 16 },
  manualTitle: { color: '#71717a', fontSize: 14, marginBottom: 12 },
  manualRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  codeChip: { backgroundColor: '#18181b', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  codeText: { color: '#a1a1aa', fontSize: 12, fontFamily: 'monospace' },
});
