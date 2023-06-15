import axios from '@/axios'
import { ref } from 'vue'

export function useWarehouseApi() {
  const listWarehouse = ref([{ id: '', label: '' }])
  const fetchListWarehouse = async () => {
    const result = await axios.get('/v1/warehouses', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listWarehouse.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.name
      }
    })
  }

  return {
    listWarehouse,
    fetchListWarehouse
  }
}
