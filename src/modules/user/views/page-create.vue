<script setup lang="ts">
import { ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { BaseBreadcrumb, BaseDivider, BaseSelect, BaseInput } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRouter } from 'vue-router'
import axios from '@/axios'

const { notification } = useBaseNotification()
const router = useRouter()

const form = ref({
  name: '',
  username: '',
  password: '',
  role: 'cashier'
})

const list = [
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Cashier' }
]
const selected = ref(list[1])

watch(selected, () => {
  form.value.role = selected.value.label.toLowerCase()
})

const errors = ref()
const isSubmitted = ref(false)

const onSubmit = async () => {
  try {
    isSubmitted.value = true
    const response = await axios.post('/v1/users', form.value)

    if (response.status === 201) {
      form.value.name = ''
      form.value.username = ''
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
              <component :is="BaseInput" required v-model="form.username" label="Username"></component>
              <component :is="BaseInput" type="password" required v-model="form.password" label="Password"></component>
              <div class="flex flex-col items-start gap-5">
                <label class="text-sm font-bold">
                  Role
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component :is="BaseSelect" v-model="selected" :list="list"></component>
              </div>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
