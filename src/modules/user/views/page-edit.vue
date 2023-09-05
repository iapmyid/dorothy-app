<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseAutocomplete, BaseBreadcrumb, BaseDivider, BaseSelect, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import { useWarehouseApi } from '../api/warehouse'
import axios from '@/axios'

const { notification } = useBaseNotification()
const route = useRoute()
const router = useRouter()
const warehouseApi = useWarehouseApi()

const _id = ref('')

const form = ref({
  name: '',
  username: '',
  role: '',
  warehouse_id: ''
})

const list = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Admin Purchasing' },
  { id: 3, label: 'Admin Stock' },
  { id: 4, label: 'Cashier' }
]
const selectedRole = ref()
watch(selectedRole, () => {
  form.value.role = selectedRole.value.label.toLowerCase()
})
const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, () => {
  form.value.warehouse_id = selectedWarehouse.value?.id ?? ''
})

onMounted(async () => {
  try {
    warehouseApi.fetchListWarehouse()

    const result = await axios.get(`/v1/users/${route.params.id}`)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.name = result.data.name
      form.value.username = result.data.username
      form.value.role = result.data.role.toLowerCase()

      // set selected role
      const index = list.findIndex((el) => {
        return el.label.toLowerCase() === result.data.role.toLowerCase()
      })
      selectedRole.value = list[index < 0 ? 1 : index]
      if (result.data.warehouse) {
        selectedWarehouse.value = { id: result.data.warehouse._id, label: result.data.warehouse.name }
      }
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
    const response = await axios.patch(`/v1/users/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/user')
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
      <h1>User</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'User', path: '/user' },
          { name: route.params.id.toString(), path: `/user/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit User</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required readonly v-model="form.name" label="Name"></component>
              <component :is="BaseInput" required readonly v-model="form.username" label="Username"></component>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Role
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component :is="BaseSelect" v-model="selectedRole" :list="list"></component>
              </div>
            </div>
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
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
