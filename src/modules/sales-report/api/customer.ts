import axios from '@/axios'
import { ref } from 'vue'

export function useCustomerApi() {
  const listCustomer = ref([{ id: '', label: '' }])

  const fetchListCustomer = async () => {
    const result = await axios.get('/v1/customers', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listCustomer.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.name
      }
    })
  }

  return {
    listCustomer,
    fetchListCustomer
  }
}
