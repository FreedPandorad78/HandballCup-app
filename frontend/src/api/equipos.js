import api from './client'

export const getEquipos = () => api.get('/equipos/')
export const getEquipo = (id) => api.get(`/equipos/${id}`)
export const crearEquipo = (data) => api.post('/equipos/', data)
export const actualizarEquipo = (id, data) => api.put(`/equipos/${id}`, data)
export const eliminarEquipo = (id) => api.delete(`/equipos/${id}`)
