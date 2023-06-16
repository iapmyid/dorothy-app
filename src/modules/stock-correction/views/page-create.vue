<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import {
  BaseBreadcrumb,
  BaseDivider,
  BaseDatepicker,
  BaseNumeric,
  BaseAutocomplete,
  BaseTextarea
} from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useItemApi } from '../api/item'
import { useWarehouseApi } from '../api/warehouse'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()
const itemApi = useItemApi()
const warehouseApi = useWarehouseApi()

const formDate = ref(format(new Date(), 'dd/MM/yyyy'))

const form = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  warehouse_id: '',
  item_id: '',
  size: [
    {
      label: 'all size',
      quantity: 0
    },
    {
      label: 's',
      quantity: 0
    },
    {
      label: 'm',
      quantity: 0
    },
    {
      label: 'l',
      quantity: 0
    },
    {
      label: 'xl',
      quantity: 0
    }
  ],
  totalQuantity: 0,
  notes: ''
})

const calculateForm = () => {
  calculateQuantity()
}

const calculateQuantity = () => {
  form.value.totalQuantity = 0
  form.value.size.forEach((el) => {
    form.value.totalQuantity += Number(el.quantity)
  })
}

watch(
  () => [
    form.value.size[0].quantity,
    form.value.size[1].quantity,
    form.value.size[2].quantity,
    form.value.size[3].quantity,
    form.value.size[4].quantity
  ],
  () => {
    calculateForm()
  },
  { immediate: true }
)

const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, async () => {
  form.value.warehouse_id = selectedWarehouse.value?.id ?? ''
  await getInventories()
})
const selectedItem = ref<{ id: string; label: string }>()
watch(selectedItem, async () => {
  form.value.item_id = selectedItem.value?.id ?? ''
  await getInventories()
})

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
  selectedWarehouse.value = warehouseApi.listWarehouse.value[0]
  await itemApi.fetchListItem()
})

const inventory = ref<{ [key: string]: number }>({})
const inventories = ref()
const getInventories = async () => {
  if (form.value.item_id && form.value.warehouse_id) {
    const result = await axios.get('/v1/inventories', {
      params: {
        pageSize: 20,
        page: 1,
        sort: 'item.name',
        filter: {
          item_id: form.value.item_id,
          warehouse_id: form.value.warehouse_id
        }
      }
    })

    inventories.value = result.data.data

    inventory.value = {}

    for (const iterator of inventories.value) {
      inventory.value[iterator.size] = iterator.quantity
    }
  } else {
    inventory.value = {}
  }
}

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    const response = await axios.post('/v1/stock-corrections', form.value)

    if (response.status === 201) {
      router.push('/stock-correction')
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
      <h1>Stock Correction</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Stock Correction', path: '/stock-correction' }, { name: 'Create' }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>New Stock Correction</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
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
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedItem"
                  :list="itemApi.listItem.value"
                ></component>
              </div>
              <h3>Quantity per Size</h3>
              <component
                :is="BaseNumeric"
                v-model="form.size[0].quantity"
                :helper="`Current Stock ${inventory['all size'] ?? 0}`"
                layout="horizontal"
                label="All Size"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                :helper="`Current Stock ${inventory['s'] ?? 0}`"
                v-model="form.size[1].quantity"
                label="Size S"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                :helper="`Current Stock ${inventory['m'] ?? 0}`"
                v-model="form.size[2].quantity"
                label="Size M"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                :helper="`Current Stock ${inventory['l'] ?? 0}`"
                v-model="form.size[3].quantity"
                label="Size L"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                :helper="`Current Stock ${inventory['xl'] ?? 0}`"
                v-model="form.size[4].quantity"
                label="Size XL"
              ></component>
              <component
                :is="BaseNumeric"
                readonly
                layout="horizontal"
                v-model="form.totalQuantity"
                label="Total"
              ></component>
              <component
                :is="BaseTextarea"
                v-model="form.notes"
                label="Notes"
                placeholder="Please write your reason here"
                border="simple"
              ></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
