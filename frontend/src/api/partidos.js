import api from './client'

export const getPartidos = (categoriaId) =>
  api.get('/partidos/', categoriaId ? { params: { categoria: categoriaId } } : {})
export const getPartido = (id) => api.get(`/partidos/${id}`)
export const crearPartido = (data) => api.post('/partidos/', data)
export const actualizarPartido = (id, data) => api.put(`/partidos/${id}`, data)
export const cambiarEstado = (id, estado) => api.patch(`/partidos/${id}/estado`, { estado })
export const eliminarPartido = (id) => api.delete(`/partidos/${id}`)
