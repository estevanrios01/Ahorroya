import { useSupermarketStore } from '../../store/useSupermarketStore';
import { ArrowDownAZ, MapPin, DollarSign } from 'lucide-react';

export default function ControlesBusqueda() {
  const { criterioOrden, setCriterioOrden, results } = useSupermarketStore();

  if (results.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-[#1e293b] p-3 rounded-2xl border border-slate-700">
      <span className="text-sm text-slate-400 pl-2">
        Mostrando <span className="text-white font-semibold">{results.length}</span> resultados
      </span>

      <div className="flex bg-[#0f172a] rounded-xl p-1 border border-slate-800 w-full sm:w-auto overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setCriterioOrden('relevancia')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            criterioOrden === 'relevancia' ? 'bg-cyan-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownAZ size={16} /> Relevancia
        </button>
        <button
          onClick={() => setCriterioOrden('precio_menor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            criterioOrden === 'precio_menor' ? 'bg-cyan-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign size={16} /> Menor Precio
        </button>
        <button
          onClick={() => setCriterioOrden('distancia_menor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            criterioOrden === 'distancia_menor' ? 'bg-cyan-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin size={16} /> Más Cercano
        </button>
      </div>
    </div>
  );
}
