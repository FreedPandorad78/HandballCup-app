import api from './client'

export const getJugadores = (equipoId) =>
  api.get('/jugadores/', equipoId ? { params: { equipo: equipoId } } : {})
export const getJugador = (id) => api.get(`/jugadores/${id}`)
export const crearJugador = (data) => api.post('/jugadores/', data)
export const actualizarJugador = (id, data) => api.put(`/jugadores/${id}`, data)
export const eliminarJugador = (id) => api.delete(`/jugadores/${id}`)
