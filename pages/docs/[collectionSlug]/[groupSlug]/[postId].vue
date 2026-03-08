<script setup lang="ts">
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import { useRoute } from '#imports'
import { createError, showError } from '#app'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { getPostDetail } from '~/core/services/post'
import type { postDetail } from '~/feature/layout/types/tree-sidebar'
import { usePaginationStore } from '~/feature/layout/stores/pagination'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useBreadcrumbStore } from '~/feature/layout/stores/breadcrumb'
import { ValidationToError } from '~/core/types/services'

const route = useRoute()
const paginationStore = usePaginationStore()
const { $dompurify } = useNuxtApp()

const loading = ref(true)
const detail = ref<postDetail | undefined>(undefined)
const contentRef = ref<HTMLElement | undefined>(undefined)
const tocListRef = ref<HTMLElement | undefined>(undefined)
const markerRef = ref<HTMLElement | undefined>(undefined)
const headingMap = ref<Array<{ id: string; text: string; level: number }>>([])

const breadcrumbStore = useBreadcrumbStore()

const collectionSlug = computed(() => String(route.params.collectionSlug))
const groupSlug = computed(() => String(route.params.groupSlug))
const postId = computed(() => Number(route.params.postId))
const neighbors = computed(() => paginationStore.getPagination(groupSlug.value, postId.value))
const prevNeighbor = computed(() => neighbors.value.prev)
const nextNeighbor = computed(() => neighbors.value.next)

const load = async () => {
    loading.value = true
    detail.value = undefined
    if (Number.isNaN(postId.value)) {
        showError(
            createError({
                statusCode: 400,
                statusMessage: 'Invalid document identifier',
                message: 'Invalid document identifier',
                fatal: true,
            }),
        )
        return
    }
    try {
        const res = await getPostDetail(postId.value)
        const item = res?.data?.data?.item
        if (!item) {
            showError(
                createError({
                    statusCode: 404,
                    statusMessage: 'Document not found',
                    message: 'Document not found',
                    fatal: true,
                }),
            )
            return
        }
        detail.value = item
    } catch (error) {
        let message = 'We hit a snag while loading this document.'
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
                statusMessage: 'We hit a snag while loading this document.',
                message,
                fatal: true,
            }),
        )
        return
    } finally {
        loading.value = false
    }
}

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 60)

const buildHeadingAnchors = (html: string) => {
    return html.replace(/<(h[1-3])>(.*?)<\/\1>/gi, (_, tag, content) => {
        const text = content.replace(/<[^>]*>/g, '').trim()
        const id = slugify(text)
        return `<${tag} id="${id}">
        <a href="#${id}" class=" hover:text-primary">${text}</a>
      </${tag}>`
    })
}

const documentBody = computed(() => {
    const raw = detail.value?.postDetail?.detailFormat ?? ''
    return buildHeadingAnchors(raw)
})

const safeHtmlBody = computed(() => {
    return documentBody.value ? $dompurify.sanitize(documentBody.value) : ''
})

const onAnchorClick = (e: MouseEvent, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(undefined, '', `#${id}`)
}

const updateHeadingMap = async () => {
    headingMap.value = []
    if (!documentBody.value) return
    await nextTick()
    const container = contentRef.value
    if (!container) return

    const nodes = Array.from(container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3'))
    if (!nodes.length) return

    const usedIds = new Set<string>()
    headingMap.value = nodes.map((heading, index) => {
        const headingName = heading.textContent?.trim() ?? `Section ${index + 1}`
        const headingSlug = slugify(headingName)
        const level = heading.tagName.toLowerCase() === 'h3' ? 3 : 2

        let uniqueId = headingSlug
        let suffix = 1
        while (usedIds.has(uniqueId)) {
            uniqueId = `${headingSlug}-${suffix++}`
        }
        usedIds.add(uniqueId)
        heading.id = uniqueId
        return { id: uniqueId, text: headingSlug, level }
    })
}

const activeHeadingId = ref<string | undefined>(undefined)

const updateActiveHeading = () => {
    const scrollY = window.scrollY
    let current: string | undefined = undefined

    for (const h of headingMap.value) {
        const el = document.getElementById(h.id)
        if (!el) continue
        const offsetTop = el.getBoundingClientRect().top + window.scrollY - 120
        if (scrollY >= offsetTop) current = h.id
    }
    activeHeadingId.value = current
}

const updateMarkerPosition = () => {
    const list = tocListRef.value
    const marker = markerRef.value
    if (!list || !marker) return

    const id = activeHeadingId.value
    if (!id) {
        marker.style.opacity = '0'
        return
    }

    const link = list.querySelector<HTMLAnchorElement>(`a[data-id="${id}"]`)
    if (!link) {
        marker.style.opacity = '0'
        return
    }

    const listRect = list.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    const markerH = marker.offsetHeight || 20
    const top = linkRect.top - listRect.top + (link.offsetHeight - markerH) / 2

    marker.style.top = `${Math.max(0, top)}px`
    marker.style.opacity = '1'
}

const handleScroll = async () => {
    updateActiveHeading()
    await nextTick()
    updateMarkerPosition()
}

onMounted(async () => {
    breadcrumbStore.clearBreadcrumbs()
    await load()

    if (detail.value) {
        const groupName = detail.value.dayworkDocumentGroupName
        const docTitle = detail.value.postDetail.title
        breadcrumbStore.setBreadcrumbs([{ label: groupName }, { label: docTitle ?? 'Document' }])
    }

    await nextTick()
    updateHeadingMap()
    updateActiveHeading()

    await nextTick(updateMarkerPosition)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateMarkerPosition)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', updateMarkerPosition)

    breadcrumbStore.clearBreadcrumbs()
})
</script>

<template>
    <div class="flex justify-center container mx-auto">
        <DocumentLayout
            :padded="false"
            class="relative flex flex-col overflow-hidden bg-background-primary px-0 py-0 text-text-main transition-colors w-full"
        >
            <div
                class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(700px_320px_at_0%_0%,var(--color-primary)/14,transparent),radial-gradient(800px_420px_at_100%_0%,var(--color-primary-hover)/12,transparent)]"
            />
            <div v-if="loading" class="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
                <DocSpinner />
            </div>

            <div v-if="detail" class="flex flex-1 flex-col">
                <header
                    class="relative border-b border-navy-20 rounded-t-md bg-background-secondary py-4 sm:px-6"
                >
                    <div class="relative mx-auto w-full max-w-6xl">
                        <span
                            class="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary"
                        >
                            Documentation
                        </span>
                        <h1 class="mt-1 text-2xl font-bold text-navy-100 sm:text-3xl">
                            {{ detail.postDetail.title }}
                        </h1>
                    </div>
                </header>

                <main class="flex-1 bg-transparent px-4 py-6 sm:px-6">
                    <div class="mx-auto w-full max-w-6xl space-y-6 lg:flex lg:gap-8">
                        <div class="flex-1 space-y-6">
                            <div
                                v-if="headingMap.length"
                                class="rounded-lg border border-navy-20 bg-background-tertiary/80 p-3 shadow-sm lg:hidden"
                            >
                                <div
                                    class="text-[11px] font-semibold uppercase tracking-wide text-navy-60"
                                >
                                    On this page
                                </div>
                                <div class="mt-2 flex flex-col gap-1.5 text-sm text-navy-80">
                                    <a
                                        v-for="item in headingMap"
                                        :key="item.id"
                                        :href="`#${item.id}`"
                                        :class="[
                                            item.level === 3 ? 'pl-3 text-navy-60' : '',
                                            activeHeadingId === item.id
                                                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                                : '',
                                        ]"
                                        class="block w-full rounded-md px-2 py-1 text-left font-medium transition hover:bg-color-primary/10 hover:text-primary"
                                        @click="(e) => onAnchorClick(e, item.id)"
                                    >
                                        {{ item.text }}
                                    </a>
                                </div>
                            </div>

                            <div class="bg-background-tertiary/60 backdrop-blur-[2px]">
                                <div
                                    ref="contentRef"
                                    class="text-pretty md:text-balance doc-content space-y-4 text-[15px] leading-relaxed text-navy-80 [&>h2]:mt-6 [&>h2]:text-xl [&>h2]:font-semibold [&>h3]:mt-4 [&>h3]:text-lg [&>h3]:font-semibold [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>a]:font-semibold [&>a]:text-primary [&>a:hover]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-3 [&>code]:rounded [&>code]:bg-navy-10/60 [&>code]:px-1.5 [&>code]:py-0.5"
                                    v-html="safeHtmlBody"
                                />
                            </div>
                        </div>
                    </div>
                </main>

                <footer
                    class="border-t border-navy-20 bg-background-secondary/90 rounded-b-md px-4 py-4 backdrop-blur sm:px-6"
                >
                    <div
                        class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3"
                    >
                        <div class="min-w-[220px] flex-1">
                            <NuxtLink
                                v-if="prevNeighbor"
                                :to="{
                                    name: 'docs-collectionSlug-groupSlug-postId',
                                    params: {
                                        collectionSlug,
                                        groupSlug,
                                        postId: prevNeighbor.id,
                                    },
                                }"
                                :title="prevNeighbor.title || 'Previous document'"
                                class="group inline-flex w-full max-w-[320px] items-center gap-2 rounded-md bg-primary px-3 py-2 text-left text-sm font-semibold text-white shadow hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-2"
                            >
                                <ChevronLeft
                                    class="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-1"
                                />
                                <div class="overflow-hidden">
                                    <span
                                        class="text-[10px] font-semibold uppercase tracking-wide text-white/70"
                                    >
                                        Previous
                                    </span>
                                    <p class="truncate">
                                        {{ prevNeighbor.title || 'Previous document' }}
                                    </p>
                                </div>
                            </NuxtLink>
                            <span
                                v-else
                                class="inline-flex w-full max-w-[320px] items-center gap-2 rounded-md border border-dashed border-navy-20 px-3 py-2 text-sm text-navy-60"
                            >
                                <ChevronLeft class="h-4 w-4 flex-shrink-0" />
                                First document in this group
                            </span>
                        </div>

                        <div class="min-w-[220px] flex flex-1 justify-end">
                            <NuxtLink
                                v-if="nextNeighbor"
                                :to="{
                                    name: 'docs-collectionSlug-groupSlug-postId',
                                    params: { collectionSlug, groupSlug, postId: nextNeighbor.id },
                                }"
                                :title="nextNeighbor.title || 'Next document'"
                                class="group inline-flex w-full max-w-[320px] items-center justify-end gap-2 rounded-md bg-primary px-3 py-2 text-right text-sm font-semibold text-white shadow hover:bg-color-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-2"
                            >
                                <div class="flex-1 overflow-hidden text-right">
                                    <span
                                        class="text-[10px] font-semibold uppercase tracking-wide text-white/70"
                                    >
                                        Next
                                    </span>
                                    <p class="truncate">
                                        {{ nextNeighbor.title || 'Next document' }}
                                    </p>
                                </div>
                                <ChevronRight
                                    class="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                                />
                            </NuxtLink>
                            <span
                                v-else
                                class="inline-flex w-full max-w-[320px] items-center justify-end gap-2 rounded-md border border-dashed border-navy-20 px-3 py-2 text-sm text-color-navy-60"
                            >
                                Last document in this group
                                <ChevronRight class="h-4 w-4 flex-shrink-0" />
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </DocumentLayout>
        <aside v-if="headingMap.length" class="hidden w-56 flex-shrink-0 lg:block">
            <div class="sticky top-20 space-y-3 px-10">
                <div class="text-[11px] font-semibold uppercase tracking-wide text-navy-60">
                    On this page
                </div>

                <div class="relative">
                    <div ref="markerRef" class="outline-marker" aria-hidden="true"></div>

                    <ul ref="tocListRef" class="space-y-1.5 text-sm text-navy-80">
                        <li v-for="item in headingMap" :key="item.id" class="block">
                            <a
                                :data-id="item.id"
                                class="block w-full rounded-md px-2 py-1 text-left font-medium transition hover:bg-primary/10 hover:text-primary"
                                :class="[
                                    item.level === 3 ? 'pl-3 text-navy-60' : '',
                                    activeHeadingId === item.id ? 'text-primary' : '',
                                ]"
                                :href="`#${item.id}`"
                                @click="(e) => onAnchorClick(e, item.id)"
                            >
                                {{ item.text }}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    </div>
</template>
<style lang="scss">
.outline-marker {
    opacity: 0;
    position: absolute;
    background-color: var(--color-primary);
    border-radius: 4px;
    width: 4px;
    height: 20px;
    top: 32px;
    left: -6px;
    z-index: 0;
    transition:
        top 0.25s cubic-bezier(0, 1, 0.5, 1),
        opacity 0.25s,
        background-color 0.5s;
}
</style>
