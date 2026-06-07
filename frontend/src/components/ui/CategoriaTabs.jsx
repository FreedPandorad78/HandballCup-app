export default function CategoriaTabs({ categorias, selected, onChange }) {
  if (categorias.length === 0) return null
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`text-sm font-body font-semibold whitespace-nowrap transition-colors ${
            selected === cat.id
              ? 'text-brand-text'
              : 'border border-brand-border text-brand-muted rounded-full px-4 py-1 hover:text-brand-text hover:border-brand-muted'
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
