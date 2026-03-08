export const COLLECTIONS_STATUS = ['PRIVATE', 'PUBLIC'] as const
export type CollectionStatus = (typeof COLLECTIONS_STATUS)[number]

export const DOCUMENTS_STATUS = ['DRAFT', 'COMPLETE'] as const
export type DocumentStatus = (typeof DOCUMENTS_STATUS)[number]

export const PUBLISH_STATUS = ['PUBLISH', 'UNPUBLISH'] as const
export type PublishStatus = (typeof PUBLISH_STATUS)[number]

export type SelectedPostStatus = 'ALL' | DocumentStatus | PublishStatus

export const statusLabelMap: Record<SelectedPostStatus, string> = {
    ALL: 'All',
    DRAFT: 'Draft',
    COMPLETE: 'Complete',
    PUBLISH: 'Published',
    UNPUBLISH: 'Unpublished',
}
