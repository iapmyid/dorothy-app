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
import { routes as inventoryRoutes } from '@/modules/inventory/routes'
import { routes as transferItemRoutes } from '@/modules/transfer-item/routes'
import { routes as stockCorrectionRoutes } from '@/modules/stock-correction/routes'
import { routes as stockOpnameRoutes } from '@/modules/stock-opname/routes'
import { routes as salesReportRoutes } from '@/modules/sales-report/routes'
import { routes as branchExpenseRoutes } from '@/modules/branch-expense/routes'
import { routes as profitLossRoutes } from '@/modules/profit-loss/routes'
import { routes as posRoutes } from '@/modules/pos/routes'

const routes = [
  mainRoutes,
  authenticationRoutes,
  userRoutes,
  branchExpenseRoutes,
  warehouseRoutes,
  supplierRoutes,
  customerRoutes,
  itemCategoryRoutes,
  itemRoutes,
  purchaseRoutes,
  inventoryRoutes,
  transferItemRoutes,
  stockCorrectionRoutes,
  stockOpnameRoutes,
  salesReportRoutes,
  profitLossRoutes,
  posRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../modules/main/views/page-not-found.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  }
})

export default router
