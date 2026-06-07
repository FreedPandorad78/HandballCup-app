export default function CategoriaTabs({ categorias, selected, onChange }) {
  if (categorias.length === 0) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            selected === cat.id
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
