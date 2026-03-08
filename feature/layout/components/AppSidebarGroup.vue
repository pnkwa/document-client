<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { useRoute } from '#imports'
import { ChevronRight, Folder, FileText } from 'lucide-vue-next'

import type { Group, Post } from '../types/tree-sidebar'
import { provideDocSidebar } from '../contexts/useDocSidebar'

const props = defineProps<{
    group: Group
    collectionSlug: string
}>()

const { getPosts } = provideDocSidebar()

const posts = ref<Post[]>([])

watchEffect(async () => {
    if (!props.group) {
        posts.value = []
        return
    }
    try {
        const list = await getPosts(props.group.slug)
        posts.value = Array.isArray(list) ? list : []
    } catch {
        posts.value = []
    }
})

const route = useRoute()

const activePostId = computed(() => {
    const id = route.params.postId

    if (typeof id === 'string') return id
    return null
})

const toPost = (doc: Post) =>
    `/docs/${props.collectionSlug}/${props.group.slug}/${doc.dayworkDocumentPostID}`

const matchesActiveId = (value: string | number | null, candidate: number | string) => {
    if (value === null) return false
    const normalizedValue = Number.isNaN(Number(value)) ? String(value) : String(Number(value))
    const normalizedCandidate = Number.isNaN(Number(candidate))
        ? String(candidate)
        : String(Number(candidate))
    return normalizedValue === normalizedCandidate
}

const isActiveDoc = (doc: Post) => matchesActiveId(activePostId.value, doc.dayworkDocumentPostID)

const isRouteGroupActive = computed(() => {
    const slug = route.params.groupSlug
    const activeSlug = typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : ''
    return activeSlug === props.group.slug
})

const groupIsActive = computed(
    () => isRouteGroupActive.value || posts.value.some((doc) => isActiveDoc(doc)),
)

const groupHeaderClasses = computed(() => [
    'group/collection flex items-center gap-2 py-2 px-2 w-full  transition-all duration-200',
    groupIsActive.value
        ? 'text-primary'
        : 'border-transparent hover:bg-muted/40 hover:text-foreground/90',
])

const docItemClasses = (doc: Post) => [
    'group/document !w-[250px] ml-2 relative flex items-center justify-between rounded-md border border-transparent px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    isActiveDoc(doc)
        ? 'bg-primary/12 text-primary ring-1 ring-primary/40 shadow-[0_16px_32px_-24px_rgba(202,165,13,0.65)]'
        : 'text-muted-foreground hover:border-primary/25 hover:bg-primary/10 hover:text-primary/90',
]

const docIconClasses = (doc: Post) =>
    isActiveDoc(doc)
        ? 'text-primary'
        : 'text-muted-foreground/75 group-hover/document:text-primary/80'

const docTitleClasses = (doc: Post) =>
    `truncate text-start font-medium ${isActiveDoc(doc) ? 'text-primary' : 'text-muted-foreground group-hover/document:text-primary/90'}`
</script>

<template>
    <DocSidebarGroup>
        <DocSidebarGroupLabel as-child>
            <div :class="groupHeaderClasses" :data-active="groupIsActive || undefined">
                <DocCollapsibleTrigger
                    class="group/trigger flex items-center gap-2 text-sm min-w-0"
                    aria-label="Toggle collection"
                >
                    <ChevronRight
                        :size="18"
                        class="shrink-0 transition-transform group-data-[state=open]/trigger:rotate-90"
                    />
                    <Folder
                        :size="18"
                        class="shrink-0 transition-colors duration-200"
                        :class="
                            groupIsActive
                                ? 'text-primary '
                                : 'text-muted-foreground/80 group-hover/trigger:text-primary/70'
                        "
                    />
                    <span
                        class="truncate max-w-[110px] md:max-w-[180px]"
                        :class="
                            groupIsActive
                                ? 'font-semibold text-primary '
                                : 'font-medium text-muted-foreground group-hover/trigger:text-primary/80'
                        "
                    >
                        {{ props.group.name }}
                    </span>
                </DocCollapsibleTrigger>
            </div>
        </DocSidebarGroupLabel>

        <DocCollapsibleContent>
            <DocSidebarGroupContent>
                <DocSidebarMenu>
                    <DocSidebarMenuItem
                        v-for="doc in posts"
                        :key="doc.dayworkDocumentPostID"
                        :data-id="doc.dayworkDocumentPostID"
                    >
                        <DocSidebarMenuButton as-child>
                            <div
                                :class="docItemClasses(doc)"
                                :data-active="isActiveDoc(doc) || undefined"
                            >
                                <NuxtLink
                                    class="flex items-center w-full gap-3 pl-6 pr-2"
                                    :to="toPost(doc)"
                                    :aria-current="isActiveDoc(doc) ? 'page' : undefined"
                                >
                                    <div class="flex gap-2 items-center w-full">
                                        <FileText
                                            :size="18"
                                            :stroke-width="1.8"
                                            class="transition-colors duration-200"
                                            :class="docIconClasses(doc)"
                                        />
                                        <span :class="docTitleClasses(doc)">{{ doc.title }}</span>
                                    </div>
                                </NuxtLink>
                            </div>
                        </DocSidebarMenuButton>
                    </DocSidebarMenuItem>
                </DocSidebarMenu>
            </DocSidebarGroupContent>
        </DocCollapsibleContent>
    </DocSidebarGroup>
</template>
