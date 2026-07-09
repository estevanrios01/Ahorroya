import { useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';

export default function ReportarPrecio({ onClose }) {
  const [fase, setFase] = useState(1);
  const [formData, setFormData] = useState({
    producto: '',
    establecimiento: '',
    precio: '',
  });
  const [datosValidados, setDatosValidados] = useState(null);
  const [error, setError] = useState('');

  const capitalizarNombres = (texto) => {
    return texto.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleValidacionFase1 = (e) => {
    e.preventDefault();
    if (!formData.producto || !formData.establecimiento || !formData.precio) {
      setError('Ningún campo puede quedar vacío para proceder.');
      return;
    }

    setError('');
    setDatosValidados({
      producto: capitalizarNombres(formData.producto.trim()),
      establecimiento: capitalizarNombres(formData.establecimiento.trim()),
      precio: parseInt(formData.precio, 10)
    });
    setFase(2);
  };

  const handleEnvioFinal = () => {
    console.log('Dato validado y listo para BD:', datosValidados);
    alert('¡Precio reportado con éxito! Gracias por aportar a la comunidad.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-6 border-b border-slate-800 bg-[#1e293b]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="text-cyan-400" /> Reportar Oferta Local
          </h2>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium">
            <span className={fase === 1 ? 'text-cyan-400' : 'text-slate-500'}>1. Captura</span>
            <ChevronRight size={16} className="text-slate-600" />
            <span className={fase === 2 ? 'text-cyan-400' : 'text-slate-500'}>2. Validación Final</span>
          </div>
        </div>

        <div className="p-6">
          {fase === 1 && (
            <form onSubmit={handleValidacionFase1} className="space-y-4">
              {error && (
                <div className="bg-red-400/10 border border-red-400/20 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombre exacto del producto</label>
                <input
                  type="text"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="ej. jabón rey barra"
                  value={formData.producto}
                  onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Establecimiento</label>
                <input
                  type="text"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="ej. supermercado la 14"
                  value={formData.establecimiento}
                  onChange={(e) => setFormData({ ...formData, establecimiento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Precio Actual (COP)</label>
                <input
                  type="number"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="2500"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                />
              </div>

              <button type="submit" className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                Revisar Datos <ChevronRight size={20} />
              </button>
            </form>
          )}

          {fase === 2 && datosValidados && (
            <div className="space-y-6">
              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-5">
                <p className="text-emerald-400 text-sm mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Por favor confirma que los datos estandarizados son correctos:
                </p>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 text-xs uppercase tracking-wider block">Producto</span>
                    <span className="text-white font-semibold text-lg">{datosValidados.producto}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs uppercase tracking-wider block">Local</span>
                    <span className="text-white font-semibold">{datosValidados.establecimiento}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs uppercase tracking-wider block">Precio</span>
                    <span className="text-cyan-400 font-bold text-xl">${datosValidados.precio.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setFase(1)} className="flex-1 py-3 text-slate-400 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-all font-medium">
                  Corregir
                </button>
                <button onClick={handleEnvioFinal} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors">
                  Confirmar y Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
