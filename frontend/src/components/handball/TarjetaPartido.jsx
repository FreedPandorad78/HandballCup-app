import Badge from '../ui/Badge'

const AVATAR_COLORS = [
  'bg-orange-500', 'bg-emerald-600', 'bg-violet-600',
  'bg-rose-500', 'bg-amber-500', 'bg-cyan-600',
  'bg-indigo-500', 'bg-pink-600', 'bg-teal-600',
]

function avatarColor(name) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initials(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function TeamAvatar({ name }) {
  return (
    <div
      className={`w-11 h-11 rounded-2xl ${avatarColor(name)} flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0`}
    >
      {initials(name)}
    </div>
  )
}

function formatFecha(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export default function TarjetaPartido({ partido }) {
  const { estado, equipo_local, goles_local, equipo_visitante, goles_visitante, fecha, fase } = partido
  const jugado = estado === 'EN_CURSO' || estado === 'FINALIZADO'
  const isLive = estado === 'EN_CURSO'

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md
      bg-white dark:bg-zinc-900
      border-slate-200 dark:border-zinc-700
      ${isLive ? 'ring-1 ring-orange-400/40' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
          {fase}
        </span>
        <Badge estado={estado} />
      </div>

      {/* Teams + Score */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          {/* Local */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <TeamAvatar name={equipo_local} />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 text-center leading-tight line-clamp-2">
              {equipo_local}
            </span>
          </div>

          {/* Score / vs */}
          <div className="flex flex-col items-center shrink-0 px-1">
            {jugado ? (
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black tabular-nums leading-none
                  ${isLive ? 'text-orange-500 dark:text-orange-400' : 'text-hc-900 dark:text-white'}`}
                >
                  {goles_local}
                </span>
                <span className="text-slate-300 dark:text-zinc-600 text-xl font-light">–</span>
                <span className={`text-3xl font-black tabular-nums leading-none
                  ${isLive ? 'text-orange-500 dark:text-orange-400' : 'text-hc-900 dark:text-white'}`}
                >
                  {goles_visitante}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-slate-400 dark:text-zinc-500">vs</span>
            )}
            {!jugado && fecha && (
              <span className="text-xs text-slate-400 dark:text-zinc-500 mt-1 text-center">
                {formatFecha(fecha)}
              </span>
            )}
          </div>

          {/* Visitante */}
          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <TeamAvatar name={equipo_visitante} />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 text-center leading-tight line-clamp-2">
              {equipo_visitante}
            </span>
          </div>
        </div>

        {jugado && fecha && (
          <p className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-3">
            {formatFecha(fecha)}
          </p>
        )}
      </div>
    </div>
  )
}
