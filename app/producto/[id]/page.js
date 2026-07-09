'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DetalleProducto() {
  const params = useParams();
  const router = useRouter();

  const producto = {
    id: params.id,
    nombre: 'Arroz Diana Premium',
    categoria: 'Despensa',
    precioOptimo: 3800,
    tiendaOptima: 'Tiendas D1',
    historial: [
      { fecha: '1 Jul', precio: 4500 },
      { fecha: '3 Jul', precio: 4500 },
      { fecha: '5 Jul', precio: 4200 },
      { fecha: '7 Jul', precio: 3900 },
      { fecha: '8 Jul', precio: 3800 },
    ],
    sucursales: [
      { id: 1, nombre: 'Tiendas D1', direccion: 'Carrera 100 # 11-60', precio: 3800, distancia: 0.5, stock: true },
      { id: 2, nombre: 'Almacenes Éxito', direccion: 'Calle 5 # 38D-35', precio: 4200, distancia: 1.2, stock: true },
      { id: 3, nombre: 'Supermercados Olímpica', direccion: 'Avenida Pasoancho # 50-12', precio: 4500, distancia: 2.1, stock: false },
    ]
  };

  const tendenciaBaja = producto.historial[0].precio > producto.historial[producto.historial.length - 1].precio;

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 pt-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8"
      >
        <ArrowLeft size={20} /> Volver a resultados
      </button>

      <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            {producto.categoria}
          </span>
          <h1 className="text-4xl font-bold text-white mb-2">{producto.nombre}</h1>
          <p className="text-slate-400 flex items-center gap-2">
            Mejor precio detectado en: <span className="text-cyan-400 font-semibold">{producto.tiendaOptima}</span>
          </p>
        </div>
        <div className="text-right bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-sm mb-1">Precio Óptimo Actual</p>
          <span className="text-4xl font-bold text-emerald-400">
            ${producto.precioOptimo.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Historial de Precios (7 días)</h2>
            {tendenciaBaja ? (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm">
                <TrendingDown size={16} /> En bajada
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-sm">
                <TrendingUp size={16} /> En subida
              </span>
            )}
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={producto.historial}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 200', 'dataMax + 200']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Line type="monotone" dataKey="precio" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#22d3ee', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Comparativa Local</h2>
          <div className="space-y-4">
            {producto.sucursales.map((sucursal) => (
              <div key={sucursal.id} className="flex items-center justify-between p-4 bg-[#0f172a] rounded-2xl border border-slate-800">
                <div className="flex-1">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    {sucursal.nombre}
                    {!sucursal.stock && <AlertCircle size={14} className="text-red-400" title="Posible falta de inventario" />}
                  </h3>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {sucursal.direccion} • {sucursal.distancia} km
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${sucursal.precio === producto.precioOptimo ? 'text-emerald-400' : 'text-slate-300'}`}>
                    ${sucursal.precio.toLocaleString('es-CO')}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {sucursal.stock ? 'En stock' : <span className="text-red-400">Agotado</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
