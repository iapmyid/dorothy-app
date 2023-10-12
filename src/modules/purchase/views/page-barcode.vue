<script setup lang="ts">
import { BaseBarcode, BaseCheckbox, BaseNumeric } from '@/components/index'
import { onMounted, ref } from 'vue'
import axios from '@/axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = ref<
  {
    barcode: string
    name: string
    size: [{ label: string; quantity: number; barcode: string }]
    color: string
    sellingPrice: number
  }[]
>()

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/purchases/${route.params.id}`)

    const purchases = await axios.get(`/v1/purchases`, {
      params: {
        filter: {
          date: result.data.date
        }
      }
    })

    if (result.status === 200) {
      items.value = purchases.data.data
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const width = ref(480)
const gapX = ref(0)
const gapY = ref(2)
const height = ref(18)
const showName = ref(true)
const showCode = ref(true)

const onPrint = () => {
  const params = new URLSearchParams({
    gap_x: gapX.value.toString(),
    gap_y: gapY.value.toString(),
    height: height.value.toString(),
    show_name: (showName.value ? 1 : 0).toString(),
    show_code: (showCode.value ? 1 : 0).toString()
  })
  window.open('barcode/print?' + params.toString(), '_blank', 'width=1280,height=720')
}
</script>

<template>
  <div class="main-content-container print:m-0! print:p-0">
    <div class="main-content-header print:!hidden">
      <h1>Barcode</h1>
    </div>
    <div class="flex gap-4">
      <div class="flex-1 space-y-4">
        <div class="print:hidden! flex flex-col gap-4">
          <button type="button" @click="onPrint" class="btn btn-primary btn-sm btn-block">Print</button>
        </div>
        <div :style="{ width: width + 'px' }" class="main-content-body py-4">
          <div
            v-if="items"
            class="grid grid-cols-3 text-sm!"
            :style="{ 'column-gap': gapX + 'px', 'row-gap': gapY + 'px' }"
          >
            <template v-for="item in items" :key="item">
              <template v-for="size in item.size" :key="item + size">
                <template v-for="i in size.quantity" :key="item + size + i">
                  <component
                    :is="BaseBarcode"
                    :showCode="showCode"
                    :showName="showName"
                    :height="height"
                    :selling-price="item.sellingPrice"
                    :size="size.label"
                    :color="item.color"
                    :label="item.name"
                    :value="size.barcode"
                  />
                </template>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
