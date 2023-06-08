import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export const routes = {
  path: '/',
  component: () => import('@/layouts/app/app-index.vue'),
  children: [
    {
      path: '',
      component: () => import('./views/page-dashboard.vue')
    },
  ],
  beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    next('/signin')
  },
}
