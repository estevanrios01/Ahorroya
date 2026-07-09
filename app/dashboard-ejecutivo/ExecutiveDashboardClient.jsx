'use client';

import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Store, Activity, MapPin, Users, Package, ArrowUp, ArrowDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Container } from '../../packages/ui/src/components/container';

const priceEvolution = [
  { day: '1', avg: 4120 }, { day: '2', avg: 4180 }, { day: '3', avg: 4150 },
  { day: '4', avg: 4220 }, { day: '5', avg: 4190 }, { day: '6', avg: 4250 },
  { day: '7', avg: 4210 }, { day: '8', avg: 4280 }, { day: '9', avg: 4230 },
  { day: '10', avg: 4300 }, { day: '11', avg: 4270 }, { day: '12', avg: 4320 },
  { day: '13', avg: 4290 }, { day: '14', avg: 4350 }, { day: '15', avg: 4310 },
  { day: '16', avg: 4280 }, { day: '17', avg: 4340 }, { day: '18', avg: 4300 },
  { day: '19', avg: 4370 }, { day: '20', avg: 4330 }, { day: '21', avg: 4290 },
  { day: '22', avg: 4360 }, { day: '23', avg: 4320 }, { day: '24', avg: 4380 },
  { day: '25', avg: 4350 }, { day: '26', avg: 4410 }, { day: '27', avg: 4370 },
  { day: '28', avg: 4430 }, { day: '29', avg: 4390 }, { day: '30', avg: 4360 },
];

const categoryData = [
  { name: 'Mercado', value: 423000 },
  { name: 'Lácteos', value: 245000 },
  { name: 'Bebidas', value: 312000 },
  { name: 'Carnes', value: 189000 },
  { name: 'Aseo', value: 178000 },
  { name: 'Farmacia', value: 267000 },
  { name: 'Limpieza', value: 145000 },
  { name: 'Cuidado Personal', value: 198000 },
];

const geoData = [
  { city: 'Bogotá', stores: 52 },
  { city: 'Medellín', stores: 44 },
  { city: 'Cali', stores: 39 },
  { city: 'Barranquilla', stores: 31 },
  { city: 'Cartagena', stores: 27 },
  { city: 'Bucaramanga', stores: 25 },
  { city: 'Pereira', stores: 22 },
  { city: 'Manizales', stores: 19 },
  { city: 'Ibagué', stores: 18 },
  { city: 'Cúcuta', stores: 16 },
];

const topProducts = [
  { name: 'Arroz Diana 1kg', category: 'Mercado', avgPrice: 3800, searches: 15420 },
  { name: 'Leche Colanta 1L', category: 'Lácteos', avgPrice: 2600, searches: 12890 },
  { name: 'Aceite Gourmet 900ml', category: 'Mercado', avgPrice: 12500, searches: 11230 },
  { name: 'Huevos Santa Reyes x30', category: 'Mercado', avgPrice: 13800, searches: 10980 },
  { name: 'Café Sello Rojo 500g', category: 'Mercado', avgPrice: 8500, searches: 10450 },
  { name: 'Pan Bimbo 500g', category: 'Mercado', avgPrice: 4800, searches: 9870 },
  { name: 'Acetaminofén MK 500mg', category: 'Farmacia', avgPrice: 2850, searches: 9340 },
  { name: 'Detergente FAB 1kg', category: 'Aseo', avgPrice: 7800, searches: 8910 },
  { name: 'Gaseosa Coca-Cola 2.5L', category: 'Bebidas', avgPrice: 4800, searches: 8560 },
  { name: 'Jabón Rey 500ml', category: 'Aseo', avgPrice: 4800, searches: 8230 },
];

const topStores = [
  { name: 'D1', category: 'Mercado', avgPrice: 3650, diff: -18.5 },
  { name: 'Éxito', category: 'Mercado', avgPrice: 4120, diff: -12.5 },
  { name: 'Ara', category: 'Mercado', avgPrice: 3780, diff: -15.2 },
  { name: 'Jumbo', category: 'Mercado', avgPrice: 4480, diff: -8.3 },
  { name: 'Olímpica', category: 'Mercado', avgPrice: 4250, diff: -10.1 },
  { name: 'Cruz Verde', category: 'Farmacia', avgPrice: 3150, diff: -22.4 },
  { name: 'Farmatodo', category: 'Farmacia', avgPrice: 3380, diff: -18.7 },
  { name: 'Makro', category: 'Mercado', avgPrice: 3980, diff: -14.0 },
  { name: 'Alkosto', category: 'Mercado', avgPrice: 4050, diff: -13.2 },
  { name: 'Mercaldas', category: 'Mercado', avgPrice: 4350, diff: -9.6 },
];

const recentActivity = [
  { text: 'Nuevo precio registrado: Arroz Diana en Éxito — $4,200', time: 'Hace 2 min', type: 'price' },
  { text: 'Scraper completado: Cruz Verde — 4,890 productos actualizados', time: 'Hace 15 min', type: 'scraper' },
  { text: 'Actualización de precios: D1 — 8,210 productos sincronizados', time: 'Hace 28 min', type: 'update' },
  { text: 'Anomalía detectada: Leche Colanta en Olímpica con variación del +35%', time: 'Hace 1 h', type: 'alert' },
  { text: 'Nuevo comercio agregado: Makro — 3 sedes en Bogotá', time: 'Hace 2 h', type: 'store' },
  { text: 'Actualización de precios: Éxito — 12,450 productos sincronizados', time: 'Hace 3 h', type: 'update' },
  { text: 'Scraper completado: Farmatodo — 3,200 productos actualizados', time: 'Hace 4 h', type: 'scraper' },
  { text: 'Nuevo precio registrado: Pan Bimbo en Jumbo — $4,800', time: 'Hace 5 h', type: 'price' },
  { text: 'Cobertura expandida: 5 nuevos municipios en Antioquia', time: 'Hace 6 h', type: 'coverage' },
  { text: 'Anomalía resuelta: Precio de Aceite Gourmet en Ara corregido', time: 'Hace 8 h', type: 'resolved' },
];

const activityIcons = {
  price: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  scraper: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  update: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  alert: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  store: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  coverage: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  resolved: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

const accentStyles = {
  emerald: { bg: 'bg-emerald-600/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  indigo: { bg: 'bg-indigo-600/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  teal: { bg: 'bg-teal-600/10', border: 'border-teal-500/20', text: 'text-teal-400' },
  amber: { bg: 'bg-amber-600/10', border: 'border-amber-500/20', text: 'text-amber-400' },
};

function StatCard({ icon: Icon, label, value, sublabel, accent = 'emerald', delay = 0 }) {
  const s = accentStyles[accent] || accentStyles.emerald;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/50 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${s.bg} border ${s.border}`}>
          <Icon className={`w-5 h-5 ${s.text}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-zinc-100 tracking-tight">{value}</p>
      <p className="text-sm text-zinc-500 mt-1.5">{label}</p>
      {sublabel && (
        <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
          <ArrowUp className="w-3 h-3" />
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}

function ChartCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/50 transition-all duration-300"
    >
      <h3 className="text-sm font-semibold text-zinc-300 mb-4 tracking-wide">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </motion.div>
  );
}

function formatPrice(value) {
  return '$' + value.toLocaleString('es-CO');
}

export default function ExecutiveDashboardClient() {
  const mounted = true;
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <div className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-16 z-40">
        <Container className="py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Dashboard Ejecutivo
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Indicadores clave de rendimiento de la plataforma nacional de precios
            </p>
          </motion.div>
        </Container>
      </div>

      <Container className="py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Package}
            label="Productos Monitoreados"
            value="1,200,000+"
            sublabel="+45,000 este mes"
            accent="emerald"
            delay={0}
          />
          <StatCard
            icon={Store}
            label="Comercios Activos"
            value="200+"
            sublabel="18 cadenas nacionales"
            accent="indigo"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="Precios Actualizados Hoy"
            value="45,230"
            sublabel="+12% vs ayer"
            accent="emerald"
            delay={0.2}
          />
          <StatCard
            icon={MapPin}
            label="Cobertura Nacional"
            value="32/32"
            sublabel="Departamentos de Colombia"
            accent="teal"
            delay={0.3}
          />
          <StatCard
            icon={Users}
            label="Usuarios Registrados"
            value="15,430"
            sublabel="+890 esta semana"
            accent="amber"
            delay={0.4}
          />
          <StatCard
            icon={Activity}
            label="Precios Detectados Hoy"
            value="12,450"
            sublabel="Procesados en tiempo real"
            accent="emerald"
            delay={0.5}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Evolución de Precios — Últimos 30 Días" delay={0.1}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#e4e4e7',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [`$${value.toLocaleString('es-CO')}`, 'Precio Promedio']}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Productos por Categoría" delay={0.2}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#71717a" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#e4e4e7',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [value.toLocaleString('es-CO'), 'Productos']}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cobertura Geográfica — Tiendas por Ciudad" delay={0.3}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={geoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="city" stroke="#71717a" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#e4e4e7',
                    fontSize: '13px',
                  }}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="stores"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/50 transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 tracking-wide">
              Top 10 Productos Más Buscados
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider">Producto</th>
                    <th className="text-left text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider">Categoría</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider">Precio Prom.</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Búsquedas</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.name} className="border-b border-zinc-800/50 last:border-0 group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600 w-5">{i + 1}</span>
                          <span className="text-zinc-200 group-hover:text-emerald-400 transition-colors">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">{p.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-300 font-mono">
                        {formatPrice(p.avgPrice)}
                      </td>
                      <td className="py-3 text-right text-zinc-300 font-mono">
                        {p.searches.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/50 transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 tracking-wide">
              Comercios con Mejor Precio
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider">Comercio</th>
                    <th className="text-left text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider">Categoría</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider">Precio Prom.</th>
                    <th className="text-right text-zinc-500 font-medium pb-3 text-xs uppercase tracking-wider">Dif. vs Mercado</th>
                  </tr>
                </thead>
                <tbody>
                  {topStores.map((s, i) => (
                    <tr key={s.name} className="border-b border-zinc-800/50 last:border-0 group">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600 w-5">{i + 1}</span>
                          <span className="text-zinc-200 group-hover:text-emerald-400 transition-colors">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">{s.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-300 font-mono">
                        {formatPrice(s.avgPrice)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                          <ArrowDown className="w-3 h-3" />
                          {Math.abs(s.diff)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/50 transition-all duration-300"
        >
          <h3 className="text-sm font-semibold text-zinc-300 mb-6 tracking-wide">
            Actividad Reciente
          </h3>
          <div className="relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-800" />
            <div className="space-y-0">
              {recentActivity.map((item, i) => (
                <div key={i} className="relative pl-10 pb-5 last:pb-0">
                  <div className={`absolute left-[5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${activityIcons[item.type]}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{item.text}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>

      <Footer />
    </div>
  );
}
