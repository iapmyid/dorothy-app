<script setup lang="ts">
import { useDarkMode } from '@/composable/dark-mode'
import { useScreenSize } from '@/composable/screen-size'
import { BaseNotification } from '@/components/index'
import { useRouter } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

watch(
  () => authStore.$state.user.name,
  () => {
    if (authStore.$state.user.name === '') {
      router.push('/signin')
    }
  }
)

useDarkMode()
useScreenSize()
</script>

<template>
  <router-view />
  <component :is="BaseNotification" />
</template>
