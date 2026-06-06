import api from './client'

export const getPosiciones = () => api.get('/estadisticas/posiciones')
export const getGoleadores = () => api.get('/estadisticas/goleadores')
export const getTarjetas = () => api.get('/estadisticas/tarjetas')
