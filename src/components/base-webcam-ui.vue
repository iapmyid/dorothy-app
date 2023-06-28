<script setup lang="ts">
import { ref } from 'vue'
import BaseWebcam from './base-webcam.vue'

const webcam = ref()
const activeCamera = ref()
const photo = ref()

const retakePhoto = () => {
  photo.value = null
}

const emit = defineEmits<{
  (e: 'stop'): void
  (e: 'photoTaken', value: any): void
  (e: 'unsupported', value: any): void
  (e: 'error', value: any): void
}>()

const updateActiveCamera = (val: any) => {
  activeCamera.value = val
}

const setCamera = () => {
  webcam.value.changeCamera(activeCamera.value === '' ? null : activeCamera.value)
}

const stop = () => {
  emit('stop')
}

const error = (error: any) => {
  emit('error', error)
}

const unsupported = (error: any) => {
  emit('unsupported', error)
}

const photoTakenEvent = (event: { blob: any; imgDataUrl: string }) => {
  emit('photoTaken', event)
  photo.value = event
}
</script>

<template>
  <div class="lg:w-1/3">
    <div v-if="!photo">
      <div>
        <BaseWebcam
          ref="webcam"
          @stop="stop"
          @error="error"
          @unsupported="unsupported"
          @photoTaken="photoTakenEvent"
          @change="updateActiveCamera"
        />
      </div>
      <div class="flex justify-center py-2 mx-auto items-center">
        <select @change="setCamera" v-model="activeCamera" class="form-input">
          <option v-for="camera in webcam?.cameras" :key="camera.deviceId" :value="camera.deviceId">
            {{ camera.label }}
          </option>
        </select>

        <div class="px-2 py-2 sm:py-0">
          <button class="btn btn-primary" @click="webcam.takePhoto" v-if="activeCamera" type="button">
            <i class="block i-far-camera"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <div>
        <img :src="photo.imgDataUrl" alt="" />
      </div>
      <div class="flex flex-col justify-center py-2 mx-auto text-center sm:flex-row align-center">
        <button class="btn btn-block btn-danger" @click="retakePhoto()">Retake</button>
      </div>
    </div>
  </div>
</template>
