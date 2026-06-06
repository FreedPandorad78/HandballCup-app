import Badge from '../ui/Badge'

function formatFecha(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function TarjetaPartido({ partido }) {
  const { estado, equipo_local, goles_local, equipo_visitante, goles_visitante, fecha, fase } = partido
  const jugado = estado === 'EN_CURSO' || estado === 'FINALIZADO'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{fase}</span>
        <Badge estado={estado} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 text-right text-sm font-semibold text-slate-800 leading-tight">
          {equipo_local}
        </span>

        {jugado ? (
          <div className="flex items-center gap-2 px-3">
            <span className="text-2xl font-bold text-blue-900 tabular-nums">{goles_local}</span>
            <span className="text-slate-300 font-light text-lg">–</span>
            <span className="text-2xl font-bold text-blue-900 tabular-nums">{goles_visitante}</span>
          </div>
        ) : (
          <span className="px-4 text-slate-400 font-semibold text-sm">vs</span>
        )}

        <span className="flex-1 text-left text-sm font-semibold text-slate-800 leading-tight">
          {equipo_visitante}
        </span>
      </div>

      {fecha && (
        <p className="mt-2 text-center text-xs text-slate-400">{formatFecha(fecha)}</p>
      )}
    </div>
  )
}
