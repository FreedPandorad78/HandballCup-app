export default function CategoriaTabs({ categorias, selected, onChange }) {
  if (categorias.length === 0) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            selected === cat.id
              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
              : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
