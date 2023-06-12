export const routes = {
  path: '/',
  children: [
    {
      path: '/signin',
      component: () => import('./views/page-signin.vue')
    }
  ]
}
