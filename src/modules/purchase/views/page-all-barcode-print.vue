<script setup lang="ts">
import { BaseBarcode } from '@/components/index'
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
    const purchases = await axios.get(`/v1/purchases`, {
      params: {
        pageSize: 10,
        page: route.query.page,
        sort: '-date',
        filter: {
          name: route.query.search
        }
      }
    })

    if (purchases.status === 200) {
      items.value = purchases.data.data
      setTimeout(() => {
        window.print()
      }, 1000)
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})
const gapX = ref<number>(Number(route.query.gap_x) ?? 0)
const gapY = ref<number>(Number(route.query.gap_y) ?? 3)
const height = ref<number>(Number(route.query.height) ?? 18)
const showName = ref<boolean>(!!Number(route.query.show_name ?? 1))
const showCode = ref<boolean>(!!Number(route.query.show_code ?? 1))
</script>

<template>
  <div class="grid grid-cols-3 w-120 pr-6" :style="{ 'column-gap': gapX + 'px', 'row-gap': gapY + 'px' }">
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
</template>
