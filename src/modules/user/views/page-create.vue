<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseAutocomplete, BaseBreadcrumb, BaseDivider, BaseSelect, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import { useWarehouseApi } from '../api/warehouse'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()
const warehouseApi = useWarehouseApi()

const form = ref({
  name: '',
  username: '',
  password: '',
  role: 'cashier',
  warehouse_id: ''
})

const list = [
  { id: 1, label: 'Administrator' },
  { id: 2, label: 'Admin Purchasing' },
  { id: 3, label: 'Admin Stock' },
  { id: 4, label: 'Cashier' }
]
const selectedRole = ref(list[3])
watch(selectedRole, () => {
  form.value.role = selectedRole.value?.label?.toLowerCase() ?? ''
})
const selectedWarehouse = ref<{ id: string; label: string }>()
watch(selectedWarehouse, () => {
  form.value.warehouse_id = selectedWarehouse.value?.id ?? ''
})

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.post('/v1/users', form.value)

    if (response.status === 201) {
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

onMounted(async () => {
  await warehouseApi.fetchListWarehouse()
})
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>User</h1>
      <base-divider orientation="horizontal" />
      <component :is="BaseBreadcrumb" :breadcrumbs="[{ name: 'User', path: '/user' }, { name: 'Create' }]" />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>New User</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <component
                :is="BaseInput"
                required
                v-model="form.username"
                label="Username"
                helper="used for user login"
              ></component>
              <component
                :is="BaseInput"
                type="password"
                helper="minimum 8 digit"
                required
                v-model="form.password"
                label="Password"
              ></component>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Role
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component :is="BaseSelect" v-model="selectedRole" required :list="list"></component>
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
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
