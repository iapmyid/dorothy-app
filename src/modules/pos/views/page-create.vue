<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AxiosError } from 'axios'
import { BaseInput, BaseAutocomplete } from '@/components/index'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { format } from 'date-fns'
import { useItemCategoryApi } from '../api/item-category'
import { useCustomerApi } from '../api/customer'
import axios from '@/axios'
import { useNumeric } from '@/composable/numeric'
import { watchDebounced } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'

const numeric = useNumeric()

const authStore = useAuthStore()

const { notification } = useBaseNotification()
const itemCategoryApi = useItemCategoryApi()
const customerApi = useCustomerApi()
const form = ref<{
  date: string
  customer_id?: string
  warehouse_id: string
  items: {
    _id: string
    name: string
    size: string
    quantity: number
    price: number
    total: number
  }[]
  totalQuantity: number
  totalPrice: number
  paymentType: string
}>({
  date: format(new Date(), 'yyyy-MM-dd'),
  warehouse_id: '',
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  paymentType: ''
})

onMounted(async () => {
  await itemCategoryApi.fetchListItemCategory()
  await customerApi.fetchListCustomer()
  await getItemCategories()
  await getItems()
  setTimeout(() => {
    form.value.warehouse_id = authStore.$state.user.warehouse_id
  }, 1000)
  form.value.warehouse_id = authStore.$state.user.warehouse_id
})

const errors = ref()
const isSubmitted = ref(false)

export interface ItemCategoryInterface {
  _id: string
  name: string
}
const itemCategories = ref<ItemCategoryInterface[]>([])
const getItemCategories = async (page = 1, search = '') => {
  const result = await axios.get('/v1/item-categories', {
    params: {
      pageSize: 100,
      page: page,
      sort: 'name',
      filter: {
        itemCategory_id: search
      }
    }
  })

  itemCategories.value = result.data.data
}

const selectedCustomer = ref<{ id: string; label: string }>()
watch(selectedCustomer, () => {
  form.value.customer_id = selectedCustomer.value?.id ?? ''
})

export interface ItemInterface {
  _id: string
  name: string
  itemCategory: {
    name: string
  }
  sellingPrice: number
}
const items = ref<ItemInterface[]>([])
const getItems = async (page = 1, search = '') => {
  const result = await axios.get('/v1/items', {
    params: {
      pageSize: 100,
      page: page,
      sort: 'name',
      filter: {
        itemCategory_id: search,
        name: search
      }
    }
  })

  items.value = result.data.data
}

const onClickItemCategory = async (id: string) => {
  searchAll.value = ''
  await getItems(1, id)
}

const searchAll = ref()
watchDebounced(
  () => searchAll.value,
  async () => {
    await getItems(1, searchAll.value)
  },
  { debounce: 500, maxWait: 1000 }
)

watch(
  () => form.value.items,
  () => {
    let totalPrice = 0
    let totalQuantity = 0
    for (const iterator of form.value.items) {
      totalPrice += iterator.total
      totalQuantity += iterator.quantity
    }
    form.value.totalPrice = totalPrice
    form.value.totalQuantity = totalQuantity
  },
  { deep: true }
)

const onChooseItem = async (item: ItemInterface, size: string) => {
  const index = form.value.items.findIndex((el) => {
    return el._id === item._id && size === el.size
  })

  await getInventories(item._id, form.value.warehouse_id, size)

  let qty = 1
  if (index >= 0) {
    qty = form.value.items[index]?.quantity + 1
  }

  // stock unavailable
  if (inventories.value.length === 0 || qty > inventories.value[0].quantity) {
    notification('Stock Unavailable', '', { type: TypesEnum.Warning })
    return
  }

  if (index >= 0) {
    form.value.items[index].quantity += 1
    form.value.items[index].total += item.sellingPrice
  } else {
    form.value.items.push({
      _id: item._id,
      name: item.name,
      size: size,
      quantity: 1,
      price: item.sellingPrice,
      total: item.sellingPrice
    })
  }
}

export interface InventoryInterface {
  _id: string
  warehouse: {
    _id: string
    name: string
  }
  item: {
    _id: string
    name: string
  }
  size: string
  quantity: number
  createdAt: Date
}
const inventories = ref<InventoryInterface[]>([])
const getInventories = async (item_id: string, warehouse_id: string, size: string) => {
  const result = await axios.get('/v1/inventories', {
    params: {
      pageSize: 5,
      page: 1,
      sort: 'item.name',
      filter: {
        item_id: item_id,
        warehouse_id: warehouse_id,
        size: size
      }
    }
  })

  inventories.value = result.data.data
}

const choosePaymentMethod = (type: string) => {
  form.value.paymentType = type
}

const resetForm = () => {
  form.value.items = []
}

const onSubmit = async () => {
  try {
    isSubmitted.value = true

    const response = await axios.post('/v1/pos', form.value)

    if (response.status === 201) {
      window.print()
      resetForm()
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
  <div class="main-content-container print:text-black!">
    <div class="main-content-body">
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-3 overflow-hidden print:hidden!">
          <div class="flex flex-col gap-2">
            <h4>Categories</h4>
            <div class="flex gap-2 py-1 overflow-x-auto">
              <button
                v-for="itemCategory in itemCategories"
                :key="itemCategory._id"
                class="btn btn-info"
                @click="onClickItemCategory(itemCategory._id)"
              >
                {{ itemCategory.name }}
              </button>
            </div>
          </div>
          <div class="mt-5">
            <component :is="BaseInput" v-model="searchAll" placeholder="Search" border="full" class="flex-1">
              <template #prefix>
                <i class="i-far-magnifying-glass mx-3 block"></i>
              </template>
            </component>
          </div>
          <div class="py-4 grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            <template v-for="item in items" :key="item._id">
              <div class="btn py-4 btn-light-dark flex flex-col shadow">
                <p class="text-sm">{{ item.name }}</p>
                <p class="text-xs">Rp {{ numeric.format(item.sellingPrice) }}</p>
                <br />
                <div class="flex flex-wrap items-center justify-center gap-1">
                  <button class="btn btn-secondary text-xs btn-sm" @click="onChooseItem(item, 'all size')">
                    All Size
                  </button>
                  <button class="btn btn-secondary text-xs btn-sm" @click="onChooseItem(item, 's')">S</button>
                  <button class="btn btn-secondary text-xs btn-sm" @click="onChooseItem(item, 'm')">M</button>
                  <button class="btn btn-secondary text-xs btn-sm" @click="onChooseItem(item, 'l')">L</button>
                  <button class="btn btn-secondary text-xs btn-sm" @click="onChooseItem(item, 'xl')">XL</button>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-4 overflow-hidden print:col-span-4">
          <div class="flex flex-col items-start gap-1 print:hidden!">
            <component
              :is="BaseAutocomplete"
              placeholder="Customer"
              required
              v-model="selectedCustomer"
              :list="customerApi.listCustomer.value"
            ></component>
          </div>
          <div class="card-header print:hidden!">
            <h2>New Sales</h2>
            <button @click="resetForm()" type="button" class="btn btn-sm rounded-full">+</button>
          </div>

          <div class="card card-template flex flex-col gap-4 print:border-none! print:text-black! print:bg-white!">
            <form @submit.prevent="onSubmit()" method="post" class="space-y-5">
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  font-size: 11px;
                  -webkit-print-color-adjust: exact;
                "
              >
                <!-- Header -->
                <div style="display: flex; flex-direction: column">
                  <p style="font-weight: bold; text-align: center; font-size: 18px" class="text-center mb-3">
                    Dorothy Boutique
                  </p>
                  <p style="text-align: center; font-size: 12px; margin-top: -10px">
                    PTC UG F5 NO 11-12 <br />031-7392043
                  </p>
                  <hr style="margin-top: 5px; margin-bottom: 5px" />
                  <p style="display: flex; flex-direction: column">
                    <span>Date: {{ format(new Date(), 'dd MMM yyyy HH:mm') }}</span>
                    <span>Cashier: {{ authStore.$state.user.name }}</span>
                  </p>
                  <hr style="margin-top: 5px" />
                </div>

                <!-- Items -->
                <div
                  style="display: flex; flex-direction: column; min-height: 100px; max-height: 350px; overflow-y: auto"
                >
                  <div
                    style="display: flex; flex-direction: row; width: 100%"
                    v-for="item in form.items"
                    :key="item._id"
                  >
                    <div style="display: flex; flex-direction: column; flex-grow: 1">
                      <span style="margin: 0; padding: 0">x{{ item.quantity }} {{ item.name }} ({{ item.size }})</span>
                    </div>
                    <div style="flex-grow: 0">
                      <span style="text-align: right">{{ numeric.format(item.total) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Summary -->
                <div style="display: flex; flex-direction: column">
                  <div style="display: flex; flex-direction: row; width: 100%">
                    <div style="display: flex; flex-direction: column; flex-grow: 1">
                      <span style="margin: 0; padding: 0; font-weight: bold">Total</span>
                    </div>
                    <div style="flex-grow: 0">
                      <span style="text-align: right">{{ numeric.format(form.totalPrice) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2 print:hidden!">
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="choosePaymentMethod('cash')"
                    class="btn btn-secondary"
                    :class="{
                      'btn-success': form.paymentType === 'cash'
                    }"
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    @click="choosePaymentMethod('credit')"
                    class="btn btn-secondary"
                    :class="{
                      'btn-success': form.paymentType === 'credit'
                    }"
                  >
                    Credit
                  </button>
                </div>
                <button type="button" @click="onSubmit()" class="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
