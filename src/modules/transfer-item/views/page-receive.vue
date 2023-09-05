<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb, BaseDivider, BaseInput } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import axios from '@/axios'
import { useNumeric } from '@/composable/numeric'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { AxiosError } from 'axios'
const { notification } = useBaseNotification()
const numeric = useNumeric()
const route = useRoute()
const router = useRouter()

const searchAll = ref()
const findBarcode = async () => {
  if (!searchAll.value) {
    return
  }

  const index = form.value.items.findIndex((el: any) => {
    return el.barcode === searchAll.value
  })

  if (!form.value.items[index].quantityReceived) {
    form.value.items[index].quantityReceived = 1
  } else {
    form.value.items[index].quantityReceived += 1
  }

  searchAll.value = ''
}

export interface FormInterface {
  _id: string
  date: string
  warehouseOrigin: {
    name: string
  }
  warehouseDestination: {
    name: string
  }
  items: {
    name: string
    color: string
    size: string
    quantity: number
    quantityReceived: number
    quantityDiff: number
  }[]
  createdAt: string
  receivedAt: string
}

const form = ref<FormInterface>({
  _id: '',
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

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    form.value.items.forEach((el) => {
      el.quantityDiff = el.quantityReceived - el.quantity ?? 0
    })

    const response = await axios.post(`/v1/transfer-items/${form.value._id}/receive`, form.value)

    if (response.status === 204) {
      router.push('/transfer-item/' + route.params.id)
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

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/transfer-items/${route.params.id}`)

    if (result.status === 200) {
      form.value._id = result.data._id
      form.value.date = result.data.date
      form.value.warehouseOrigin = result.data.warehouseOrigin
      form.value.warehouseDestination = result.data.warehouseDestination
      form.value.items = result.data.items
      form.value.receivedAt = result.data.receivedAt
      form.value.createdAt = format(new Date(result.data.createdAt), 'dd MMM yyyy HH:mm')

      form.value.items.forEach((element) => {
        element.quantityReceived = 0
      })
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
          <h2>Receive Transfer Item</h2>
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
              <tr v-for="item in form.items" :key="item" class="basic-table-row">
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
                <td class="basic-table-body text-right">{{ numeric.format(item.quantityReceived ?? 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button type="button" class="btn btn-primary" @click="onSubmit()">Submit</button>
      </div>
    </div>
  </div>
</template>
