<script setup lang="ts">
import { ref, watch } from 'vue'

const isOpenRef = ref(false)
const content = ref()

const toggleCollapse = () => {
  isOpenRef.value = !isOpenRef.value
}

const props = withDefaults(
  defineProps<{
    title?: string
    isOpen?: boolean
  }>(),
  { title: '', isOpen: false }
)

watch(
  props,
  () => {
    isOpenRef.value = props.isOpen
  },
  { immediate: true }
)
</script>

<template>
  <div class="">
    <button @click="toggleCollapse()" class="btn btn-block space-x-4">
      <slot name="header" :is-open="isOpenRef">
        <i
          class="i-fas-angle-right transform-gpu transition-all duration-200"
          :class="{
            'rotate-90': isOpenRef
          }"
        ></i>
        <p class="flex-1 text-left">{{ props.title }}</p>
      </slot>
    </button>
    <div v-if="isOpenRef" ref="content" class="overflow-hidden px-4">
      <slot></slot>
    </div>
  </div>
</template>
