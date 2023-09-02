import { defineStore } from 'pinia'
import cookie from '@point-hub/vue-cookie'
import axios from '@/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      name: '',
      username: '',
      role: '',
      warehouse_id: ''
    }
  }),
  actions: {
    async login(username: string, password: string) {
      const response = await axios.post('/v1/users/signin', {
        username: username,
        password: password
      })
      if (response.status === 200) {
        this.$state.user.name = response.data.name
        this.$state.user.username = response.data.username
        this.$state.user.role = response.data.role
        this.$state.user.warehouse_id = response.data.warehouse_id
        cookie.set('accessToken', response.data.accessToken)
        cookie.set('refreshToken', response.data.refreshToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${cookie.get('accessToken')}`
      }

      return response
    },
    async verifyToken() {
      try {
        const response = await axios.post('/v1/users/verify-token')
        if (response.status === 200) {
          this.$state.user.name = response.data.name
          this.$state.user.username = response.data.username
          this.$state.user.role = response.data.role
          this.$state.user.warehouse_id = response.data.warehouse_id
        }
      } catch (error) {
        this.logout()
      }
    },
    logout() {
      this.$state.user.name = ''
      this.$state.user.username = ''
      this.$state.user.role = ''
      this.$state.user.warehouse_id = ''
      cookie.remove('accessToken')
      cookie.remove('refreshToken')
    },
    async isAuthenticated() {
      const accessToken = cookie.get('accessToken')
      if (this.$state.user.name === '' && !accessToken) {
        return false
      }

      if (this.$state.user.name === '' && accessToken) {
        await this.verifyToken()
      }
      return true
    }
  }
})
