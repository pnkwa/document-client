import { createError, showError } from '#app'
import { ref, provide, inject, type Ref } from 'vue'
import { getGroupList } from '~/core/services/group'
import type { Group, Post } from '../types/tree-sidebar'
import { getPostList } from '~/core/services/post'
import { usePaginationStore } from '../stores/pagination'
import { ValidationToError } from '~/core/types/services'

export interface DocSidebarCtx {
    groupsMap: Ref<Record<string, Group[]>>
    postsMap: Ref<Record<string, Post[]>>
    getGroups: (collectionSlug: string) => Promise<Group[]>
    getPosts: (groupSlug: string, options?: { force?: boolean }) => Promise<Post[]>
    getCollectionName: Ref<string>
}

const DOC_SIDEBAR_KEY = Symbol('DOC_SIDEBAR')

const pagination = usePaginationStore()

const DEFAULT_ERROR_GROUP_MESSAGE = 'Failed to load group list.'
const DEFAULT_ERROR_POST_MESSAGE = 'Failed to load documents.'

export const provideDocSidebar = () => {
    const groupsMap = ref<Record<string, Group[]>>({})
    const postsMap = ref<Record<string, Post[]>>({})
    const getCollectionName = ref<string>('')

    const getGroups = async (collectionSlug: string) => {
        try {
            const res = await getGroupList(collectionSlug)
            if (res.data.error || !res.data.data?.item) {
                const message = res.data.error?.message ?? DEFAULT_ERROR_GROUP_MESSAGE
                showError(
                    createError({
                        statusCode: res.data.error?.code,
                        statusMessage: DEFAULT_ERROR_GROUP_MESSAGE,
                        message,
                        fatal: true,
                    }),
                )
                return []
            }
            groupsMap.value[collectionSlug] = res.data.data.item.groups
            getCollectionName.value = res.data.data.item.collectionName
            return groupsMap.value[collectionSlug]
        } catch (error) {
            let message = DEFAULT_ERROR_GROUP_MESSAGE
            let statusCode = 500
            if (error instanceof ValidationToError) {
                if (error.message.trim().length) {
                    message = error.message.trim()
                }
                statusCode = 422
            } else if (error instanceof Error && error.message) {
                message = error.message
            }
            showError(
                createError({
                    statusCode,
                    statusMessage: DEFAULT_ERROR_GROUP_MESSAGE,
                    message,
                    fatal: true,
                }),
            )
            return []
        }
    }

    const getPosts = async (groupSlug: string, options?: { force?: boolean }) => {
        const { force } = options ?? {}
        try {
            if (!force && postsMap.value[groupSlug]) return postsMap.value[groupSlug]
            const res = await getPostList(groupSlug)
            if (res.data.error || !res.data.data?.items) {
                const message = res.data.error?.message ?? DEFAULT_ERROR_POST_MESSAGE
                showError(
                    createError({
                        statusCode: res.data.error?.code,
                        statusMessage: DEFAULT_ERROR_POST_MESSAGE,
                        message,
                        fatal: true,
                    }),
                )
                return []
            }
            postsMap.value[groupSlug] = res.data.data.items
            pagination.setPagination(postsMap.value[groupSlug], groupSlug)
            return postsMap.value[groupSlug]
        } catch (error) {
            let message = DEFAULT_ERROR_POST_MESSAGE
            let statusCode = 500
            if (error instanceof ValidationToError) {
                if (error.message.trim().length) {
                    message = error.message.trim()
                }
                statusCode = 422
            } else if (error instanceof Error && error.message) {
                message = error.message
            }
            showError(
                createError({
                    statusCode,
                    statusMessage: DEFAULT_ERROR_POST_MESSAGE,
                    message,
                    fatal: true,
                }),
            )
            return []
        }
    }

    const ctx: DocSidebarCtx = {
        groupsMap,
        postsMap,
        getPosts,
        getGroups,
        getCollectionName,
    }

    provide(DOC_SIDEBAR_KEY, ctx)
    return ctx
}

export const useDocSidebar = () => {
    const ctx = inject<DocSidebarCtx>(DOC_SIDEBAR_KEY)
    if (!ctx) throw new Error('DocSidebar context not provided')
    return ctx
}
