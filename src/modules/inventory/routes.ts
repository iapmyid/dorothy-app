import { useAuthorization } from '@/composable/authorization'
import { useAuthStore } from '@/stores/auth'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export const routes = {
  path: '/inventory',
  component: () => import('@/layouts/app/app-index.vue'),
  children: [
    {
      path: '',
      component: () => import('./views/page-index.vue')
    },
    {
      path: 'mutation',
      component: () => import('./views/page-mutation.vue')
    }
  ],
  beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()
    const authorization = useAuthorization()
    if (!(await authStore.isAuthenticated()) || !authorization.isAuthorize(['administrator', 'admin purchashing'])) {
      next('/signin')
    } else {
      next()
    }
  }
}
