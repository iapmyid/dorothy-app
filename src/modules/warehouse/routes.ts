import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export const routes = {
  path: '/warehouse',
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
    },
  ],
  beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    next()
  },
}
