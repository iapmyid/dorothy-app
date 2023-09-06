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
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useItemCategoryApi } from '../api/item-category'
import { useSupplierApi } from '../api/supplier'
import { useWarehouseApi } from '../api/warehouse'
import axios from '@/axios'
import WebCamUI from '@/components/base-webcam-ui.vue'

const { notification } = useBaseNotification()
const router = useRouter()
const itemCategoryApi = useItemCategoryApi()
const supplierApi = useSupplierApi()
const warehouseApi = useWarehouseApi()
const formDate = ref(format(new Date(), 'dd/MM/yyyy'))
interface FormInterface {
  date: string
  photo: string
  files: any[]
  warehouse_id: string
  supplier_id: string
  itemCategory_id: string
  code: string
  name: string
  color: string
  size: { label: string; quantity: number }[]
  totalQuantity: number
  price: number
  cargoPrice: number
  totalPrice: number
  totalPricePerItem: number
  profitMargin: number
  totalProfit: number
  totalSelling: number
  sellingPrice: number
}
const form = ref<FormInterface>({
  date: format(new Date(), 'yyyy-MM-dd'),
  photo: '',
  files: [],
  warehouse_id: '',
  supplier_id: '',
  itemCategory_id: '',
  code: '',
  name: '',
  color: '',
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
  cargoPrice: 0,
  totalPrice: 0,
  totalPricePerItem: 0,
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
  form.value.totalPrice = Number(form.value.totalQuantity) * (Number(form.value.price) + Number(form.value.cargoPrice))
  form.value.totalPricePerItem = Number(form.value.price) + Number(form.value.cargoPrice)
}

const calculateProfit = () => {
  form.value.totalProfit = (Number(form.value.profitMargin) / 100) * Number(form.value.totalPrice)
  form.value.totalSelling = Number(form.value.totalPrice) + Number(form.value.totalProfit)
  if (form.value.totalSelling > 0) {
    form.value.sellingPrice = Number(form.value.totalSelling / form.value.totalQuantity)
  }
}

const photoTaken = (event: any) => {
  form.value.files.push(event)
}

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
  await warehouseApi.fetchListWarehouse()
  selectedWarehouse.value = warehouseApi.listWarehouse.value[0]
  await supplierApi.fetchListSupplier()
  await itemCategoryApi.fetchListItemCategory()
})

const errors = ref()
const isSubmitted = ref(false)

const reverseCalculation = () => {
  form.value.totalSelling = form.value.sellingPrice * form.value.totalQuantity
  form.value.totalProfit = form.value.totalSelling - form.value.totalPrice
  form.value.profitMargin = (form.value.totalProfit / form.value.totalPrice) * 100
}

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    const response = await axios.post('/v1/purchases', form.value)
    if (form.value.files.length) {
      const formData = new FormData()
      formData.append('_id', response.data._id)
      formData.append('name', form.value.name)
      formData.append('color', form.value.color)
      for (let i = 0; i < form.value.files.length; i++) {
        formData.append('files[]', form.value.files[i].blob)
      }
      await axios.post('/v1/purchases/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    if (response.status === 201) {
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
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'Purchase', path: '/purchase' }, { name: 'Create' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 p-4 -mx-4 -my-2 font-extrabold">
          <h2>New Purchase</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
            <div class="space-y-2">
              <div class="w-full">
                <WebCamUI @photoTaken="photoTaken" />
              </div>
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
              <component :is="BaseInput" required v-model="form.color" label="Color"></component>

              <div class="bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
                <h3>Quantity per Size</h3>
              </div>
              <component
                :is="BaseNumeric"
                v-model="form.size[0].quantity"
                layout="horizontal"
                label="All Size"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[1].quantity"
                label="Size S"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[2].quantity"
                label="Size M"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[3].quantity"
                label="Size L"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.size[4].quantity"
                label="Size XL"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                readonly
                layout="horizontal"
                v-model="form.totalQuantity"
                label="Total"
              ></component>

              <div class="bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
                <h3>Buying Price</h3>
              </div>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.price"
                @keyup="calculateForm"
                label="Price per Item"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.cargoPrice"
                label="Cargo Price per Item"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.totalPricePerItem"
                label="Total Price per Item"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                readonly
                v-model="form.totalPrice"
                label="Total"
              ></component>

              <div class="bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
                <h3>Selling Price</h3>
              </div>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.profitMargin"
                label="Profit Margin (%)"
                @keyup="calculateForm"
              ></component>
              <component
                :is="BaseNumeric"
                readonly
                layout="horizontal"
                v-model="form.totalProfit"
                label="Total Profit"
              ></component>
              <component
                :is="BaseNumeric"
                readonly
                layout="horizontal"
                v-model="form.totalSelling"
                label="Total Selling"
              ></component>
              <component
                :is="BaseNumeric"
                layout="horizontal"
                v-model="form.sellingPrice"
                @keyup="reverseCalculation()"
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
