import axios from '@/axios'
import { ref } from 'vue'

export function useItemApi() {
  const listItem = ref([{ id: '', label: '' }])
  const fetchListItem = async () => {
    const result = await axios.get('/v1/items', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listItem.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: `${item.name} [${item.color} ${item.size}]`
      }
    })
  }

  return {
    listItem,
    fetchListItem
  }
}
