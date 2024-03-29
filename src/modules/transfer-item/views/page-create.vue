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
  barcode: string
  itemCategory: {
    name: string
  }
  sellingPrice: number
}

const items = ref<ItemInterface[]>([])
const totalQuantity = ref(0)

const findBarcode = async () => {
  if (!searchAll.value) {
    return
  }

  try {
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

    await getInventories(items.value[0]._id, form.value.warehouseOrigin_id, items.value[0].color, items.value[0].size)

    let qty = 1
    if (index >= 0) {
      qty = form.value.items[index]?.quantity + 1
    }

    // stock unavailable
    if (inventories.value.length === 0 || qty > inventories.value[0].quantity) {
      notification('Stock Unavailable', '', { type: TypesEnum.Warning })
      return
    }

    // stock unavailable
    if (form.value.items[index] && form.value.items[index].quantity >= inventories.value[0].quantity) {
      notification('Stock Unavailable', '', { type: TypesEnum.Warning })
      return
    }

    if (index >= 0) {
      form.value.items[index].available = inventories.value[0].quantity
      form.value.items[index].quantity += 1
      form.value.items[index].total += items.value[0].sellingPrice
    } else {
      form.value.items.push({
        _id: items.value[0]._id,
        name: items.value[0].name,
        size: items.value[0].size,
        color: items.value[0].color,
        barcode: items.value[0].barcode,
        available: inventories.value[0].quantity,
        quantity: 1,
        price: items.value[0].sellingPrice,
        total: items.value[0].sellingPrice
      })
    }

    totalQuantity.value += 1
  } catch (error) {
    notification('Item not found', '', { type: TypesEnum.Warning })
  } finally {
    searchAll.value = ''
  }
}

const formDate = ref(format(new Date(), 'dd/MM/yyyy'))

const form = ref<{
  date: string
  warehouseOrigin_id: string
  warehouseDestination_id: string
  items: {
    _id: string
    name: string
    size: string
    color: string
    available: number
    quantity: number
    price: number
    total: number
  }[]
}>({
  date: format(new Date(), 'yyyy-MM-dd'),
  warehouseOrigin_id: '',
  warehouseDestination_id: '',
  items: []
})

const selectedWarehouseOrigin = ref<{ id: string; label: string }>()
watch(selectedWarehouseOrigin, async () => {
  form.value.warehouseOrigin_id = selectedWarehouseOrigin.value?.id ?? ''
  form.value.items = []
})
const selectedWarehouseDestination = ref<{ id: string; label: string }>()
watch(selectedWarehouseDestination, () => {
  form.value.warehouseDestination_id = selectedWarehouseDestination.value?.id ?? ''
})

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
  selectedWarehouseOrigin.value = warehouseApi.listWarehouse.value[0]
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

const removeRow = (index: number) => {
  totalQuantity.value -= form.value.items[index].quantity
  form.value.items.splice(index, 1)
}

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    const response = await axios.post('/v1/transfer-items', form.value)

    if (response.status === 201) {
      router.push('/transfer-item')
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
      <h1>Transfer Item</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Transfer Item', path: '/transfer-item' }, { name: 'Create' }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>New Transfer Item</h2>
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
                  Warehouse Origin
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedWarehouseOrigin"
                  :list="warehouseApi.listWarehouse.value"
                ></component>
              </div>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Warehouse Destination
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedWarehouseDestination"
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
                      <th class="basic-table-head"></th>
                      <th class="basic-table-head">
                        <p>Barcode</p>
                      </th>
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
                        <p>Stock</p>
                      </th>
                      <th class="basic-table-head text-right">
                        <p>Quantity</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="form.items.length > 0">
                      <tr v-for="(item, index) in form.items" :key="item._id">
                        <td class="basic-table-body w-0">
                          <button type="button" @click="removeRow(index)" class="btn btn-xs btn-outline-danger">
                            X
                          </button>
                        </td>
                        <td class="basic-table-body">{{ item.barcode }}</td>
                        <td class="basic-table-body">{{ item.name }}</td>
                        <td class="basic-table-body">{{ item.size }}</td>
                        <td class="basic-table-body">{{ item.color }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(item.available) }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(item.quantity) }}</td>
                      </tr>
                    </template>
                    <tr>
                      <td class="basic-table-body text-right font-bold w-0" colspan="6">Total Quantity</td>
                      <td class="basic-table-body text-right">{{ numeric.format(totalQuantity) }}</td>
                    </tr>
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
