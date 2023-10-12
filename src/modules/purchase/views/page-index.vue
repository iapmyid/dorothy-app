<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { watchDebounced } from '@vueuse/core'
import { useNumeric } from '@/composable/numeric'
import { usePagination } from '@/composable/pagination'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'
import Excel from 'exceljs'
import { saveAs } from 'file-saver'

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
  size: {
    label: string
    quantity: number
    barcode: string
  }[]
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

const exportBarcodeThisPage = async () => {
  const workbook = new Excel.Workbook()
  const worksheet = workbook.addWorksheet('Sheet 1')

  const sheetColumns = [
    { key: 'name', header: 'name' },
    { key: 'barcode', header: 'barcode' },
    { key: 'price', header: 'price' },
    { key: 'description', header: 'description' }
  ]

  worksheet.columns = sheetColumns

  purchases.value.forEach((element) => {
    element.size.forEach((size) => {
      if (size.barcode) {
        for (let i = 0; i < size.quantity; i++) {
          worksheet.addRow({
            name: element.name.toUpperCase(),
            barcode: size.barcode,
            price: `Rp ${element.sellingPrice}`,
            description: `${size.barcode}    ${size.label.toUpperCase()} - ${element.color.toUpperCase()}`
          })
        }
      }
    })
  })

  workbook.xlsx.writeBuffer().then(function (buffer) {
    saveAs(
      new Blob([buffer], { type: 'application/octet-stream' }),
      `${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}-dorothy-barcode.xlsx`
    )
  })
}

const exportBarcode = async () => {
  const workbook = new Excel.Workbook()
  const worksheet = workbook.addWorksheet('Sheet 1')

  const sheetColumns = [
    { key: 'name', header: 'name' },
    { key: 'barcode', header: 'barcode' },
    { key: 'price', header: 'price' },
    { key: 'description', header: 'description' }
  ]

  worksheet.columns = sheetColumns

  worksheet.addRow({
    name: 'EXAMPLE ITEM',
    barcode: 20230101,
    price: 'Rp. 250.000',
    description: '20230101    XL - MAGENTA'
  })

  worksheet.addRow({
    name: 'EXAMPLE ITEM 2',
    barcode: 20230102,
    price: 'Rp. 250.000',
    description: '20230102    L - MAGENTA'
  })

  worksheet.addRow({
    name: 'EXAMPLE ITEM 3',
    barcode: 20230103,
    price: 'Rp. 250.000',
    description: '20230103    YELLOW'
  })

  workbook.xlsx.writeBuffer().then(function (buffer) {
    saveAs(
      new Blob([buffer], { type: 'application/octet-stream' }),
      `${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}-dorothy-barcode.xlsx`
    )
  })
}

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
              <button @click="exportBarcodeThisPage()" class="btn btn-secondary rounded-none space-x-1">
                <i class="i-far-print block"></i>
                <p>Export Barcode on This Page</p>
              </button>
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
                    <p>Barcode</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Date</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Name</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Barcode</p>
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
                </tr>
              </thead>
              <tbody>
                <template v-if="purchases.length > 0">
                  <tr v-for="purchase in purchases" :key="purchase._id" class="basic-table-row">
                    <td class="basic-table-body flex space-x-3 text-center justify-center">
                      <router-link to="/">
                        <i class="block h-5 w-5 i-far-file-excel"></i>
                      </router-link>
                      <button>
                        <i class="block h-5 w-5 i-far-barcode-read"></i>
                      </button>
                    </td>
                    <td class="basic-table-body">
                      {{ format(new Date(purchase.createdAt), 'dd MMM yyyy HH:mm') }}
                    </td>
                    <td class="basic-table-body">
                      <router-link :to="`/purchase/${purchase._id}`" class="text-info">{{ purchase.name }}</router-link>
                    </td>
                    <td class="basic-table-body">
                      <template v-for="size in purchase.size" :key="size.barcode">
                        <p class="whitespace-nowrap" v-if="size.quantity">
                          <span class="font-bold">{{ size.label }}</span> {{ size.barcode }}
                        </p>
                      </template>
                    </td>
                    <td class="basic-table-body">{{ purchase.warehouse?.name }}</td>
                    <td class="basic-table-body">{{ purchase.supplier?.name }}</td>
                    <td class="basic-table-body">{{ purchase.itemCategory?.name }}</td>
                    <td class="basic-table-body">{{ purchase.color }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(purchase.totalQuantity) }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(purchase.price) }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(purchase.sellingPrice) }}</td>
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
