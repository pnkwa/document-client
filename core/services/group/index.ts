import type { GroupList } from '~/feature/layout/types/tree-sidebar'

export const getGroupList = async (collectionSlug: string): ApiResponse<GroupList> => {
    const { $axios } = useNuxtApp()
    return $axios.get(`v10/daywork-document/collection/${collectionSlug}/group/list`)
}
