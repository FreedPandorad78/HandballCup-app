import api from './client'

export const getEventos = (partidoId) => api.get('/eventos/', { params: { partido: partidoId } })
export const registrarEvento = (data) => api.post('/eventos/', data)
export const deshacerEvento = (id) => api.delete(`/eventos/${id}`)
