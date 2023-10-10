<script setup lang="ts">
import { useNumeric } from '@/composable/numeric'
import JsBarcode from 'jsbarcode'
import { onMounted, ref, watch } from 'vue'

const numeric = useNumeric()

export interface Props {
  value: string
  label?: string
  size?: string
  color?: string
  sellingPrice: number
  height?: number
  showCode?: boolean
  showName?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCode: true,
  showName: true,
  height: 15,
  label: ''
})

const barcodeRef = ref()

onMounted(() => {
  JsBarcode(barcodeRef.value, props.value, {
    height: props.height,
    width: 1,
    fontSize: 12,
    displayValue: false
  })
})

watch(
  () => props.height,
  () => {
    JsBarcode(barcodeRef.value, props.value, {
      height: props.height,
      width: 1,
      displayValue: false
    })
  }
)
</script>

<template>
  <div
    class="flex flex-col text-center justify-center items-center relative text-black uppercase font-bold bg-white w-40 h-81px"
  >
    <span class="text-9px z-1 leading-none" v-if="props.showName">
      <span>{{ props.label }}</span>
    </span>
    <svg ref="barcodeRef" id="barcode" class="z-0 -my-2"></svg>
    <div class="flex flex-col text-center">
      <div class="text-8px w-full flex justify-between space-x-3 z-1 leading-none" v-if="props.showCode">
        <span>{{ props.value }}</span>
        <span>{{ props.size }} - {{ props.color }}</span>
      </div>
      <span class="text-8px w-full text-center leading-none">Rp. {{ numeric.format(props.sellingPrice) }}</span>
    </div>
  </div>
</template>
