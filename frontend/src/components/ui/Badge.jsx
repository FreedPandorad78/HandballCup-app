const config = {
  PROGRAMADO: {
    label: 'Programado',
    cls: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300',
  },
  EN_CURSO: {
    label: 'En curso',
    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  },
  FINALIZADO: {
    label: 'Finalizado',
    cls: 'bg-hc-100 text-hc-700 dark:bg-hc-900/60 dark:text-hc-300',
  },
}

export default function Badge({ estado }) {
  const { label, cls } = config[estado] ?? {
    label: estado,
    cls: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {estado === 'EN_CURSO' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
        </span>
      )}
      {label}
    </span>
  )
}
