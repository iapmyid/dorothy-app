<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb } from '@/components/index'
import { BaseDivider } from '@/components/index'
import { BaseInput } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import axios from '@/axios'

const route = useRoute()
const router = useRouter()
const { notification } = useBaseNotification()

export interface UserInterface {
  name: string
  username: string
  role: string
  warehouse: {
    name: string
  }
}

const form = ref<UserInterface>({
  name: '',
  username: '',
  role: '',
  warehouse: {
    name: ''
  }
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/users/${route.params.id}`)

    if (result.status === 200) {
      form.value.name = result.data.name
      form.value.username = result.data.username
      form.value.role = result.data.role
      form.value.warehouse.name = result.data.warehouse?.name ?? ''
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const onDelete = async () => {
  if (confirm('Are you sure want to delete this data?')) {
    const result = await axios.delete(`/v1/users/${route.params.id}`)
    if (result.status === 204) {
      notification('', 'Delete user data success', { type: TypesEnum.Success })
      router.push('/user')
    }
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
        :breadcrumbs="[{ name: 'User', path: '/user' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show User</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/user/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
            <div>
              <router-link
                :to="`/user/${route.params.id}/edit`"
                class="btn btn-secondary btn-sm rounded-none space-x-1"
              >
                <i class="i-far-pen-to-square block"></i>
                <span>Edit</span>
              </router-link>
            </div>
            <div>
              <button @click="onDelete()" type="button" class="btn btn-danger btn-sm rounded-none space-x-1">
                <i class="i-far-trash block"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" readonly v-model="form.name" label="Name"></component>
              <component :is="BaseInput" readonly v-model="form.username" label="Username"></component>
              <component :is="BaseInput" readonly v-model="form.role" label="Role"></component>
              <component :is="BaseInput" readonly v-model="form.warehouse.name" label="Warehouse"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
