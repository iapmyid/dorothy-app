<script setup lang="ts">
import { useNumeric } from '@/composable/numeric'
import JsBarcode from 'jsbarcode'
import { onMounted, ref, watch, computed } from 'vue'

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

const fontSize = computed(() => {
  if (props.label.length < 18) {
    return '13px'
  }
  if (props.label.length < 20) {
    return '11px'
  }
  if (props.label.length < 22) {
    return '10px'
  }
  return '9px'
})
</script>

<template>
  <div
    class="flex flex-col text-center justify-center items-center relative font-medium text-black uppercase bg-white w-40 h-81px pt-1 px-2 overflow-hidden"
  >
    <span :style="{ fontSize }" class="z-1 leading-tight line-clamp-2" v-if="props.showName">{{ props.label }}</span>
    <svg ref="barcodeRef" id="barcode" class="-my-2"></svg>
    <div class="text-9px leading-none flex justify-between space-x-3 z-1 max-w-full" v-if="props.showCode">
      <div>{{ props.value }}</div>
      <div class="flex-1 whitespace-nowrap overflow-hidden">{{ props.size }} - {{ props.color }}</div>
    </div>
    <div class="text-14px leading-tight w-full text-center">Rp. {{ numeric.format(props.sellingPrice) }}</div>
  </div>
</template>
