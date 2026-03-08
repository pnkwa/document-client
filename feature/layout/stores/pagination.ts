import type { Post } from '../types/tree-sidebar'
import {
    buildPostOrder,
    getPostNeighbors,
    type PostOrder,
    type PostNeighbors,
} from '../utils/post-order'

export const usePaginationStore = defineStore('pagination', () => {
    const paginationByGroup = ref<Record<string, PostOrder>>({})

    const setPagination = (list: Array<Post>, groupSlug: string) => {
        paginationByGroup.value[groupSlug] = buildPostOrder(list)
    }

    const getPagination = (groupSlug: string, postId: number): PostNeighbors => {
        return getPostNeighbors(paginationByGroup.value[groupSlug], postId)
    }

    return {
        setPagination,
        getPagination,
    }
})
