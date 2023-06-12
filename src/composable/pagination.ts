import { ref } from 'vue'

export function usePagination() {
  const page = ref(1)
  const pageCount = ref(0)
  const pageSize = ref(0)
  const totalDocument = ref(0)

  const previousPage = () => {
    if (page.value === 1) {
      return 1
    }

    return page.value - 1
  }

  const nextPage = () => {
    if (page.value === pageCount.value) {
      return pageCount.value
    }

    return page.value + 1
  }

  const dataFrom = () => {
    if (totalDocument.value === 0) {
      return 0
    }

    return pageSize.value * (page.value - 1) + 1
  }

  const dataTo = () => {
    if (totalDocument.value > pageSize.value) {
      return pageSize.value * page.value
    }
    return totalDocument.value
  }

  return {
    page,
    pageCount,
    pageSize,
    totalDocument,
    previousPage,
    nextPage,
    dataFrom,
    dataTo
  }
}
