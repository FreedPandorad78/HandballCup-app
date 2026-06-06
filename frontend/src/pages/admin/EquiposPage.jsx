import { useEffect, useState } from 'react'
import { getEquipos, crearEquipo, actualizarEquipo, eliminarEquipo } from '../../api/equipos'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const FORM_EMPTY = { nombre: '', logo_url: '' }

export default function EquiposPage() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', data: {id?,nombre,logo_url} }
  const [form, setForm] = useState(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // equipo id

  async function cargar() {
    const res = await getEquipos()
    setEquipos(res.data)
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false))
  }, [])

  function abrirCrear() {
    setForm(FORM_EMPTY)
    setError(null)
    setModal({ mode: 'create' })
  }

  function abrirEditar(eq) {
    setForm({ nombre: eq.nombre, logo_url: eq.logo_url ?? '' })
    setError(null)
    setModal({ mode: 'edit', id: eq.id })
  }

  async function guardar(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await crearEquipo({ nombre: form.nombre.trim(), logo_url: form.logo_url || null })
      } else {
        await actualizarEquipo(modal.id, { nombre: form.nombre.trim(), logo_url: form.logo_url || null })
      }
      await cargar()
      setModal(null)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function confirmarEliminar() {
    try {
      await eliminarEquipo(confirmDelete)
      await cargar()
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-800">Equipos</h1>
        <button
          onClick={abrirCrear}
          className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {equipos.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-sm">No hay equipos. Crea el primero.</p>
      ) : (
        <div className="space-y-2">
          {equipos.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{eq.nombre}</p>
                {eq.logo_url && (
                  <p className="text-xs text-slate-400 truncate">{eq.logo_url}</p>
                )}
              </div>
              <button
                onClick={() => abrirEditar(eq)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setConfirmDelete(eq.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Nuevo equipo' : 'Editar equipo'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL de logo</label>
              <input
                type="url"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Eliminar equipo" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">
            ¿Eliminás este equipo? Se eliminarán también sus jugadores y todos los partidos
            en los que participa.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminar}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
