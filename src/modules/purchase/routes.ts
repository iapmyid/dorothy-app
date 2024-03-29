import { useAuthorization } from '@/composable/authorization'
import { useAuthStore } from '@/stores/auth'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export const routes = {
  path: '/purchase',
  children: [
    {
      path: '',
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
          path: ':id/barcode',
          component: () => import('./views/page-barcode.vue')
        },
        {
          path: 'all-barcode',
          component: () => import('./views/page-all-barcode.vue')
        }
      ]
    },
    {
      path: ':id/barcode/print',
      component: () => import('./views/page-barcode-print.vue')
    },
    {
      path: 'all-barcode/print',
      component: () => import('./views/page-all-barcode-print.vue')
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
