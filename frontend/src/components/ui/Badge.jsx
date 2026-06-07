const config = {
  PROGRAMADO: { label: 'Programado', cls: 'bg-brand-faint text-brand-muted' },
  EN_CURSO:   { label: 'En curso',   cls: 'bg-brand-accent/15 text-brand-accent' },
  FINALIZADO: { label: 'Finalizado', cls: 'bg-brand-faint text-brand-muted' },
}

export default function Badge({ estado }) {
  const { label, cls } = config[estado] ?? { label: estado, cls: 'bg-brand-faint text-brand-muted' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-body font-medium ${cls}`}>
      {estado === 'EN_CURSO' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-accent" />
        </span>
      )}
      {label}
    </span>
  )
}
