<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import {
  BaseBreadcrumb,
  BaseDivider,
  BaseInput,
  BaseDatepicker,
  BaseNumeric,
  BaseAutocomplete
} from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useItemCategoryApi } from '../api/item-category'
import { useSupplierApi } from '../api/supplier'
import { useWarehouseApi } from '../api/warehouse'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()
const itemCategoryApi = useItemCategoryApi()
const supplierApi = useSupplierApi()
const warehouseApi = useWarehouseApi()

const formDate = ref(format(new Date(), 'dd/MM/yyyy'))
const route = useRoute()

const _id = ref('')

const form = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  warehouse_id: '',
  supplier_id: '',
  itemCategory_id: '',
  code: '',
  name: '',
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
  price: 0,
  totalPrice: 0,
  profitMargin: 0,
  totalProfit: 0,
  totalSelling: 0,
  sellingPrice: 0
})

const calculateForm = () => {
  calculateQuantity()
  calculatePrice()
  calculateProfit()
}

const calculateQuantity = () => {
  form.value.totalQuantity = 0
  form.value.size.forEach((el) => {
    form.value.totalQuantity += Number(el.quantity)
  })
}

const calculatePrice = () => {
  form.value.totalPrice = Number(form.value.totalQuantity) * Number(form.value.price)
}

const calculateProfit = () => {
  form.value.totalProfit = (Number(form.value.profitMargin) / 100) * Number(form.value.totalPrice)
  form.value.totalSelling = Number(form.value.totalPrice) + Number(form.value.totalProfit)
  if (form.value.totalSelling > 0) {
    form.value.sellingPrice = Number(form.value.totalSelling / form.value.totalQuantity)
  }
}

watch(
  () => [
    form.value.size[0].quantity,
    form.value.size[1].quantity,
    form.value.size[2].quantity,
    form.value.size[3].quantity,
    form.value.size[4].quantity,
    form.value.price,
    form.value.profitMargin
  ],
  () => {
    calculateForm()
  },
  { immediate: true }
)

const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, () => {
  form.value.warehouse_id = selectedWarehouse.value?.id ?? ''
})
const selectedSupplier = ref<{ id: string; label: string }>()
watch(selectedSupplier, () => {
  form.value.supplier_id = selectedSupplier.value?.id ?? ''
})
const selectedItemCategory = ref<{ id: string; label: string }>()
watch(selectedItemCategory, () => {
  form.value.itemCategory_id = selectedItemCategory.value?.id ?? ''
})

onMounted(async () => {
  try {
    await warehouseApi.fetchListWarehouse()
    await supplierApi.fetchListSupplier()
    await itemCategoryApi.fetchListItemCategory()

    const result = await axios.get(`/v1/purchases/${route.params.id}`)

    if (result.status === 200) {
      selectedWarehouse.value = { id: result.data.warehouse._id, label: result.data.warehouse.name }
      selectedSupplier.value = { id: result.data.supplier._id, label: result.data.supplier.name }
      selectedItemCategory.value = { id: result.data.itemCategory._id, label: result.data.itemCategory.name }

      _id.value = result.data._id
      form.value.warehouse_id = result.data.warehouse._id
      form.value.supplier_id = result.data.supplier._id
      form.value.itemCategory_id = result.data.itemCategory._id
      form.value.name = result.data.name
      form.value.totalQuantity = result.data.totalQuantity
      form.value.size = result.data.size
      form.value.price = result.data.price
      form.value.totalPrice = result.data.totalPrice
      form.value.profitMargin = result.data.profitMargin
      form.value.totalProfit = result.data.totalProfit
      form.value.totalSelling = result.data.totalSelling
      form.value.sellingPrice = result.data.sellingPrice
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.patch(`/v1/purchases/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/purchase')
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
      <h1>Purchase</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Purchase', path: '/purchase' },
          { name: route.params.id.toString(), path: `/purchase/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>Edit Purchase</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <component
                :is="BaseDatepicker"
                required
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
                  Supplier
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedSupplier"
                  :list="supplierApi.listSupplier.value"
                ></component>
              </div>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Item Category
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedItemCategory"
                  :list="itemCategoryApi.listItemCategory.value"
                ></component>
              </div>
              <component :is="BaseInput" required v-model="form.name" label="Item Name"></component>

              <h3>Quantity per Size</h3>
              <component
                :is="BaseNumeric"
                v-model="form.size[0].quantity"
                layout="horizontal"
                label="All Size"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[1].quantity"
                label="Size S"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[2].quantity"
                label="Size M"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[3].quantity"
                label="Size L"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
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

              <h3>Buying Price</h3>
              <component :is="BaseNumeric" layout="horizontal" v-model="form.price" label="Price"></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                readonly
                v-model="form.totalPrice"
                label="Total"
              ></component>

              <h3>Selling Price</h3>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.profitMargin"
                label="Profit Margin (%)"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.totalProfit"
                label="Total Profit"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.totalSelling"
                label="Total Selling"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.sellingPrice"
                label="Selling Price"
              ></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
