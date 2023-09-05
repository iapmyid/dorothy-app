<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useBaseNotification } from '@/composable/notification'
import { TypesEnum } from '@/composable/notification'

const { notification } = useBaseNotification()

const cameras = ref<{ kind: string; deviceId: string }[]>([])
const activeCamera = ref()
const audioRef = ref()
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref()
const cameraLoaded = ref(false)

interface PropsInterface {
  rememberDevice?: boolean
  autoStart?: boolean
  muted?: boolean
}

const props = withDefaults(defineProps<PropsInterface>(), {
  rememberDevice: true,
  autoStart: true,
  muted: false
})

const emit = defineEmits<{
  (e: 'stop'): void
  (e: 'change', value: any): void
  (e: 'photoTaken', value: any): void
  (e: 'unsupported', value: any): void
  (e: 'error', value: any): void
}>()

const buildConstraints = (deviceId: string = '') => {
  if (deviceId) {
    return { video: { deviceId: { exact: deviceId } }, audio: false }
  }
  return { video: true, audio: false }
}

const loadCameras = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    const deviceInfos = await navigator.mediaDevices.enumerateDevices()

    for (let i = 0; i !== deviceInfos.length; i++) {
      let deviceInfo = deviceInfos[i]
      if (
        deviceInfo.kind === 'videoinput' &&
        cameras.value.find((el: { deviceId: string }) => el.deviceId === deviceInfo.deviceId) === undefined
      ) {
        cameras.value.push(deviceInfo)

        const rememberedDevice = window.localStorage.getItem('baseCameraDeviceId')
        if (rememberedDevice && props.rememberDevice && rememberedDevice === deviceInfo.deviceId) {
          await changeCamera(rememberedDevice)
        }

        if (!activeCamera.value && props.autoStart) {
          await changeCamera(deviceInfo.deviceId)
        }
      }
    }
  } catch (error) {
    emit('unsupported', error)
  }
}

const changeCamera = async (selectedDeviceId: string) => {
  activeCamera.value = selectedDeviceId

  if (!activeCamera.value) {
    stop()
  } else {
    await loadCamera(selectedDeviceId)
  }

  emit('change', activeCamera.value)
}

const loadCamera = async (deviceId: any) => {
  try {
    if (!videoRef.value || videoRef.value.srcObject) {
      return
    }

    videoRef.value.srcObject = await navigator.mediaDevices.getUserMedia(buildConstraints(deviceId))

    if (props.rememberDevice) {
      window.localStorage.setItem('baseCameraDeviceId', deviceId)
    }

    cameraLoaded.value = true
  } catch (error) {
    emit('error', error)
  }
}

const takePhoto = async () => {
  let video = videoRef.value

  let canvas = canvasRef.value
  canvas.height = video?.videoHeight
  canvas.width = video?.videoWidth

  let ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  let imgDataUrl = canvas.toDataURL('image/jpeg')
  canvas.toBlob((blob: Blob) => {
    if (audioRef.value && !props.muted) {
      audioRef.value.play()
    }
    emit('photoTaken', { blob, imgDataUrl })
  }, 'image/jpeg')
}

const stop = () => {
  const tracks = (videoRef.value?.srcObject as MediaStream)?.getTracks() ?? []

  for (const track of tracks) {
    track.stop()
  }

  if (videoRef.value?.srcObject) {
    videoRef.value.srcObject = null
  }

  emit('stop')
}

onBeforeRouteLeave(() => {
  if (cameraLoaded.value === false) {
    notification('Please wait...', 'Camera loading in process', {
      type: TypesEnum.Danger
    })

    return false
  }

  stop()
})

onMounted(async () => {
  await loadCameras()
})

defineExpose({
  cameras,
  takePhoto,
  changeCamera
})
</script>

<template>
  <!-- camera -->
  <video ref="videoRef" :class="{ 'hidden h-0': !activeCamera, 'w-full h-auto': activeCamera }" autoplay />
  <!-- canvas to display -->
  <canvas ref="canvasRef" style="display: none" />
  <!-- audio -->
  <div class="hidden">
    <audio ref="audioRef" volume="0.5" src="/camera-shutter.mp3"></audio>
  </div>
</template>
