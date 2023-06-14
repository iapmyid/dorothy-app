import { createRouter, createWebHistory } from 'vue-router'

import { routes as mainRoutes } from '@/modules/main/routes'
import { routes as authenticationRoutes } from '@/modules/authentication/routes'
import { routes as userRoutes } from '@/modules/user/routes'
import { routes as warehouseRoutes } from '@/modules/warehouse/routes'
import { routes as supplierRoutes } from '@/modules/supplier/routes'
import { routes as customerRoutes } from '@/modules/customer/routes'
import { routes as itemCategoryRoutes } from '@/modules/item-category/routes'
import { routes as itemRoutes } from '@/modules/item/routes'
import { routes as purchaseRoutes } from '@/modules/purchase/routes'
import { routes as templateRoutes } from '@/modules/template/routes'

const routes = [
  mainRoutes,
  authenticationRoutes,
  userRoutes,
  warehouseRoutes,
  supplierRoutes,
  customerRoutes,
  itemCategoryRoutes,
  itemRoutes,
  purchaseRoutes,
  templateRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../modules/main/views/page-not-found.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
