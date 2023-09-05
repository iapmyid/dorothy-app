<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'
import { watchDebounced } from '@vueuse/core'
import { useNumeric } from '@/composable/numeric'
import { usePagination } from '@/composable/pagination'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'

const pagination = usePagination()
const numeric = useNumeric()
const route = useRoute()
const router = useRouter()

const searchAll = ref('')
const isLoadingSearch = ref(false)

export interface PurchaseInterface {
  _id: string
  code: string
  name: string
  size: []
  color: string
  totalQuantity: number
  price: number
  sellingPrice: number
  item: {
    _id: string
    name: string
  }
  warehouse: {
    name: string
  }
  supplier: {
    name: string
  }
  itemCategory: {
    name: string
  }
  createdAt: Date
}
const purchases = ref<PurchaseInterface[]>([])

const getPurchases = async (page = 1, search = '') => {
  const result = await axios.get('/v1/purchases', {
    params: {
      pageSize: 10,
      page: page,
      sort: 'name',
      filter: {
        name: search
      }
    }
  })

  purchases.value = result.data.data

  pagination.page.value = result.data.pagination.page
  pagination.pageCount.value = result.data.pagination.pageCount
  pagination.pageSize.value = result.data.pagination.pageSize
  pagination.totalDocument.value = result.data.pagination.totalDocument
}

watchDebounced(
  searchAll,
  async () => {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        page: pagination.previousPage(),
        search: searchAll.value
      }
    })
    isLoadingSearch.value = true
    await getPurchases(1, searchAll.value)
    isLoadingSearch.value = false
  },
  { debounce: 500, maxWait: 1000 }
)

onMounted(async () => {
  const page = Number(route.query.page ?? 1)
  searchAll.value = route.query.search?.toString() ?? ''
  await getPurchases(page, searchAll.value)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getPurchases(pagination.previousPage(), searchAll.value)
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getPurchases(pagination.nextPage(), searchAll.value)
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getPurchases(page, searchAll.value)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Purchase</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Purchase' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex purchases-center gap-4">
            <div class="w-full flex space-x-2">
              <router-link to="/purchase/create" class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-pen-to-square block"></i>
                <p>Add New</p>
              </router-link>
              <!-- <router-link to="/purchase/create" class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-print block"></i>
                <p>Print Barcode</p>
              </router-link> -->
              <!-- <component :is="BaseInput" v-model="searchAll" placeholder="Search" border="full" class="flex-1">
                <template #prefix>
                  <i class="i-far-magnifying-glass mx-3 block"></i>
                </template>
              </component> -->
            </div>
          </div>
          <div class="table-container">
            <table class="table text-sm">
              <thead>
                <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
                  <th class="basic-table-head">
                    <p>Date</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Name</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Warehouse</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Supplier</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Category</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Color</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Quantity</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Buying Price</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Selling Price</p>
                  </th>
                  <th class="basic-table-head text-center">
                    <p>Barcode</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="purchases.length > 0">
                  <tr v-for="purchase in purchases" :key="purchase._id" class="basic-table-row">
                    <td class="basic-table-body">
                      {{ format(new Date(purchase.createdAt), 'dd MMM yyyy HH:mm') }}
                    </td>
                    <td class="basic-table-body">
                      <router-link :to="`/purchase/${purchase._id}`" class="text-info">{{ purchase.name }}</router-link>
                    </td>
                    <td class="basic-table-body">{{ purchase.warehouse?.name }}</td>
                    <td class="basic-table-body">{{ purchase.supplier?.name }}</td>
                    <td class="basic-table-body">{{ purchase.itemCategory?.name }}</td>
                    <td class="basic-table-body">{{ purchase.color }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(purchase.totalQuantity) }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(purchase.price) }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(purchase.sellingPrice) }}</td>
                    <td class="basic-table-body text-center justify-center flex">
                      <a :href="`/purchase/${purchase._id}/barcode?count=${purchase.totalQuantity}`" target="_blank">
                        <i class="i-far-barcode-read block"></i>
                      </a>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="w-full flex purchases-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Showing {{ pagination.dataFrom() }} to {{ pagination.dataTo() }} of
                {{ pagination.totalDocument }} entries
              </p>
            </div>
            <div class="btn-group" v-if="pagination.pageCount.value > 1">
              <button @click="paginatePrev()" type="button" class="btn btn-light-dark rounded-r-none">
                <i class="i-fas-angle-left block"></i>
              </button>
              <button
                v-for="page in pagination.pageCount.value"
                :key="page"
                type="button"
                class="btn rounded border-r-none"
                :class="{
                  'btn-secondary': page === pagination.page.value,
                  'btn-light-dark': page !== pagination.page.value
                }"
                @click="paginate(page)"
              >
                {{ page }}
              </button>
              <button @click="paginateNext()" type="button" class="btn btn-light-dark rounded-l-none">
                <i class="i-fas-angle-right block"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
