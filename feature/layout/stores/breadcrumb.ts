import type { BreadcrumbItem } from '../types/breadcrumb'

export const useBreadcrumbStore = defineStore('breadcrumb', () => {
    const breadcrumbItems = ref<BreadcrumbItem[]>([])
    const collectionName = ref<string>('')

    const setBreadcrumbs = (items: BreadcrumbItem[]) => {
        breadcrumbItems.value = items
    }

    const clearBreadcrumbs = () => {
        breadcrumbItems.value = []
    }

    return {
        breadcrumbItems,
        collectionName,
        setBreadcrumbs,
        clearBreadcrumbs,
    }
})
