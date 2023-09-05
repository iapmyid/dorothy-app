<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import {
  BaseBreadcrumb,
  BaseDivider,
  BaseDatepicker,
  BaseNumeric,
  BaseInput,
  BaseAutocomplete
} from '@/components/index'
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

const description = ref('')
const value = ref(0)
const total = ref(0)

const addItem = async () => {
  if (!description.value || !value.value) {
    return
  }

  form.value.items.push({
    description: description.value,
    value: value.value
  })

  total.value += value.value

  description.value = ''
  value.value = 0
}

const formDate = ref(format(new Date(), 'dd/MM/yyyy'))

const form = ref<{
  date: string
  warehouse_id: string
  items: {
    description: string
    value: number
  }[]
}>({
  date: format(new Date(), 'yyyy-MM-dd'),
  warehouse_id: '',
  items: []
})

const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, async () => {
  form.value.warehouse_id = selectedWarehouse.value?.id ?? ''
  form.value.items = []
})

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
  selectedWarehouse.value = warehouseApi.listWarehouse.value[0]
  await itemApi.fetchListItem()
})

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    const response = await axios.post('/v1/branch-expenses', form.value)

    if (response.status === 201) {
      router.push('/branch-expense')
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
      <h1>Branch Expense</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Branch Expense', path: '/branch-expense' }, { name: 'Create' }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>New Branch Expense</h2>
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
              <div class="flex gap-4">
                <div class="flex flex-col flex-1 items-start gap-1">
                  <label class="text-sm font-bold">
                    Description
                    <span class="text-xs text-slate-400">(required)</span>
                  </label>
                  <component :is="BaseInput" v-model="description" border="simple" class="flex-1 w-full"> </component>
                </div>
                <div class="flex flex-col items-start gap-1">
                  <label class="text-sm font-bold">
                    Value
                    <span class="text-xs text-slate-400">(required)</span>
                  </label>
                  <component :is="BaseNumeric" v-model="value" border="simple" class="flex-1 w-full"> </component>
                </div>
                <button type="button" @click="addItem()" class="btn btn-primary">Add</button>
              </div>
              <div class="table-container">
                <table class="table text-sm">
                  <thead>
                    <tr class="basic-table-row bg-slate-100 dark:bg-slate-700">
                      <th class="basic-table-head">
                        <p>Description</p>
                      </th>
                      <th class="basic-table-head text-right">
                        <p>Value</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="form.items.length > 0">
                      <tr v-for="(item, index) in form.items" :key="index">
                        <td class="basic-table-body w-full">{{ item.description }}</td>
                        <td class="basic-table-body text-right">{{ numeric.format(item.value) }}</td>
                      </tr>
                    </template>
                    <tr v-if="form.items.length > 1">
                      <td class="basic-table-body font-bold text-right">Total</td>
                      <td class="basic-table-body font-bold text-right">{{ numeric.format(total) }}</td>
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
