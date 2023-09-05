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
  warehouseOrigin: {
    name: ''
  },
  warehouseDestination: {
    name: ''
  },
  items: [],
  createdAt: '',
  receivedAt: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/transfer-items/${route.params.id}`)

    if (result.status === 200) {
      form.value.date = result.data.date
      form.value.warehouseOrigin = result.data.warehouseOrigin
      form.value.warehouseDestination = result.data.warehouseDestination
      form.value.items = result.data.items
      form.value.receivedAt = result.data.receivedAt
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
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Transfer Item</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div class="space-x-3">
              <router-link to="/transfer-item/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
              <router-link
                v-if="!form.receivedAt"
                :to="`/transfer-item/${route.params.id}/receive`"
                class="btn btn-info btn-sm rounded-none space-x-1"
              >
                <i class="i-far-circle-plus block"></i>
                <span>Receive</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <component :is="BaseInput" readonly v-model="form.createdAt" label="Date"></component>
            <component
              :is="BaseInput"
              readonly
              v-model="form.warehouseOrigin.name"
              label="Warehouse Origin"
            ></component>
            <component
              :is="BaseInput"
              readonly
              v-model="form.warehouseDestination.name"
              label="Warehouse Destination"
            ></component>
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
                  <p>Quantity (Sent)</p>
                </th>
                <th class="basic-table-head text-right">
                  <p>Quantity (Received)</p>
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
                <td class="basic-table-body text-right">
                  {{ item.quantityReceived !== undefined ? numeric.format(item.quantityReceived) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
