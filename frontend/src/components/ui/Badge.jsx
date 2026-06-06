const config = {
  PROGRAMADO: { label: 'Programado', cls: 'bg-slate-100 text-slate-600' },
  EN_CURSO: { label: 'En curso', cls: 'bg-green-100 text-green-700' },
  FINALIZADO: { label: 'Finalizado', cls: 'bg-blue-100 text-blue-700' },
}

export default function Badge({ estado }) {
  const { label, cls } = config[estado] ?? { label: estado, cls: 'bg-slate-100 text-slate-600' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {estado === 'EN_CURSO' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-600" />
        </span>
      )}
      {label}
    </span>
  )
}
