<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseNumeric } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'

const route = useRoute()
const router = useRouter()

const form = ref({
  date: '',
  warehouse: {
    name: ''
  },
  supplier: {
    name: ''
  },
  itemCategory: {
    name: ''
  },
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
  color: '',
  photoUrl: '',
  totalQuantity: 0,
  price: 0,
  cargoPrice: 0,
  totalPricePerItem: 0,
  totalPrice: 0,
  profitMargin: 0,
  totalProfit: 0,
  totalSelling: 0,
  sellingPrice: 0,
  createdAt: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/purchases/${route.params.id}`)

    if (result.status === 200) {
      form.value.date = result.data.date
      form.value.warehouse = result.data.warehouse
      form.value.supplier = result.data.supplier
      form.value.itemCategory = result.data.itemCategory
      form.value.name = result.data.name
      form.value.size = result.data.size
      form.value.color = result.data.color
      form.value.photoUrl = result.data.photoUrl
      form.value.totalQuantity = result.data.totalQuantity
      form.value.price = result.data.price
      form.value.cargoPrice = result.data.cargoPrice
      form.value.totalPricePerItem = result.data.price + result.data.cargoPrice
      form.value.totalPrice = result.data.totalPrice
      form.value.profitMargin = result.data.profitMargin
      form.value.totalProfit = result.data.totalProfit
      form.value.totalSelling = result.data.totalSelling
      form.value.sellingPrice = result.data.sellingPrice
      form.value.createdAt = format(new Date(result.data.createdAt), 'dd MMM yyyy HH:mm')
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Purchase</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Purchase', path: '/purchase' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Purchase</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/purchase/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <div>
              <img :src="form.photoUrl" class="w-320px" alt="" />
            </div>
            <component :is="BaseInput" readonly v-model="form.createdAt" label="Date"></component>
            <component :is="BaseInput" readonly v-model="form.warehouse.name" label="Warehouse"></component>
            <component :is="BaseInput" readonly v-model="form.supplier.name" label="Supplier"></component>
            <component :is="BaseInput" readonly v-model="form.itemCategory.name" label="Item Category"></component>
            <component :is="BaseInput" readonly v-model="form.name" label="Item Name"></component>
            <component :is="BaseInput" readonly v-model="form.color" label="Color"></component>

            <div class="bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
              <h3>Quantity per Size</h3>
            </div>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.size[0].quantity"
              label="All Size"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.size[1].quantity"
              label="Size S"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.size[2].quantity"
              label="Size M"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.size[3].quantity"
              label="Size L"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
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

            <div class="bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
              <h3>Buying Price</h3>
            </div>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.price"
              label="Price per Item"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.cargoPrice"
              label="Cargo Price"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.totalPricePerItem"
              label="Total Price per Item"
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
              readonly
              layout="horizontal"
              v-model="form.profitMargin"
              label="Profit Margin (%)"
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
              readonly
              layout="horizontal"
              v-model="form.sellingPrice"
              label="Selling Price"
            ></component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
