import Badge from '../ui/Badge'

const AVATAR_COLORS = [
  'bg-orange-600', 'bg-emerald-700', 'bg-violet-700',
  'bg-rose-700', 'bg-amber-600', 'bg-cyan-700',
  'bg-indigo-700', 'bg-pink-700', 'bg-teal-700',
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
      className={`w-12 h-12 rounded-xl ${avatarColor(name)} flex items-center justify-center font-display text-xl text-white shadow-md shrink-0`}
    >
      {initials(name)}
    </div>
  )
}

function formatFecha(iso) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export default function TarjetaPartido({ partido }) {
  const { estado, equipo_local, goles_local, equipo_visitante, goles_visitante, fecha, fase } = partido
  const jugado = estado === 'EN_CURSO' || estado === 'FINALIZADO'
  const isLive  = estado === 'EN_CURSO'

  return (
    <div className={`rounded-xl border bg-brand-card overflow-hidden transition-colors hover:bg-brand-card-alt ${
      isLive ? 'border-brand-accent/50' : 'border-brand-border'
    }`}>
      {/* Fase + badge */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-body font-medium text-brand-muted uppercase tracking-widest">{fase}</span>
        <Badge estado={estado} />
      </div>

      {/* Teams + score */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          {/* Local */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <TeamAvatar name={equipo_local} />
            <span className="text-xs font-body font-semibold text-brand-text text-center leading-tight line-clamp-2">
              {equipo_local}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center shrink-0 px-2">
            {jugado ? (
              <div className="flex items-baseline gap-2">
                <span className={`font-display text-4xl tabular-nums leading-none ${
                  isLive ? 'text-brand-accent' : 'text-brand-text'
                }`}>
                  {goles_local}
                </span>
                <span className="text-brand-border text-2xl font-light">–</span>
                <span className={`font-display text-4xl tabular-nums leading-none ${
                  isLive ? 'text-brand-accent' : 'text-brand-text'
                }`}>
                  {goles_visitante}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-display text-2xl text-brand-muted tracking-widest">VS</span>
                {fecha && (
                  <span className="text-xs font-body text-brand-muted text-center">
                    {formatFecha(fecha)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Visitante */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <TeamAvatar name={equipo_visitante} />
            <span className="text-xs font-body font-semibold text-brand-text text-center leading-tight line-clamp-2">
              {equipo_visitante}
            </span>
          </div>
        </div>

        {jugado && fecha && (
          <p className="text-center text-xs font-body text-brand-muted mt-3">
            {formatFecha(fecha)}
          </p>
        )}
      </div>
    </div>
  )
}
