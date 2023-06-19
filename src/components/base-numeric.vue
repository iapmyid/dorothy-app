<script lang="ts">
interface Props {
  modelValue: number
  id?: string
  label?: string
  description?: string
  placeholder?: string
  type?: 'text' | 'tel' | 'email' | 'password' | 'date' | 'number'
  border?: 'simple' | 'full' | 'none'
  layout?: 'vertical' | 'horizontal'
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  helper?: string
  error?: string
  max?: number
}
</script>

<script setup lang="ts">
import Cleave from 'cleave.js'
import { computed, onMounted, ref } from 'vue'

const inputRef = ref()
const cleave = ref()

const props = withDefaults(defineProps<Props>(), {
  border: 'simple',
  layout: 'vertical',
  type: 'text',
  required: false,
  readonly: false,
  disabled: false
})

const inputValue = computed({
  set: (text: string) => {},
  get: () => new Intl.NumberFormat('en-US').format(props.modelValue)
})

onMounted(() => {
  cleave.value = new Cleave(inputRef.value, {
    numeral: true,
    numeralThousandsGroupStyle: 'thousand',
    onValueChanged: onValueChanged
  })
})

const onValueChanged = (e: any) => {
  let rawValue = e.target.rawValue
  if (props.max && rawValue > props.max) {
    rawValue = props.max
    inputValue.value = props.max.toString()
  }
  emit('update:modelValue', Number(rawValue))
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>

<template>
  <div
    class="w-full"
    :class="{
      'flex items-start gap-5': props.layout === 'horizontal'
    }"
  >
    <label
      :for="id"
      v-if="label"
      class="font-bold"
      :class="{
        'flex flex-col w-30% lg:w-20%': props.layout === 'horizontal',
        'text-sm': props.layout === 'vertical'
      }"
    >
      {{ label }}
      <span v-if="props.required" class="text-xs text-slate-400">(required)</span>
      <span v-if="props.description" class="text-xs font-light text-slate-500">
        {{ props.description }}
      </span>
    </label>

    <div class="flex flex-1 flex-col">
      <input
        ref="inputRef"
        class="form-input"
        :class="{
          'border-b border-x-none border-t-none px-1': border === 'simple',
          'border mt-1': border === 'full',
          'border-none': border === 'none'
        }"
        v-model="inputValue"
        :placeholder="props.placeholder"
        :required="props.required"
        :readonly="props.readonly"
        :disabled="props.disabled"
      />
      <slot name="helper" v-if="helper">
        <span class="text-sm font-light text-slate-500">{{ helper }}</span>
      </slot>
      <slot name="error" v-if="error">
        <span class="text-sm font-light text-danger">{{ error }}</span>
      </slot>
    </div>
  </div>
</template>
