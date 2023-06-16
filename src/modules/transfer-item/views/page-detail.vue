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
  warehouseOrigin: {
    name: ''
  },
  warehouseDestination: {
    name: ''
  },
  item: {
    name: ''
  },
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
  createdAt: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/transfer-items/${route.params.id}`)

    if (result.status === 200) {
      form.value.date = result.data.date
      form.value.warehouseOrigin = result.data.warehouseOrigin
      form.value.warehouseDestination = result.data.warehouseDestination
      form.value.item = result.data.item
      form.value.size = result.data.size
      form.value.totalQuantity = result.data.totalQuantity
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
      <h1>Transfer Item</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Transfer Item', path: '/transfer-item' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>Show Transfer Item</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/transfer-item/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <component :is="BaseInput" readonly v-model="form.createdAt" label="Date"></component>
            <component :is="BaseInput" readonly v-model="form.warehouseOrigin.name" label="Warehouse"></component>
            <component :is="BaseInput" readonly v-model="form.warehouseDestination.name" label="Supplier"></component>
            <component :is="BaseInput" readonly v-model="form.item.name" label="Item Category"></component>

            <h3>Quantity per Size</h3>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
