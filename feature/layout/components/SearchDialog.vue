<script setup lang="ts">
import { useEventListener, useVModel, watchDebounced } from '@vueuse/core'
import { computed, onBeforeUnmount, ref } from 'vue'
import { Search, X, Folder, FileText, ChevronRight } from 'lucide-vue-next'
import { useRouter } from '#imports'

import { searchPosts } from '~/core/services/post'
import { toastActionError } from '../utils/toast-helper'

import type { PostList } from '../types/post-detail'

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const route = useRoute()
const router = useRouter()

const isOpen = useVModel(props, 'modelValue', emit)

const collectionSlug = computed(() => String(route.params.collectionSlug))
const sanitizedSearchText = computed(() => searchText.value.trim())

const searchText = ref('')
const isSearching = ref(false)
const results = ref<PostList[]>([])
const hasSearched = ref(false)
const dialogRef = ref<HTMLElement | null>(null)

const currentPage = ref(1)
const perPage = 10

const closeDialog = () => {
    isOpen.value = false
    resetState()
}

const resetState = () => {
    searchText.value = ''
    hasSearched.value = false
    isSearching.value = false
    currentPage.value = 1
    results.value = []
}

const onKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value) return
    if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog()
    }
}

useEventListener(() => window, 'keydown', onKeydown, { passive: false })

onBeforeUnmount(() => {
    resetState()
})

const loadResults = async () => {
    const trimmed = sanitizedSearchText.value
    if (!trimmed) {
        results.value = []
        hasSearched.value = false
        return
    }

    isSearching.value = true
    try {
        const response = await searchPosts({
            dayworkDocumentCollectionSlug: collectionSlug.value,
            searchText: trimmed,
            page: currentPage.value,
            perPage,
        })

        if (!response.data.data?.item) {
            results.value = []
            hasSearched.value = true
            return
        }

        results.value = response.data.data.item.postList
        hasSearched.value = true
    } catch (error) {
        toastActionError('load', 'documents', error)
    } finally {
        isSearching.value = false
    }
}

const handleSelect = async (item: PostList) => {
    if (!item.groupSlug) {
        return
    }

    await router.push(
        `/docs/${collectionSlug.value}/${item.groupSlug}/${item.dayworkDocumentPostID}`,
    )
    closeDialog()
}

const showEmptyState = computed(
    () => hasSearched.value && !isSearching.value && results.value.length === 0,
)

watchDebounced(
    () => sanitizedSearchText.value,
    async () => {
        await loadResults()
    },
    { debounce: 400, maxWait: 1500 },
)
</script>

<template>
    <Teleport to="body">
        <transition name="fade">
            <div
                v-if="isOpen"
                ref="dialogRef"
                class="fixed inset-0 z-50 flex items-center justify-center px-4"
                aria-modal="true"
                role="dialog"
            >
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDialog" />
                <div
                    class="relative z-10 w-full max-w-2xl min-h-[300px] rounded-lg border border-navy-40 bg-background-primary shadow-2xl"
                >
                    <header
                        class="flex items-center justify-between border-b border-navy-40 px-6 py-4"
                    >
                        <div>
                            <h2 class="text-lg font-semibold text-navy-100">
                                Search Documentation
                            </h2>
                            <p class="text-sm text-muted-foreground text-text-main">
                                Find content across this collection.
                            </p>
                        </div>
                        <DocButton
                            variant="ghost"
                            size="icon"
                            class="text-text-main"
                            @click="closeDialog"
                        >
                            <X :stroke-width="1.8" />
                        </DocButton>
                    </header>

                    <div class="border-b border-navy-40 px-6 py-4">
                        <div class="relative">
                            <Search
                                :size="16"
                                class="text-text-main pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                v-model="searchText"
                                placeholder="Search by keywords..."
                                data-slot="input"
                                class="w-full text-text-main rounded-md border border-navy-20 bg-background-secondary py-2 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    <section class="max-h-[400px] overflow-y-auto px-6 py-4">
                        <div
                            v-if="isSearching"
                            class="flex items-center justify-center py-10 text-text-main"
                        >
                            <DocSpinner />
                        </div>

                        <div v-else-if="showEmptyState" class="py-12 text-center text-text-main">
                            <p>No documents found for “{{ searchText }}”.</p>
                            <p class="text-sm">
                                Try adjusting your keywords or checking for typos.
                            </p>
                        </div>

                        <ul v-else class="flex flex-col gap-2">
                            <li
                                v-for="item in results"
                                :key="item.dayworkDocumentPostID"
                                class="group rounded-md border border-navy-20 bg-background-secondary/50 transition hover:border-primary/30 hover:bg-primary/5 focus-within:border-primary/40"
                            >
                                <button
                                    type="button"
                                    class="flex w-full items-center gap-3 px-4 py-3 text-left"
                                    @click="handleSelect(item)"
                                >
                                    <div
                                        class="flex min-w-0 max-w-[40%] items-center gap-2 rounded-md border border-navy-20 bg-background-primary/70 px-2.5 py-1.5 text-xs text-muted-foreground group-hover:border-primary/30 group-hover:bg-background-primary"
                                    >
                                        <Folder :size="14" class="shrink-0 text-text-main" />
                                        <span class="truncate text-text-main">
                                            {{
                                                item.groupName?.trim() ||
                                                item.groupSlug?.trim() ||
                                                'Unknown group'
                                            }}
                                        </span>
                                    </div>

                                    <ChevronRight
                                        :size="16"
                                        class="mt-0.5 shrink-0 text-text-main/70"
                                    />

                                    <div class="flex min-w-0 flex-1 items-center gap-2">
                                        <FileText
                                            :size="16"
                                            class="mt-[1px] shrink-0 text-primary"
                                        />
                                        <div class="min-w-0">
                                            <div
                                                class="truncate text-sm text-text-main font-semibold group-hover:text-primary"
                                                :title="item.title"
                                            >
                                                {{ item.title }}
                                            </div>
                                            <div
                                                class="mt-0.5 line-clamp-1 text-xs text-text-main/80"
                                            >
                                                ID: {{ item.dayworkDocumentPostID }}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </transition>
    </Teleport>
</template>
