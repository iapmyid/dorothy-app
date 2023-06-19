<script setup lang="ts">
import { BaseBarcode, BaseCheckbox, BaseNumeric } from '@/components/index'
import { onMounted, ref } from 'vue'
import axios from '@/axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const item = ref<{ barcode: string; name: string }>({
  barcode: '',
  name: ''
})

onMounted(async () => {
  try {
    const result = await axios.get(`/v1/items/${route.params.id}`)

    if (result.status === 200) {
      item.value.barcode = result.data.barcode
      item.value.name = result.data.name
    } else {
      router.push('/404')
    }
  } catch (error) {
    router.push('/404')
  }
})

const rows = ref(1)
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
            v-if="item.barcode"
            class="grid grid-cols-3 text-sm!"
            :style="{ 'column-gap': gapX + 'px', 'row-gap': gapY + 'px' }"
          >
            <component
              :is="BaseBarcode"
              :showCode="showCode"
              :showName="showName"
              :height="height"
              :label="item.name"
              :value="item.barcode"
              v-for="i in rows * 3"
              :key="i"
            />
          </div>
        </div>
      </div>
      <div class="print:hidden! flex flex-col gap-4">
        <component :is="BaseNumeric" layout="horizontal" v-model="rows" label="Rows" :max="10" description="max 10" />
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
