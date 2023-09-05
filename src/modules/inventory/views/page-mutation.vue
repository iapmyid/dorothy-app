<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { BaseAutocomplete, BaseBreadcrumb, BaseDivider } from '@/components/index'
import { useNumeric } from '@/composable/numeric'
import { usePagination } from '@/composable/pagination'
import { useRoute, useRouter } from 'vue-router'
import { useWarehouseApi } from '../api/warehouse'
import { useItemApi } from '../api/item'
import { format } from 'date-fns'
import axios from '@/axios'

const pagination = usePagination()
const numeric = useNumeric()
const route = useRoute()
const router = useRouter()
const warehouseApi = useWarehouseApi()
const itemApi = useItemApi()

const warehouse_id = ref('')
const item_id = ref('')
const size = ref('')

const selectedSize = ref()
watch(selectedSize, async () => {
  size.value = selectedSize.value?.label ?? ''
  await getInventories()
})

const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, async () => {
  warehouse_id.value = selectedWarehouse.value?.id ?? ''
  await getInventories()
})

const selectedItem = ref<{ id: string; label: string }>()
watch(selectedItem, async () => {
  item_id.value = selectedItem.value?.id ?? ''
  await getInventories()
})

export interface InventoryInterface {
  _id: string
  warehouse: {
    _id: string
    name: string
  }
  item: {
    _id: string
    name: string
    barcode: string
    color: string
    size: string
  }
  color: string
  size: string
  quantity: number
  reference: string
  reference_id: string
  createdAt: Date
}
const inventories = ref<InventoryInterface[]>([])

const getInventories = async (page = 1) => {
  const result = await axios.get('/v1/inventories/mutation', {
    params: {
      pageSize: 20,
      page: page,
      sort: '-createdAt',
      filter: {
        item_id: item_id.value,
        warehouse_id: warehouse_id.value,
        size: size.value
      }
    }
  })

  inventories.value = result.data.data

  pagination.page.value = result.data.pagination.page
  pagination.pageCount.value = result.data.pagination.pageCount
  pagination.pageSize.value = result.data.pagination.pageSize
  pagination.totalDocument.value = result.data.pagination.totalDocument
}

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
  await itemApi.fetchListItem()

  const page = Number(route.query.page ?? 1)
  await getInventories(page)
})

const paginatePrev = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.previousPage()
    }
  })
  await getInventories(pagination.previousPage())
}
const paginateNext = async () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: pagination.nextPage()
    }
  })
  await getInventories(pagination.nextPage())
}
const paginate = async (page: number) => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      page: page
    }
  })
  await getInventories(page)
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Inventory</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Inventory Report' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="flex flex-col gap-4">
          <div class="w-full flex flex-col gap-4">
            <div class="flex gap-4">
              <router-link to="/inventory" class="btn btn-secondary rounded-none space-x-1">
                <p>Inventory Report</p>
              </router-link>
              <router-link to="/inventory/mutation" class="btn btn-primary rounded-none space-x-1">
                <p>Mutation Report</p>
              </router-link>
            </div>
            <div class="w-full grid grid-cols-1 lg:grid-cols-3 gap-2">
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">Item</label>
                <component :is="BaseAutocomplete" v-model="selectedItem" :list="itemApi.listItem.value"></component>
              </div>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">Warehouse</label>
                <component
                  :is="BaseAutocomplete"
                  v-model="selectedWarehouse"
                  :list="warehouseApi.listWarehouse.value"
                ></component>
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
                    <p>Reference</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Warehouse</p>
                  </th>
                  <th class="basic-table-head">
                    <p>Barcode</p>
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
                  <th class="basic-table-head text-right">
                    <p>Quantity</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="inventories.length > 0">
                  <tr v-for="inventory in inventories" :key="inventory._id" class="basic-table-row">
                    <td class="basic-table-body">{{ format(new Date(inventory.createdAt), 'dd-MM-yyyy HH:mm') }}</td>
                    <td class="basic-table-body">
                      <router-link
                        v-if="inventory.reference === 'purchase'"
                        class="text-blue-500"
                        :to="`/purchase/${inventory.reference_id}`"
                      >
                        {{ inventory.reference }}
                      </router-link>
                      <router-link
                        v-if="inventory.reference === 'transfer item'"
                        class="text-blue-500"
                        :to="`/transfer-item/${inventory.reference_id}`"
                      >
                        {{ inventory.reference }}
                      </router-link>
                      <router-link
                        v-if="inventory.reference === 'stock correction'"
                        class="text-blue-500"
                        :to="`/stock-correction/${inventory.reference_id}`"
                      >
                        {{ inventory.reference }}
                      </router-link>
                      <router-link
                        v-if="inventory.reference === 'stock opname'"
                        class="text-blue-500"
                        :to="`/stock-opname/${inventory.reference_id}`"
                      >
                        {{ inventory.reference }}
                      </router-link>
                      <router-link
                        v-if="inventory.reference === 'pos'"
                        class="text-blue-500"
                        :to="`/pos/${inventory.reference_id}`"
                      >
                        {{ inventory.reference }}
                      </router-link>
                    </td>
                    <td class="basic-table-body">{{ inventory.warehouse?.name }}</td>
                    <td class="basic-table-body">{{ inventory.item?.barcode }}</td>
                    <td class="basic-table-body">{{ inventory.item?.name }}</td>
                    <td class="basic-table-body">{{ inventory.color }}</td>
                    <td class="basic-table-body">{{ inventory.size }}</td>
                    <td class="basic-table-body text-right">{{ numeric.format(inventory.quantity) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="w-full flex items-center justify-between">
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
