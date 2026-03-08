import type { PostList } from './post-detail'

export interface PostSearchResult {
    total: number
    postList: PostList[]
}
