import api from './client'

export const getPosiciones = (categoriaId) =>
  api.get('/estadisticas/posiciones', categoriaId ? { params: { categoria: categoriaId } } : {})

export const getGoleadores = (categoriaId) =>
  api.get('/estadisticas/goleadores', categoriaId ? { params: { categoria: categoriaId } } : {})

export const getTarjetas = (categoriaId) =>
  api.get('/estadisticas/tarjetas', categoriaId ? { params: { categoria: categoriaId } } : {})
