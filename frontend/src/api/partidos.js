import api from './client'

export const getPartidos = () => api.get('/partidos/')
export const getPartido = (id) => api.get(`/partidos/${id}`)
export const crearPartido = (data) => api.post('/partidos/', data)
export const actualizarPartido = (id, data) => api.put(`/partidos/${id}`, data)
export const cambiarEstado = (id, estado) => api.patch(`/partidos/${id}/estado`, { estado })
export const eliminarPartido = (id) => api.delete(`/partidos/${id}`)
