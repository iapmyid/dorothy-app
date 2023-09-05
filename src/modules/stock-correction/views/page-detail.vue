<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb, BaseDivider, BaseInput } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'
import { useNumeric } from '@/composable/numeric'

const numeric = useNumeric()
const route = useRoute()
const router = useRouter()

const form = ref({
  date: '',
  warehouse: {
    name: ''
  },
  items: [],
  createdAt: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/stock-corrections/${route.params.id}`)

    if (result.status === 200) {
      form.value.date = result.data.date
      form.value.warehouse = result.data.warehouse
      form.value.items = result.data.items
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
      <h1>Stock Correction</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Stock Correction', path: '/stock-correction' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Stock Correction</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/stock-correction/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <component :is="BaseInput" readonly v-model="form.createdAt" label="Date"></component>
            <component :is="BaseInput" readonly v-model="form.warehouse.name" label="Warehouse "></component>
          </div>
        </div>
        <div class="table-container">
          <table class="table text-sm">
            <thead>
              <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
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
              <tr v-for="item in form.items" :key="form.items._id + item._id" class="basic-table-row">
                <td class="basic-table-body">
                  {{ item.name }}
                </td>
                <td class="basic-table-body">
                  {{ item.color }}
                </td>
                <td class="basic-table-body">
                  {{ item.size }}
                </td>
                <td class="basic-table-body text-right">{{ numeric.format(item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
