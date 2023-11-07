import axios from '@/axios'
import { ref } from 'vue'

export function useUserApi() {
  const listUser = ref([{ id: '', label: '' }])

  const fetchListUser = async () => {
    const result = await axios.get('/v1/users', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listUser.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.name
      }
    })
  }

  return {
    listUser,
    fetchListUser
  }
}
