<script setup lang="ts">
import JsBarcode from 'jsbarcode'
import { onMounted, ref, watch } from 'vue'

export interface Props {
  value: string
  label?: string
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
  <div class="flex flex-col text-center justify-center items-center relative">
    <svg ref="barcodeRef" id="barcode" class="z-0"></svg>
    <div class="flex flex-col -mt-2">
      <span class="text-9px z-1 leading-none" v-if="props.showName">{{ props.label.substring(0, 20) }}</span>
      <span class="text-8px z-1 leading-none" v-if="props.showCode">{{ value }}</span>
    </div>
  </div>
</template>
