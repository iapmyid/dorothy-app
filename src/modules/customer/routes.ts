import { useAuthorization } from '@/composable/authorization'
import { useAuthStore } from '@/stores/auth'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export const routes = {
  path: '/customer',
  component: () => import('@/layouts/app/app-index.vue'),
  children: [
    {
      path: '',
      component: () => import('./views/page-index.vue')
    },
    {
      path: 'create',
      component: () => import('./views/page-create.vue')
    },
    {
      path: ':id',
      component: () => import('./views/page-detail.vue')
    },
    {
      path: ':id/edit',
      component: () => import('./views/page-edit.vue')
    }
  ],
  beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()
    const authorization = useAuthorization()
    if (
      !(await authStore.isAuthenticated()) ||
      !authorization.isAuthorize(['administrator', 'admin purchasing', 'admin stock', 'cashier'])
    ) {
      next('/signin')
    } else {
      next()
    }
  }
}
