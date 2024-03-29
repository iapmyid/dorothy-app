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

export interface TransferItemInterface {
  _id: string
  items: {
    name: string
    color: string
    size: string
    _id: string
    quantity: number
  }[]
  warehouse: {
    name: string
  }
  createdAt: Date
}
const stockCorrections = ref<TransferItemInterface[]>([])

const getTransferItems = async (page = 1, search = '') => {
  const result = await axios.get('/v1/stock-corrections', {
    params: {
      pageSize: 10,
      page: page,
      sort: 'item.name',
      filter: {
        item: { name: search }
      }
    }
  })

  stockCorrections.value = result.data.data

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
    await getTransferItems(1, searchAll.value)
    isLoadingSearch.value = false
  },
  { debounce: 500, maxWait: 1000 }
)

onMounted(async () => {
  const page = Number(route.query.page ?? 1)
  searchAll.value = route.query.search?.toString() ?? ''
  await getTransferItems(page, searchAll.value)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getTransferItems(pagination.previousPage(), searchAll.value)
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getTransferItems(pagination.nextPage(), searchAll.value)
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getTransferItems(page, searchAll.value)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Stock Correction</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Stock Correction' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex stockCorrections-center gap-4">
            <div class="w-full flex space-x-2">
              <router-link to="/stock-correction/create" class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-pen-to-square block"></i>
                <p>Add New</p>
              </router-link>
              <component :is="BaseInput" v-model="searchAll" placeholder="Search" border="full" class="flex-1">
                <template #prefix>
                  <i class="i-far-magnifying-glass mx-3 block"></i>
                </template>
              </component>
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
                    <p>Item</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Color</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Size</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Warehouse</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Quantity</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="stockCorrections.length > 0">
                  <template v-for="stockCorrection in stockCorrections" :key="stockCorrection._id">
                    <tr
                      v-for="item in stockCorrection.items"
                      :key="stockCorrection._id + item._id"
                      class="basic-table-row"
                    >
                      <td class="basic-table-body">
                        {{ format(new Date(stockCorrection.createdAt), 'dd MMM yyyy HH:mm') }}
                      </td>
                      <td class="basic-table-body">
                        <router-link :to="`/stock-correction/${stockCorrection._id}`" class="text-info">
                          {{ item.name }}
                        </router-link>
                      </td>
                      <td class="basic-table-body">
                        {{ item.color }}
                      </td>
                      <td class="basic-table-body">
                        {{ item.size }}
                      </td>
                      <td class="basic-table-body">{{ stockCorrection.warehouse.name }}</td>
                      <td class="basic-table-body text-right">{{ numeric.format(item.quantity) }}</td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
          <div class="w-full flex stockCorrections-center justify-between">
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
              <template v-for="page in pagination.pageCount.value" :key="page">
                <button
                  v-if="page + 5 > pagination.page.value && page - 5 < pagination.page.value"
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
              </template>

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
