import { useAuthStore } from '@/stores/auth'

export function useAuthorization() {
  const authStore = useAuthStore()

  const isAuthorize = (allowedRoles: string[]) => {
    return allowedRoles.includes(authStore.$state.user.role)
  }

  return {
    isAuthorize
  }
}
