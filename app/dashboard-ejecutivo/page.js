'use client';
import { useState, useEffect } from 'react';

export default function DashboardOperacionalPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/observability/dashboard');
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">Error al cargar dashboard</h2>
        <p className="text-zinc-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors">Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Dashboard Operacional</h1>
        <p className="text-zinc-500 text-sm mb-6">Monitor en vivo — Actualiza cada 15s</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Estado API" value={data?.health?.status || 'unknown'} color={data?.health?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'} />
          <StatCard label="Supabase" value={data?.health?.checks?.supabase?.status || 'unknown'} color={data?.health?.checks?.supabase?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'} />
          <StatCard label="Latencia BD" value={data?.health?.checks?.supabase?.latencyMs ? `${data.health.checks.supabase.latencyMs}ms` : 'N/A'} />
          <StatCard label="Uptime" value={data?.metrics?.uptime ? `${Math.round(data.metrics.uptime / 3600)}h` : 'N/A'} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <StatCard label="Productos reales" value={data?.production?.totalProducts?.toLocaleString('es-CO') || 'N/A'} color="text-emerald-400" />
          <StatCard label="Precios activos" value={data?.production?.totalPrices?.toLocaleString('es-CO') || 'N/A'} color="text-emerald-400" />
          <StatCard label="Comercios" value={data?.production?.totalStores?.toLocaleString('es-CO') || 'N/A'} />
          <StatCard label="Sucursales" value={data?.production?.totalBranches?.toLocaleString('es-CO') || 'N/A'} />
          <StatCard label="Ciudades" value={data?.production?.cities || 'N/A'} />
          <StatCard label="Departamentos" value={data?.production?.departments || 'N/A'} />
          <StatCard label="Imágenes fuente" value={data?.production?.totalImages?.toLocaleString('es-CO') || 'N/A'} />
          <StatCard label="Sin imagen" value={data?.production?.productsWithoutImage?.toLocaleString('es-CO') || 'N/A'} color={data?.production?.productsWithoutImage ? 'text-amber-400' : 'text-emerald-400'} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">APIs</h2>
            <div className="space-y-2">
              <MetricRow label="Total requests" value={data?.metrics?.http?.total || 0} />
              <MetricRow label="Avg latencia" value={`${data?.metrics?.http?.avgDurationMs || 0}ms`} />
              <MetricRow label="Req recientes" value={data?.metrics?.http?.recentRequests || 0} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Base de Datos</h2>
            <div className="space-y-2">
              <MetricRow label="Queries" value={data?.metrics?.database?.queries || 0} />
              <MetricRow label="Errores BD" value={data?.metrics?.database?.errors || 0} />
              <MetricRow label="Avg latencia" value={`${data?.metrics?.database?.avgDurationMs || 0}ms`} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Errores</h2>
            <div className="space-y-2">
              <MetricRow label="Total errores" value={data?.metrics?.errors?.total || 0} />
              <MetricRow label="Último minuto" value={data?.metrics?.errors?.lastMinute || 0} />
              <div className="text-xs text-zinc-600 mt-2">
                {data?.metrics?.errors?.byType && Object.entries(data.metrics.errors.byType).slice(0, 5).map(([type, count]) => (
                  <div key={type} className="flex justify-between">{type}: <span className="text-red-400">{count}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Scrapers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-zinc-500 text-xs uppercase">
                <th className="text-left py-2 pr-4">Comercio</th>
                <th className="text-left py-2 pr-4">Estado</th>
                <th className="text-left py-2 pr-4">Última ejecución</th>
                <th className="text-right py-2 pr-4">Duración</th>
                <th className="text-right py-2 pr-4">Errores</th>
              </tr></thead>
              <tbody>
                {data?.scheduler?.scrapers && Object.entries(data.scheduler.scrapers).map(([store, status]) => {
                  const scraper = data?.metrics?.scrapers?.[store];
                  return (
                    <tr key={store} className="border-t border-zinc-800">
                      <td className="py-2 pr-4 capitalize">{store.replace(/-/g, ' ')}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 ${status.running ? 'text-emerald-400' : (scraper?.lastStatus === 'error' ? 'text-red-400' : 'text-zinc-500')}`}>
                          <span className={`h-2 w-2 rounded-full ${status.running ? 'bg-emerald-400 animate-pulse' : (scraper?.lastStatus === 'error' ? 'bg-red-400' : 'bg-zinc-600')}`} />
                          {status.running ? 'Ejecutando' : (scraper?.lastStatus || 'pendiente')}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-zinc-400">{scraper?.lastRun ? new Date(scraper.lastRun).toLocaleString('es-CO') : 'Nunca'}</td>
                      <td className="py-2 pr-4 text-right text-zinc-400">{scraper?.lastDuration ? `${Math.round(scraper.lastDuration / 1000)}s` : '-'}</td>
                      <td className="py-2 text-right text-red-400">{scraper?.recentErrors || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Jobs</h2>
            <div className="grid grid-cols-2 gap-4">
              <MetricRow label="Encolados" value={data?.metrics?.jobs?.enqueued || 0} />
              <MetricRow label="Ejecutando" value={data?.metrics?.jobs?.running || 0} />
              <MetricRow label="Completados" value={data?.metrics?.jobs?.completed || 0} />
              <MetricRow label="Fallidos" value={data?.metrics?.jobs?.failed || 0} />
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Alertas</h2>
            {data?.alerts?.length > 0 ? (
              <div className="space-y-2">
                {data.alerts.slice(0, 10).map((alert, i) => (
                  <div key={i} className={`text-xs p-2 rounded-lg ${alert.level === 'critical' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                    <span className="font-semibold">{alert.rule}</span>: {alert.detail}
                    <span className="text-zinc-600 ml-2">{new Date(alert.timestamp).toLocaleTimeString('es-CO')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm">Sin alertas activas</p>
            )}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Jobs Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-zinc-500 text-xs uppercase">
                <th className="text-left py-2 pr-4">Comercio</th>
                <th className="text-left py-2 pr-4">Estado</th>
                <th className="text-left py-2 pr-4">Inicio</th>
                <th className="text-right py-2 pr-4">Duración</th>
                <th className="text-right py-2 pr-4">Encontrados</th>
                <th className="text-right py-2 pr-4">Actualizados</th>
              </tr></thead>
              <tbody>
                {data?.recentJobs?.map((job, i) => (
                  <tr key={job.id || i} className="border-t border-zinc-800">
                    <td className="py-2 pr-4 capitalize">{job.store || '-'}</td>
                    <td className="py-2 pr-4">
                      <span className={`${job.status === 'completed' ? 'text-emerald-400' : job.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>{job.status}</span>
                    </td>
                    <td className="py-2 pr-4 text-zinc-400">{job.started_at ? new Date(job.started_at).toLocaleString('es-CO') : '-'}</td>
                    <td className="py-2 pr-4 text-right text-zinc-400">{job.payload?.duration ? `${Math.round(job.payload.duration / 1000)}s` : '-'}</td>
                    <td className="py-2 pr-4 text-right text-zinc-400">{job.payload?.productsFound || 0}</td>
                    <td className="py-2 text-right text-zinc-400">{job.payload?.productsUpdated || 0}</td>
                  </tr>
                ))}
                {(!data?.recentJobs || data.recentJobs.length === 0) && (
                  <tr><td colSpan="6" className="py-8 text-center text-zinc-600">No hay jobs registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-zinc-100' }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-semibold text-zinc-200">{value}</span>
    </div>
  );
}
