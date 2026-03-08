export interface Group {
    dayworkDocumentCollectionID: number
    dayworkDocumentGroupID: number
    name: string
    slug: string
}

export interface GroupList {
    collectionName: string
    groups: Group[]
}
export interface Post {
    dayworkDocumentPostID: number
    title: string
    sorting: number
}

export interface postDetail {
    dayworkDocumentCollectionID: number
    dayworkDocumentCollectionName: string
    dayworkDocumentPostID: number
    dayworkDocumentGroupName: string
    title: string
    isPublish?: boolean
    sorting: number
    postDetail: {
        dayworkDocumentPostID: number
        title: string
        detailFormat: string
        sorting: number
        updatedAt: string
    }
}

export interface Collection {
    dayworkDocumentCollectionID: number
    name: string
    slug: string
    isPrivate?: boolean
}
