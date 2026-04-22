const AUTH_STORAGE_KEY = 'architectauto-auth'

export const saveAuthSession = ({ user, token }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }))
}

export const getAuthSession = () => {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
