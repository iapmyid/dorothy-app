<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseBreadcrumb, BaseDivider, BaseInput, BaseNumeric } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/axios'

const route = useRoute()
const router = useRouter()

const form = ref({
  name: '',
  color: '',
  size: '',
  barcode: '',
  sellingPrice: 0,
  itemCategory: {
    name: ''
  }
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/items/${route.params.id}`)

    if (result.status === 200) {
      form.value.name = result.data.name
      form.value.color = result.data.color
      form.value.size = result.data.size
      form.value.sellingPrice = result.data.sellingPrice
      form.value.barcode = result.data.barcode
      form.value.itemCategory.name = result.data.itemCategory?.name ?? ''
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
      <h1>Item</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[{ name: 'Item', path: '/item' }, { name: route.params.id.toString() }]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Show Item</h2>
          <div class="flex gap-2 overflow-x-hidden">
            <div>
              <router-link
                :to="`/item/${route.params.id}/edit`"
                class="btn btn-secondary btn-sm rounded-none space-x-1"
              >
                <i class="i-far-pen-to-square block"></i>
                <span>Edit</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" readonly v-model="form.name" label="Name"></component>
              <component :is="BaseInput" readonly v-model="form.color" label="Color"></component>
              <component :is="BaseInput" readonly v-model="form.size" label="Size"></component>
              <component :is="BaseInput" readonly v-model="form.itemCategory.name" label="Category"></component>
              <component :is="BaseInput" readonly v-model="form.barcode" label="Barcode"></component>
              <component :is="BaseNumeric" readonly v-model="form.sellingPrice" label="Selling Price"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
