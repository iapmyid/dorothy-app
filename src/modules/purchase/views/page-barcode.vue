<script setup lang="ts">
import { BaseBarcode, BaseCheckbox, BaseNumeric } from '@/components/index'
import { onMounted, ref } from 'vue'
import axios from '@/axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items =
  ref<
    { barcode: string; name: string; size: [{ label: string; quantity: number; barcode: string }]; color: string }[]
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

const width = ref(320)
const gapX = ref(4)
const gapY = ref(4)
const height = ref(15)
const showName = ref(true)
const showCode = ref(true)

const onPrint = () => {
  window.print()
}
</script>

<template>
  <div class="main-content-container print:m-0! print:p-0">
    <div class="main-content-header print:!hidden">
      <h1>Barcode</h1>
    </div>
    <div class="flex gap-4">
      <div class="flex-1">
        <div
          :style="{ width: width + 'px' }"
          class="main-content-body print:m-0! print:p-0 print:fixed! print:top-0! print:left-0! bg-white"
        >
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
      <div class="print:hidden! flex flex-col gap-4">
        <component
          :is="BaseNumeric"
          layout="horizontal"
          v-model="height"
          label="Height"
          :max="25"
          description="max 25"
        />
        <component
          :is="BaseNumeric"
          layout="horizontal"
          v-model="width"
          label="Width"
          :max="640"
          description="min 320"
        />
        <component
          :is="BaseNumeric"
          layout="horizontal"
          v-model="gapX"
          label="Gap X"
          :max="100"
          description="default 4"
        />
        <component
          :is="BaseNumeric"
          layout="horizontal"
          v-model="gapY"
          label="Gap Y"
          :max="100"
          description="default 4"
        />
        <component :is="BaseCheckbox" v-model="showName" label="Show Name" />
        <component :is="BaseCheckbox" v-model="showCode" label="Show Code" />
        <button type="button" @click="onPrint" class="btn btn-primary btn-sm btn-block">Print</button>
      </div>
    </div>
  </div>
</template>
