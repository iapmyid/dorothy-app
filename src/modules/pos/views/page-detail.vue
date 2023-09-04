<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseNumeric } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'
import { useNumeric } from '@/composable/numeric'

const route = useRoute()
const router = useRouter()
const numeric = useNumeric()

export interface PosInterface {
  _id: string
  date: string
  warehouse: {
    name: string
  }
  customer: {
    name: string
  }
  createdBy: {
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
  subtotal: number
  discount: number
  totalQuantity: number
  totalPrice: number
  paymentType: string
  createdAt: string | Date
}

const form = ref<PosInterface>({
  _id: '',
  date: '',
  warehouse: {
    name: ''
  },
  customer: {
    name: ''
  },
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  discount: 0,
  totalPrice: 0,
  paymentType: '',
  createdAt: '',
  createdBy: {
    name: ''
  }
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/pos/${route.params.id}`)

    if (result.status === 200) {
      form.value._id = result.data._id
      form.value.date = format(new Date(result.data.createdAt), 'dd MMM yyyy HH:mm')
      form.value.warehouse.name = result.data.warehouse?.name
      form.value.customer.name = result.data.customer?.name
      form.value.items = result.data.items
      form.value.totalQuantity = result.data.totalQuantity
      form.value.subtotal = result.data.subtotal
      form.value.discount = result.data.discount
      form.value.totalPrice = result.data.totalPrice
      form.value.paymentType = result.data.paymentType
      form.value.createdAt = format(new Date(result.data.createdAt), 'dd MMM yyyy HH:mm')
      form.value.createdBy.name = result.data.createdBy?.name
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
      <h1>Pos</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Pos', path: '/pos' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>Show Sales</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div class="space-x-3">
              <router-link to="/pos/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
              <!-- <button type="button" class="btn btn-danger btn-sm rounded-none space-x-1">
                <i class="i-far-trash block"></i>
                <span>Delete</span>
              </button> -->
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <component :is="BaseInput" readonly layout="horizontal" v-model="form.date" label="Date"></component>
            <component
              :is="BaseInput"
              readonly
              layout="horizontal"
              v-model="form.createdBy.name"
              label="Cashier"
            ></component>
            <component
              :is="BaseInput"
              readonly
              layout="horizontal"
              v-model="form.warehouse.name"
              label="Warehouse"
            ></component>
            <component
              :is="BaseInput"
              readonly
              layout="horizontal"
              v-model="form.customer.name"
              label="Customer"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.totalQuantity"
              label="Total Quantity"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.subtotal"
              label="Subtotal"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.discount"
              label="Discount"
            ></component>
            <component
              :is="BaseNumeric"
              readonly
              layout="horizontal"
              v-model="form.totalPrice"
              label="Total Invoice"
            ></component>
            <component
              :is="BaseInput"
              readonly
              layout="horizontal"
              v-model="form.paymentType"
              label="Payment Type"
            ></component>

            <h3>Items</h3>
            <table class="table text-sm">
              <thead>
                <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
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
                <tr v-for="formItem in form.items" :key="formItem._id" class="basic-table-row">
                  <td class="basic-table-body">{{ formItem.name }}</td>
                  <td class="basic-table-body">{{ formItem.size }}</td>
                  <td class="basic-table-body text-right">{{ numeric.format(formItem.quantity) }}</td>
                  <td class="basic-table-body text-right">{{ numeric.format(formItem.price) }}</td>
                  <td class="basic-table-body text-right">{{ numeric.format(formItem.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
