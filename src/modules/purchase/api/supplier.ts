import axios from '@/axios'
import { ref, onMounted } from 'vue'

export function useSupplierApi() {
  const listSupplier = ref([{ id: '', label: '' }])

  onMounted(async () => {
    const result = await axios.get('/v1/suppliers', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listSupplier.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.name
      }
    })
  })

  return {
    listSupplier
  }
}
