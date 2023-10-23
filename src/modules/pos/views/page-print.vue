<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { format } from 'date-fns'
import axios from '@/axios'
import { useNumeric } from '@/composable/numeric'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

const route = useRoute()
const numeric = useNumeric()

const authStore = useAuthStore()

export interface PosInterface {
  _id: string
  date: string
  warehouse: {
    name: string
  }
  customer: {
    name: string
  }
  createdBy: {
    name: string
  }
  items: {
    _id: string
    name: string
    size: string
    price: number
    quantity: number
    total: number
  }[]
  subtotal: number
  discount: number
  totalQuantity: number
  totalPrice: number
  cashReceived: number
  cashChange: number
  paymentType: string
  createdAt: string | Date
}

const form = ref<PosInterface>({
  _id: '',
  date: '',
  warehouse: {
    name: ''
  },
  customer: {
    name: ''
  },
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  discount: 0,
  totalPrice: 0,
  cashReceived: 0,
  cashChange: 0,
  paymentType: '',
  createdAt: '',
  createdBy: {
    name: ''
  }
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/pos/${route.params.id}`)

    if (result.status === 200) {
      form.value._id = result.data._id
      form.value.date = format(new Date(result.data.createdAt), 'dd MMM yyyy HH:mm')
      form.value.warehouse.name = result.data.warehouse?.name
      form.value.customer.name = result.data.customer?.name
      form.value.items = result.data.items
      form.value.totalQuantity = result.data.totalQuantity
      form.value.subtotal = result.data.subtotal
      form.value.discount = result.data.discount
      form.value.totalPrice = result.data.totalPrice
      form.value.cashReceived = result.data.cashReceived
      form.value.cashChange = result.data.cashChange
      form.value.paymentType = result.data.paymentType
      form.value.createdAt = format(new Date(result.data.createdAt), 'dd MMM yyyy HH:mm')
      form.value.createdBy.name = result.data.createdBy?.name
    }
  } catch (e) {
    //
  }
})

const onPrint = async () => {
  window.print()
}
</script>

<template>
  <div class="main-content-container print:text-black!">
    <div class="main-content-body">
      <div class="grid grid-cols-5 gap-4">
        <div class="col-span-2 flex flex-col gap-4 overflow-hidden print:col-span-4">
          <div
            class="card card-template flex flex-col gap-4 print:fixed print:top-0 print:w-76mm print:shadow-none print:border-none! print:text-black! print:bg-white!"
          >
            <form @submit.prevent="onPrint()" method="post" class="space-y-5">
              <div class="flex flex-col gap-6px text-11px font-bold">
                <!-- Header -->
                <div class="flex flex-col">
                  <p class="font-extrabold text-center mb-3 text-18px">Dorothy Boutique</p>
                  <p class="text-center text-12px -mt-10px">PTC UG F5 NO 11-12 <br />031-7392043</p>
                  <hr class="my-5px" />
                  <p class="flex flex-col">
                    <span>Date: {{ format(new Date(), 'dd MMM yyyy HH:mm') }}</span>
                    <span>Cashier: {{ authStore.$state.user.name }}</span>
                  </p>
                  <hr class="mt-5px" />
                </div>

                <!-- Items -->
                <div class="flex flex-col min-h-50px max-h-350px overflow-y-auto">
                  <div class="flex flex-row w-full" v-for="item in form.items" :key="item._id">
                    <div class="flex flex-col flex-1">
                      <span class="m-0 p-0">x{{ item.quantity }} {{ item.name }}</span>
                      <span class="text-8px uppercase font-light">{{ item.size }} - {{ item.color }}</span>
                    </div>
                    <div class="flex-0">
                      <span class="text-right">{{ numeric.format(item.total) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Summary -->
                <div class="flex flex-col">
                  <div class="flex w-full text-14px font-normal" v-if="form.customer_id">
                    <div class="flex-1">
                      <span class="m-0 p-0">Sub Total</span>
                    </div>
                    <div class="flex-0">
                      <span class="text-right">{{ numeric.format(form.subtotal) }}</span>
                    </div>
                  </div>
                  <div class="flex w-full text-14px font-normal" v-if="form.customer_id">
                    <div class="flex-1">
                      <span class="m-0 p-0">Discount</span>
                    </div>
                    <div class="flex-0">
                      <span class="text-right">{{ numeric.format(form.discount) }}</span>
                    </div>
                  </div>
                  <div class="flex w-full text-14px">
                    <div class="flex-1">
                      <span class="m-0 p-0">Total</span>
                    </div>
                    <div class="flex-0">
                      <span class="text-right">{{ numeric.format(form.totalPrice) }}</span>
                    </div>
                  </div>

                  <div class="font-normal flex w-full text-14px" v-if="form.paymentType === 'cash'">
                    <div class="flex-1">
                      <span class="m-0 p-0">Cash</span>
                    </div>
                    <div class="flex-0">
                      <span class="text-right">{{ numeric.format(form.cashReceived) }}</span>
                    </div>
                  </div>
                  <div class="font-normal flex w-full text-14px" v-if="form.paymentType === 'cash'">
                    <div class="flex-1">
                      <span class="m-0 p-0">Change</span>
                    </div>
                    <div class="flex-0">
                      <span class="text-right">{{ numeric.format(form.cashChange) }}</span>
                    </div>
                  </div>
                </div>

                <p class="hidden print:block text-center print:my-6!">- Thankyou -</p>
              </div>
              <div class="flex flex-col gap-2 print:hidden!">
                <button type="button" @click="onPrint()" class="btn btn-primary">Print</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
