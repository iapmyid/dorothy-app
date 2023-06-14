import axios from '@/axios'
import { ref, onMounted } from 'vue'

export function useItemCategoryApi() {
  const listItemCategory = ref([{ id: '', label: '' }])

  onMounted(async () => {
    const result = await axios.get('/v1/item-categories', {
      params: {
        pageSize: 1000,
        page: 1,
        sort: 'name'
      }
    })

    listItemCategory.value = result.data.data.map((item: any) => {
      return {
        id: item._id,
        label: item.name
      }
    })
  })

  return {
    listItemCategory
  }
}
