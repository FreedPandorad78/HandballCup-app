import { useEffect, useState } from 'react'
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../api/categorias'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [nombre, setNombre] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function cargar() {
    const res = await getCategorias()
    setCategorias(res.data)
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false))
  }, [])

  function abrirCrear() {
    setNombre('')
    setError(null)
    setModal({ mode: 'create' })
  }

  function abrirEditar(cat) {
    setNombre(cat.nombre)
    setError(null)
    setModal({ mode: 'edit', id: cat.id })
  }

  async function guardar(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await crearCategoria({ nombre: nombre.trim() })
      } else {
        await actualizarCategoria(modal.id, { nombre: nombre.trim() })
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
      await eliminarCategoria(confirmDelete)
      await cargar()
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-800">Categorías</h1>
        <button
          onClick={abrirCrear}
          className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Nueva
        </button>
      </div>

      {categorias.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-sm">
          No hay categorías. Crea la primera para poder asignar equipos y partidos.
        </p>
      ) : (
        <div className="space-y-2">
          {categorias.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <p className="flex-1 font-semibold text-slate-800">{cat.nombre}</p>
              <button
                onClick={() => abrirEditar(cat)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setConfirmDelete(cat.id)}
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
          title={modal.mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
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
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Infantil, Cadetes"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
        <Modal title="Eliminar categoría" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600 mb-4">
            ¿Eliminás esta categoría? Los equipos y partidos asociados quedarán sin categoría.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600"
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
