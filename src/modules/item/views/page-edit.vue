<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { AxiosError } from 'axios'
import { BaseAutocomplete, BaseBreadcrumb, BaseDivider, BaseInput, BaseNumeric } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useRoute, useRouter } from 'vue-router'
import { useItemCategoryApi } from '../api/item-category'
import axios from '@/axios'

const { notification } = useBaseNotification()
const route = useRoute()
const router = useRouter()
const itemCategoryApi = useItemCategoryApi()

const _id = ref('')

const form = ref({
  name: '',
  itemCategory_id: '',
  sellingPrice: 0
})
const selectedItemCategory = ref<{ id: string; label: string }>()
watch(selectedItemCategory, () => {
  form.value.itemCategory_id = selectedItemCategory.value?.id ?? ''
})

onMounted(async () => {
  try {
    itemCategoryApi.fetchListItemCategory()

    const result = await axios.get(`/v1/items/${route.params.id}`)

    if (result.status === 200) {
      _id.value = result.data._id
      form.value.name = result.data.name
      form.value.itemCategory_id = result.data.itemCategory._id
      form.value.sellingPrice = result.data.sellingPrice

      selectedItemCategory.value = { id: result.data.itemCategory._id, label: result.data.itemCategory.name }
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
    const response = await axios.patch(`/v1/items/${_id.value}`, form.value)

    if (response.status === 204) {
      router.push('/item')
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
      <h1>Item</h1>
      <base-divider orientation="horizontal" />
      <component
        :is="BaseBreadcrumb"
        :breadcrumbs="[
          { name: 'Item', path: '/item' },
          { name: route.params.id.toString(), path: `/item/${route.params.id.toString()}` },
          { name: 'Edit' }
        ]"
      />
    </div>
    <div class="main-content-body">
      <div class="card card-template">
        <div class="card-header bg-slate-200 dark:bg-slate-700 px-4 py-2 -mx-4 -my-2 font-extrabold">
          <h2>Edit Item</h2>
        </div>
        <div class="flex flex-col gap-4">
          <form @submit.prevent="onSubmit()" class="space-y-5">
            <div class="space-y-2">
              <component :is="BaseInput" required v-model="form.name" label="Name"></component>
              <div class="flex flex-col items-start gap-1">
                <label class="text-sm font-bold">
                  Item Category
                  <span class="text-xs text-slate-400">(required)</span>
                </label>
                <component
                  :is="BaseAutocomplete"
                  required
                  v-model="selectedItemCategory"
                  :list="itemCategoryApi.listItemCategory.value"
                ></component>
              </div>
              <component :is="BaseNumeric" required v-model="form.sellingPrice" label="Selling Price"></component>
            </div>
            <button class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
