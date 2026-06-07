import api from './client'

export const getCategorias = () => api.get('/categorias/')
export const crearCategoria = (data) => api.post('/categorias/', data)
export const actualizarCategoria = (id, data) => api.put(`/categorias/${id}`, data)
export const eliminarCategoria = (id) => api.delete(`/categorias/${id}`)
