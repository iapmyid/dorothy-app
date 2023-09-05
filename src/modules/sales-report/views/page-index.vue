<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { BaseBreadcrumb, BaseAutocomplete } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseDatepicker } from '@/components/index'
import { useNumeric } from '@/composable/numeric'
import { usePagination } from '@/composable/pagination'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'
import { useWarehouseApi } from '../api/warehouse'

const warehouseApi = useWarehouseApi()
const pagination = usePagination()
const numeric = useNumeric()
const route = useRoute()
const router = useRouter()

const searchAll = ref('')

const onSearch = async () => {
  await getListPos()
}

export interface PosInterface {
  _id: string
  date: string
  warehouse: {
    name: string
  }
  customer: {
    name: string
  }
  items: {
    _id: string
    name: string
    size: string
    price: number
    quantity: number
    total: number
  }[]
  totalQuantity: number
  discount: number
  totalPrice: number
  paymentType: number
  createdAt: Date
}

const formDateFrom = ref(format(new Date(), 'dd/MM/yyyy'))
const formDateTo = ref(format(new Date(), 'dd/MM/yyyy'))
const dateFrom = ref(format(new Date(), 'yyyy-MM-dd'))
const dateTo = ref(format(new Date(), 'yyyy-MM-dd'))
const warehouse_id = ref('')
const total = ref(0)
const listPos = ref<PosInterface[]>([])
const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, () => {
  warehouse_id.value = selectedWarehouse.value?.id ?? ''
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getListPos = async (page = 1, search = '') => {
  const result = await axios.get('/v1/pos', {
    params: {
      pageSize: 9999999,
      page: 1,
      filter: {
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        warehouse_id: warehouse_id.value
      }
    }
  })

  listPos.value = result.data.data

  listPos.value.forEach((el) => {
    total.value += el.totalPrice
  })

  pagination.page.value = result.data.pagination.page
  pagination.pageCount.value = result.data.pagination.pageCount
  pagination.pageSize.value = result.data.pagination.pageSize
  pagination.totalDocument.value = result.data.pagination.totalDocument
}

onMounted(async () => {
  const page = Number(route.query.page ?? 1)
  searchAll.value = route.query.search?.toString() ?? ''
  await warehouseApi.fetchListWarehouse()
  selectedWarehouse.value = warehouseApi.listWarehouse.value[0]
  warehouse_id.value = selectedWarehouse.value.id
  await getListPos(page, searchAll.value)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getListPos(pagination.previousPage(), searchAll.value)
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getListPos(pagination.nextPage(), searchAll.value)
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getListPos(page, searchAll.value)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Sales Report</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Pos' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex item-center gap-4">
            <div class="w-full flex space-x-2">
              <component
                :is="BaseDatepicker"
                required
                v-model="formDateFrom"
                @iso-value="(val) => (dateFrom = format(new Date(val), 'yyyy-MM-dd'))"
                label="Date From"
              ></component>
              <component
                :is="BaseDatepicker"
                required
                v-model="formDateTo"
                @iso-value="(val) => (dateTo = format(new Date(val), 'yyyy-MM-dd'))"
                label="Date To"
              ></component>
              <div class="flex flex-col items-start">
                <label class="text-sm font-bold">
                  Warehouse
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedWarehouse"
                  :list="warehouseApi.listWarehouse.value"
                ></component>
              </div>
              <div class="flex flex-col justify-end items-end">
                <button class="btn btn-primary btn-sm" @click="onSearch">Search</button>
              </div>
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
                    <p>Size</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Quantity</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Price</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Total</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="listPos.length > 0">
                  <template v-for="pos in listPos" :key="pos._id">
                    <template v-for="posItem in pos.items" :key="posItem._id">
                      <tr class="basic-table-row">
                        <td class="basic-table-body">
                          <router-link :to="`/pos/${pos._id}`" class="text-info">
                            {{ format(new Date(pos.createdAt), 'dd MMM yyyy HH:mm') }}
                          </router-link>
                        </td>
                        <td class="basic-table-body">{{ posItem.name }}</td>
                        <td class="basic-table-body">{{ posItem.size }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(posItem.quantity) }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(posItem.price) }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(posItem.total) }}</td>
                      </tr>
                    </template>
                    <tr class="basic-table-row" v-if="pos.discount > 0">
                      <td class="basic-table-body">
                        <router-link :to="`/pos/${pos._id}`" class="text-info">
                          {{ format(new Date(pos.createdAt), 'dd MMM yyyy HH:mm') }}
                        </router-link>
                      </td>
                      <td class="basic-table-body"></td>
                      <td class="basic-table-body"></td>
                      <td class="basic-table-body text-right"></td>
                      <td class="basic-table-body text-right">Discount Member</td>
                      <td class="basic-table-body text-right">-{{ numeric.format(pos.discount) }}</td>
                    </tr>
                  </template>
                  <tr class="basic-table-row">
                    <td class="basic-table-body"></td>
                    <td class="basic-table-body"></td>
                    <td class="basic-table-body"></td>
                    <td class="basic-table-body text-right"></td>
                    <td class="basic-table-body font-bold text-right">Total</td>
                    <td class="basic-table-body font-bold text-right">{{ numeric.format(total) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="w-full flex listPos-center justify-between">
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
