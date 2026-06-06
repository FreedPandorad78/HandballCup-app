import { createContext, useState, useCallback } from 'react'
import { login as apiLogin } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hc_token'))

  const login = useCallback(async (username, password) => {
    const { data } = await apiLogin(username, password)
    localStorage.setItem('hc_token', data.access_token)
    setToken(data.access_token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hc_token')
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
