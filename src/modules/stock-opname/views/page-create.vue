<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseDatepicker, BaseInput, BaseAutocomplete } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useItemApi } from '../api/item'
import { useWarehouseApi } from '../api/warehouse'
import { useNumeric } from '@/composable/numeric'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()
const itemApi = useItemApi()
const warehouseApi = useWarehouseApi()
const numeric = useNumeric()

const searchAll = ref()

export interface ItemInterface {
  _id: string
  name: string
  color: string
  size: string
  photoUrl: string
  itemCategory: {
    name: string
  }
  sellingPrice: number
}

const items = ref<ItemInterface[]>([])

const findBarcode = async () => {
  if (!searchAll.value) {
    return
  }

  const result = await axios.get('/v1/items', {
    params: {
      pageSize: 100,
      page: 1,
      sort: 'name',
      filter: {
        barcode: searchAll.value
      }
    }
  })
  items.value = result.data.data

  const index = form.value.items.findIndex((el: any) => {
    return el._id === items.value[0]._id && el.size === items.value[0].size && el.color === items.value[0].color
  })

  await getInventories(items.value[0]._id, form.value.warehouse_id, items.value[0].color, items.value[0].size)

  let qty = 1
  if (index >= 0) {
    qty = form.value.items[index]?.quantity + 1
  }

  // stock unavailable
  if (inventories.value.length === 0 || qty > inventories.value[0].quantity) {
    notification('Stock Unavailable', '', { type: TypesEnum.Warning })
    return
  }

  if (index >= 0) {
    form.value.items[index].quantity += 1
    form.value.items[index].total += items.value[0].sellingPrice
  } else {
    form.value.items.push({
      _id: items.value[0]._id,
      name: items.value[0].name,
      size: items.value[0].size,
      color: items.value[0].color,
      quantity: 1,
      price: items.value[0].sellingPrice,
      total: items.value[0].sellingPrice
    })
  }

  searchAll.value = ''
}

const formDate = ref(format(new Date(), 'dd/MM/yyyy'))

const form = ref<{
  date: string
  warehouse_id: string
  items: {
    _id: string
    name: string
    size: string
    color: string
    quantity: number
    price: number
    total: number
  }[]
}>({
  date: format(new Date(), 'yyyy-MM-dd'),
  warehouse_id: '',
  items: []
})

const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, async () => {
  form.value.warehouse_id = selectedWarehouse.value?.id ?? ''
  form.value.items = []
})

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
  selectedWarehouse.value = warehouseApi.listWarehouse.value[0]
  await itemApi.fetchListItem()
})

const inventories = ref()
const getInventories = async (item_id: string, warehouse_id: string, color: string, size: string) => {
  const result = await axios.get('/v1/inventories', {
    params: {
      pageSize: 5,
      page: 1,
      sort: 'item.name',
      filter: {
        item_id: item_id,
        warehouse_id: warehouse_id,
        size: size,
        color: color
      }
    }
  })

  inventories.value = result.data.data
}

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    const response = await axios.post('/v1/stock-opnames', form.value)

    if (response.status === 201) {
      router.push('/stock-opname')
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      errors.value = error.response?.data.errors
      notification(error.response?.statusText, error.response?.data.message, { type: TypesEnum.Warning })
    } else if (error instanceof AxiosError) {
      notification(error.code as string, error.message, { type: TypesEnum.Warning })
    } else {
      notification('Unknown Error', '', { type: TypesEnum.Warning })
    }
  } finally {
    isSubmitted.value = false
  }
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Stock Opname</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Stock Opname', path: '/stock-opname' }, { name: 'Create' }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>New Stock Opname</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="" method="post" class="space-y-5">
            <div class="space-y-2">
              <component
                :is="BaseDatepicker"
                required
                readonly
                v-model="formDate"
                @iso-value="(val) => (form.date = format(new Date(val), 'yyyy-MM-dd'))"
                label="Date"
              ></component>
              <div class="flex flex-col items-start gap-1">
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
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Item
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseInput"
                  v-model="searchAll"
                  placeholder="Search"
                  border="simple"
                  class="flex-1"
                  @keyup.enter="findBarcode()"
                >
                  <template #prefix>
                    <i class="i-far-magnifying-glass mx-3 block"></i>
                  </template>
                </component>
              </div>
              <div class="table-container">
                <table class="table text-sm">
                  <thead>
                    <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
                      <th class="basic-table-head">
                        <p>Item</p>
                      </th>
                      <th class="basic-table-head">
                        <p>Size</p>
                      </th>
                      <th class="basic-table-head">
                        <p>Color</p>
                      </th>
                      <th class="basic-table-head text-right">
                        <p>Quantity</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="form.items.length > 0">
                      <tr v-for="item in form.items" :key="item._id">
                        <td class="basic-table-body">{{ item.name }}</td>
                        <td class="basic-table-body">{{ item.size }}</td>
                        <td class="basic-table-body">{{ item.color }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(item.quantity) }}</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
            <button type="button" class="btn btn-primary" @click="onSubmit()">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
