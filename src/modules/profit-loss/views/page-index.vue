<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseDatepicker } from '@/components/index'
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

const onSearch = async () => {
  await getFinances()
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
    description: string
    value: number
  }[]
  createdAt: Date
}

const formDateFrom = ref(format(new Date(), 'dd/MM/yyyy'))
const formDateTo = ref(format(new Date(), 'dd/MM/yyyy'))
const dateFrom = ref(format(new Date(), 'yyyy-MM-dd'))
const dateTo = ref(format(new Date(), 'yyyy-MM-dd'))
const totalIncome = ref(0)
const totalExpense = ref(0)
const finances = ref<PosInterface[]>([])

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getFinances = async (page = 1, search = '') => {
  const result = await axios.get('/v1/finances', {
    params: {
      pageSize: 9999999,
      page: 1,
      filter: {
        dateFrom: dateFrom.value,
        dateTo: dateTo.value
      }
    }
  })

  finances.value = result.data.data

  finances.value.forEach((el) => {
    if (el.value < 0) {
      totalExpense.value += el.value
    } else {
      totalIncome.value += el.value
    }
  })

  pagination.page.value = result.data.pagination.page
  pagination.pageCount.value = result.data.pagination.pageCount
  pagination.pageSize.value = result.data.pagination.pageSize
  pagination.totalDocument.value = result.data.pagination.totalDocument
}

onMounted(async () => {
  const page = Number(route.query.page ?? 1)
  searchAll.value = route.query.search?.toString() ?? ''
  await getFinances(page, searchAll.value)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getFinances(pagination.previousPage(), searchAll.value)
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getFinances(pagination.nextPage(), searchAll.value)
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getFinances(page, searchAll.value)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Proft & Loss</h1>
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
                    <p>Description</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Income</p>
                  </th>
                  <th class="basic-table-head text-right">
                    <p>Expense</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="finances.length > 0">
                  <template v-for="finance in finances" :key="finance._id">
                    <tr class="basic-table-row">
                      <td class="basic-table-body">
                        <router-link :to="`/purchase/${finance.reference_id}`" class="text-info">
                          {{ format(new Date(finance.createdAt), 'dd MMM yyyy HH:mm') }}
                        </router-link>
                      </td>
                      <td class="basic-table-body">{{ finance.description }}</td>
                      <td class="basic-table-body text-right">
                        <template v-if="finance.value > 0">{{ numeric.format(finance.value) }}</template>
                      </td>
                      <td class="basic-table-body text-right">
                        <template v-if="finance.value < 0">{{ numeric.format(finance.value * -1) }}</template>
                      </td>
                    </tr>
                  </template>
                  <tr class="basic-table-row">
                    <td class="basic-table-body"></td>
                    <td class="basic-table-body font-bold text-right">Total</td>
                    <td class="basic-table-body font-bold text-right">{{ numeric.format(totalIncome) }}</td>
                    <td class="basic-table-body font-bold text-right">{{ numeric.format(totalExpense * -1) }}</td>
                  </tr>
                  <tr class="basic-table-row">
                    <td class="basic-table-body"></td>
                    <td class="basic-table-body"></td>
                    <td class="basic-table-body font-bold text-right">Profit & Loss</td>
                    <td class="basic-table-body font-bold text-right">
                      {{ numeric.format(totalIncome + totalExpense) }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="w-full flex finances-center justify-between">
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
