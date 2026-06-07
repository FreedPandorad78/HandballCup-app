export default function CategoriaTabs({ categorias, selected, onChange }) {
  if (categorias.length === 0) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-body font-semibold whitespace-nowrap transition-colors ${
            selected === cat.id
              ? 'bg-brand-accent text-white'
              : 'border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent'
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
