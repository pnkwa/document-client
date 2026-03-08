import type { Post, postDetail } from '~/feature/layout/types/tree-sidebar'
import type { PostSearchResult } from '~/feature/layout/types/search'

import { z } from 'zod'
import { callApi } from '~/core/helper/service'

export const getPostList = async (groupSlug: string): ApiResponse<Post[]> => {
    const { $axios } = useNuxtApp()
    return $axios.get(`/v10/daywork-document/group/${groupSlug}/post/list`)
}

export const getPostDetail = async (postID: number): ApiResponse<postDetail> => {
    const { $axios } = useNuxtApp()
    return await $axios.get(`/v10/daywork-document/post/${postID}`)
}

export const postSearchParamsSchema = z.object({
    dayworkDocumentCollectionSlug: z.coerce.string(),
    searchText: z.coerce.string(),
    page: z.coerce.number().int().positive().default(1),
    perPage: z.coerce.number().int().positive().max(100).default(10),
})

export type PostSearchParams = z.input<typeof postSearchParamsSchema>

export const searchPosts = async (
    postSearchParams: PostSearchParams,
): ApiResponse<PostSearchResult> => {
    const { $axios } = useNuxtApp()
    return callApi(postSearchParams, postSearchParamsSchema, (data) => {
        return $axios.get('/v10/daywork-document/post/list', { params: data })
    })
}
