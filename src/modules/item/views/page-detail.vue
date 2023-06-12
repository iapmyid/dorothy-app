<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseNumeric } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import axios from '@/axios'

const route = useRoute()
const router = useRouter()
const { notification } = useBaseNotification()

const form = ref({
  name: '',
  sellingPrice: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/items/${route.params.id}`)

    if (result.status === 200) {
      form.value.name = result.data.name
      form.value.sellingPrice = result.data.sellingPrice
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const onDelete = async () => {
  if (confirm('Are you sure want to delete this data?')) {
    const result = await axios.delete(`/v1/items/${route.params.id}`)
    if (result.status === 204) {
      notification('', 'Delete item data success', { type: TypesEnum.Success })
      router.push('/item')
    }
  }
}
</script>

<template>
  <div class="main-content-container">
    <div class="main-content-header">
      <h1>Item</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Item', path: '/item' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header">
          <h2>Show Item</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link to="/item/create" class="btn btn-secondary btn-sm rounded-none space-x-1">
                <i class="i-far-circle-plus block"></i>
                <span>Add</span>
              </router-link>
            </div>
            <div>
              <router-link
                :to="`/item/${route.params.id}/edit`"
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
              <component :is="BaseNumeric" readonly v-model="form.sellingPrice" label="Selling Price"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
