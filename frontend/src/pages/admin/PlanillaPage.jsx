import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPartido, cambiarEstado } from '../../api/partidos'
import { getJugadores } from '../../api/jugadores'
import { getEventos, registrarEvento, deshacerEvento } from '../../api/eventos'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const TIPOS = [
  { tipo: 'GOL', label: 'Gol', emoji: '⚽', cls: 'bg-green-600 active:bg-green-700' },
  { tipo: 'TARJETA_AMARILLA', label: 'Amarilla', emoji: '🟡', cls: 'bg-yellow-500 active:bg-yellow-600' },
  { tipo: 'TARJETA_ROJA', label: 'Roja', emoji: '🔴', cls: 'bg-red-600 active:bg-red-700' },
  { tipo: 'TIEMPO_FUERA', label: 'T. Fuera', emoji: '⏱', cls: 'bg-slate-600 active:bg-slate-700' },
]

const TIPO_LABELS = {
  GOL: '⚽ Gol',
  TARJETA_AMARILLA: '🟡 Amarilla',
  TARJETA_ROJA: '🔴 Roja',
  TIEMPO_FUERA: '⏱ T. Fuera',
}

function EventoRow({ evento, onUndo }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-2.5">
      <span className="w-8 text-center text-xs font-bold text-slate-400 shrink-0">
        {evento.minuto}'
      </span>
      <span className="text-sm flex-1 text-slate-700">{TIPO_LABELS[evento.tipo]}</span>
      <button
        onClick={() => onUndo(evento.id)}
        className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 transition-colors"
      >
        Deshacer
      </button>
    </div>
  )
}

function EquipoEventos({ equipo, equipo_id, onEvento, disabled }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-center text-slate-400 uppercase tracking-wide truncate">
        {equipo}
      </p>
      {TIPOS.map((t) => (
        <button
          key={t.tipo}
          onClick={() => onEvento(t.tipo, equipo_id)}
          disabled={disabled}
          className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 ${t.cls} disabled:opacity-40 transition-opacity`}
        >
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

export default function PlanillaPage() {
  const { partidoId } = useParams()
  const navigate = useNavigate()
  const [partido, setPartido] = useState(null)
  const [eventos, setEventos] = useState([])
  const [jugadoresLocal, setJugadoresLocal] = useState([])
  const [jugadoresVisitante, setJugadoresVisitante] = useState([])
  const [loading, setLoading] = useState(true)

  // Bottom sheet state
  const [sheet, setSheet] = useState(null) // { tipo, equipo_id }
  const [jugadorId, setJugadorId] = useState(null)
  const [minuto, setMinuto] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [sheetError, setSheetError] = useState(null)

  const cargar = useCallback(async () => {
    const [pRes, eRes] = await Promise.all([getPartido(partidoId), getEventos(partidoId)])
    const p = pRes.data
    setPartido(p)
    setEventos([...eRes.data].sort((a, b) => b.minuto - a.minuto))
    const [jlRes, jvRes] = await Promise.all([
      getJugadores(p.equipo_local_id),
      getJugadores(p.equipo_visitante_id),
    ])
    setJugadoresLocal(jlRes.data.filter((j) => j.activo))
    setJugadoresVisitante(jvRes.data.filter((j) => j.activo))
  }, [partidoId])

  useEffect(() => {
    cargar().finally(() => setLoading(false))
  }, [cargar])

  function abrirSheet(tipo, equipo_id) {
    setSheet({ tipo, equipo_id })
    setJugadorId(null)
    setMinuto('')
    setSheetError(null)
  }

  async function registrar() {
    if (!minuto || isNaN(parseInt(minuto))) {
      setSheetError('Ingresá el minuto.')
      return
    }
    const necesitaJugador = sheet.tipo === 'TARJETA_AMARILLA' || sheet.tipo === 'TARJETA_ROJA'
    if (necesitaJugador && !jugadorId) {
      setSheetError('Seleccioná el jugador.')
      return
    }
    setRegistrando(true)
    setSheetError(null)
    try {
      await registrarEvento({
        partido_id: partidoId,
        equipo_id: sheet.equipo_id,
        jugador_id: jugadorId,
        tipo: sheet.tipo,
        minuto: parseInt(minuto),
      })
      setSheet(null)
      await cargar()
    } catch (err) {
      setSheetError(err.response?.data?.error ?? 'Error al registrar')
    } finally {
      setRegistrando(false)
    }
  }

  async function deshacer(eventoId) {
    await deshacerEvento(eventoId)
    await cargar()
  }

  async function handleCambioEstado(nuevoEstado) {
    await cambiarEstado(partidoId, nuevoEstado)
    await cargar()
  }

  if (loading) return <Spinner />
  if (!partido) return <p className="text-center py-12 text-slate-400">Partido no encontrado.</p>

  const esLocal = sheet?.equipo_id === partido.equipo_local_id
  const jugadoresSheet = esLocal ? jugadoresLocal : jugadoresVisitante
  const esTiempoFuera = sheet?.tipo === 'TIEMPO_FUERA'

  return (
    <div className="max-w-lg mx-auto">
      {/* Score header */}
      <div className="bg-blue-900 text-white px-4 py-5">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate('/admin/fixture')} className="text-blue-300 text-xs hover:text-white">
            ← Fixture
          </button>
          <Badge estado={partido.estado} />
          <span className="text-xs text-blue-300">{partido.fase}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-center flex-1">
            <p className="text-xs font-medium text-blue-200 leading-tight">{partido.equipo_local}</p>
            <p className="text-6xl font-black tabular-nums mt-1 leading-none">{partido.goles_local}</p>
          </div>
          <span className="text-3xl text-blue-400 font-thin mx-2">–</span>
          <div className="text-center flex-1">
            <p className="text-xs font-medium text-blue-200 leading-tight">{partido.equipo_visitante}</p>
            <p className="text-6xl font-black tabular-nums mt-1 leading-none">{partido.goles_visitante}</p>
          </div>
        </div>
      </div>

      {/* Estado actions */}
      {partido.estado === 'PROGRAMADO' && (
        <button
          onClick={() => handleCambioEstado('EN_CURSO')}
          className="w-full bg-green-600 text-white font-bold py-4 text-base tracking-wide hover:bg-green-700 transition-colors"
        >
          ▶ Iniciar Partido
        </button>
      )}
      {partido.estado === 'EN_CURSO' && (
        <button
          onClick={() => handleCambioEstado('FINALIZADO')}
          className="w-full bg-slate-700 text-white font-semibold py-2.5 text-sm hover:bg-slate-800 transition-colors"
        >
          ⏹ Finalizar partido
        </button>
      )}

      {/* Event buttons */}
      {partido.estado === 'EN_CURSO' && (
        <div className="grid grid-cols-2 gap-3 p-4">
          <EquipoEventos
            equipo={partido.equipo_local}
            equipo_id={partido.equipo_local_id}
            onEvento={abrirSheet}
          />
          <EquipoEventos
            equipo={partido.equipo_visitante}
            equipo_id={partido.equipo_visitante_id}
            onEvento={abrirSheet}
          />
        </div>
      )}

      {/* Evento log */}
      <div className="px-4 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Eventos ({eventos.length})
        </p>
        {eventos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Sin eventos aún.</p>
        ) : (
          <div className="space-y-1.5">
            {eventos.map((e) => (
              <EventoRow key={e.id} evento={e} onUndo={partido.estado !== 'FINALIZADO' ? deshacer : null} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom sheet: event picker */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheet(null)} />
          <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
            {/* Sheet header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-slate-800">
                {TIPO_LABELS[sheet.tipo]} —{' '}
                {esLocal ? partido.equipo_local : partido.equipo_visitante}
              </h3>
              <button
                onClick={() => setSheet(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Minute input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minuto <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="number"
                  min={0}
                  max={90}
                  value={minuto}
                  onChange={(e) => setMinuto(e.target.value)}
                  placeholder="ej. 14"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xl font-bold text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Player picker */}
              {!esTiempoFuera && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Jugador
                    {(sheet.tipo === 'TARJETA_AMARILLA' || sheet.tipo === 'TARJETA_ROJA') && (
                      <span className="text-red-500"> *</span>
                    )}
                    {sheet.tipo === 'GOL' && (
                      <span className="text-slate-400 font-normal"> (opcional para autogol)</span>
                    )}
                  </p>

                  {sheet.tipo === 'GOL' && (
                    <button
                      onClick={() => setJugadorId(null)}
                      className={`w-full mb-2 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                        jugadorId === null
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Sin jugador (autogol)
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {jugadoresSheet.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => setJugadorId(j.id)}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium text-left transition-colors ${
                          jugadorId === j.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold">#{j.numero_camiseta}</span>{' '}
                        <span className="truncate">{j.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sheetError && <p className="text-sm text-red-600">{sheetError}</p>}

              <button
                onClick={registrar}
                disabled={registrando}
                className="w-full py-4 rounded-xl bg-blue-700 text-white font-bold text-base hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {registrando ? 'Registrando…' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
