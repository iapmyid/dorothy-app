<script setup lang="ts">
import { AxiosError } from 'axios'
import { ref, onMounted } from 'vue'
import { BaseInput } from '@/components/index'
import { useRoute, useRouter } from 'vue-router'
import { useBaseNotification, TypesEnum } from '@/composable/notification'
import { useAuthStore } from '@/stores/auth'
import axios from '@/axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { notification } = useBaseNotification()

const form = ref({
  username: '',
  password: ''
})

const errors = ref()
const isSubmitted = ref(false)
const onSignin = async () => {
  try {
    isSubmitted.value = true
    const response = await authStore.login(form.value.username, form.value.password)

    if (response.status === 200) {
      router.push('/')
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      errors.value = error.response?.data.errors
      notification(error.response?.statusText, error.response?.data.message, { type: TypesEnum.Warning })
    } else if (error instanceof AxiosError) {
      notification(error.code as string, error.message, { type: TypesEnum.Warning })
    } else {
      notification('Unknown Error', '', { type: TypesEnum.Warning })
    }
  } finally {
    isSubmitted.value = false
  }
}
</script>

<template>
  <div class="h-screen w-full bg-slate-100 dark:bg-slate-900">
    <div class="mx-auto max-w-xl w-full p-4 sm:px-5">
      <div class="text-center">
        <div class="mt-4">
          <h2 class="text-2xl font-semibold text-slate-600 dark:text-slate-100">Dorothy Boutique</h2>
          <p class="text-slate-400 dark:text-slate-300">Please sign in to continue</p>
        </div>
      </div>
      <div class="card mt-5 rounded-lg p-5 lg:p-7 space-y-10">
        <div class="mx-auto max-w-xl w-full">
          <div class="text-center">
            <div class="">
              <h3 class="text-xl font-semibold text-slate-600 dark:text-slate-100 uppercase">Sign In</h3>
            </div>
          </div>
        </div>
        <form @submit.prevent="onSignin()" method="post" class="space-y-10">
          <div class="space-y-5">
            <component :is="BaseInput" required border="simple" v-model="form.username" label="Username">
              <template #prefix>
                <i class="i-far-user mx-3 block"></i>
              </template>
            </component>
            <component
              :is="BaseInput"
              required
              border="simple"
              v-model="form.password"
              label="Password"
              type="password"
            >
              <template #prefix>
                <i class="i-far-lock mx-3 block"></i>
              </template>
            </component>
          </div>

          <button class="btn btn-primary btn-block">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>
