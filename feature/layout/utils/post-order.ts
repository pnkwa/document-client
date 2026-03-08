import type { Post } from '../types/tree-sidebar'

type OrderItem = { id: number; sorting: number; title: string }

export type PostOrder = {
    order: Array<OrderItem>
    index: Record<number, number>
}

export type PostNeighbor = Pick<OrderItem, 'id' | 'title'>

export type PostNeighbors = {
    prev: PostNeighbor | null
    next: PostNeighbor | null
}

export const sortItemsByDefault = (a: OrderItem, b: OrderItem) => {
    return (a.sorting ?? 0) - (b.sorting ?? 0)
}

const toOrderItems = (list: Array<Post>): OrderItem[] =>
    list
        .map((post) => {
            const id = post?.dayworkDocumentPostID
            const title = post?.title
            if (typeof id !== 'number' || typeof title !== 'string') return null
            return { id, sorting: post?.sorting ?? 0, title }
        })
        .filter(Boolean) as OrderItem[]

export const buildPostOrder = (list: Array<Post>): PostOrder => {
    const items = toOrderItems(list)
    const ordered = items.slice().sort(sortItemsByDefault)
    const index: Record<number, number> = {}
    ordered.forEach((item, i) => {
        index[item.id] = i
    })
    return { order: ordered, index }
}

export const getPostNeighbors = (order: PostOrder | undefined, postId: number): PostNeighbors => {
    if (!order) return { prev: null, next: null }
    const position = order.index[postId]
    if (typeof position !== 'number') return { prev: null, next: null }

    const prev = position > 0 ? order.order[position - 1] : null
    const next = position < order.order.length - 1 ? order.order[position + 1] : null

    return {
        prev,
        next,
    }
}
