import { ShoppingCart, Pill, Beef, Milk, Car } from 'lucide-react';

export default function Categorias() {
  const categorias = [
    { id: 1, nombre: 'Mercado', icono: <ShoppingCart size={24} /> },
    { id: 2, nombre: 'Farmacia', icono: <Pill size={24} /> },
    { id: 3, nombre: 'Carnes', icono: <Beef size={24} /> },
    { id: 4, nombre: 'Lácteos', icono: <Milk size={24} /> },
    { id: 5, nombre: 'Vehículos', icono: <Car size={24} /> },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          className="flex flex-col items-center justify-center min-w-[100px] h-24 bg-[#1e293b] border border-slate-700 rounded-2xl hover:border-cyan-500 hover:text-cyan-400 transition-all text-slate-300"
        >
          <div className="mb-2">{cat.icono}</div>
          <span className="text-sm font-medium">{cat.nombre}</span>
        </button>
      ))}
    </div>
  );
}
