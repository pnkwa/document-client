<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RocketIcon } from 'lucide-vue-next'
import type { SidebarProps } from '~/core/types/components/sidebar'
import type { Group } from '../types/tree-sidebar'
import { provideDocSidebar } from '../contexts/useDocSidebar'
import { useRoute } from '#imports'
import AppSidebarGroup from './AppSidebarGroup.vue'

const props = defineProps<SidebarProps>()

const { getGroups, getCollectionName } = provideDocSidebar()

const groupList = ref<Group[]>([])

const COLLECTION_NAME = getCollectionName

const route = useRoute()

const activeGroupSlug = computed(() => {
    const slug = route.params.groupSlug
    return typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : ''
})

const collectionSlug = computed(() => String(route.params.collectionSlug))

const homePagePath = `/docs/${collectionSlug.value}`
const isHomeActive = computed(() => {
    let currentPath = route.path

    if (currentPath.endsWith('/') && currentPath !== '/') {
        currentPath = currentPath.slice(0, -1)
    }

    return currentPath === homePagePath
})

onMounted(async () => {
    const item = await getGroups(collectionSlug.value)
    if (item) groupList.value = item
})
</script>

<template>
    <DocSidebar v-bind="props">
        <DocSidebarHeader class="app-shell w-full flex items-center">
            <div class="flex items-center w-full">
                <img src="/public/images/character01.svg" class="w-20 h-20" />
                <div class="my-4 flex flex-col gap-2">
                    <h2
                        class="text-lg text-white font-semibold leading-tight bg-primary rounded-md p-2 w-fit"
                    >
                        {{ COLLECTION_NAME }}
                    </h2>
                    <h2
                        class="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    >
                        Documentation
                    </h2>
                </div>
            </div>
        </DocSidebarHeader>

        <DocSidebarContent class="gap-0 section-bg max-h-fit">
            <div class="border-t-1 border-gray-300 dark:border-gray-600 p-2">
                <span class="menu-heading text-xs">Introduction</span>
                <ul class="mt-2 flex flex-col gap-1">
                    <li>
                        <DocButton
                            variant="ghost"
                            :class="[
                                'flex items-center justify-start gap-2 px-3 py-1 w-full rounded-md transition-all duration-200',
                                isHomeActive
                                    ? 'bg-primary/15 text-primary ring-1 ring-primary/35 shadow-[0_12px_28px_-22px_rgba(219,28,141,0.55)]'
                                    : 'hover:bg-primary/10 hover:text-primary',
                            ]"
                            @click="navigateTo(homePagePath)"
                        >
                            <RocketIcon :size="16" :stroke-width="1.8" />
                            <span>Getting Started</span>
                        </DocButton>
                    </li>
                </ul>
            </div>
        </DocSidebarContent>

        <DocSidebarContent class="gap-0 section-bg">
            <div class="p-2 section-bg border-t-1 border-gray-300 dark:border-gray-600">
                <div class="flex items-center justify-between mb-2">
                    <span class="menu-heading text-xs">Groups</span>
                </div>
                <DocCollapsible
                    v-for="(groupItem, index) in groupList"
                    :key="`group-${index}`"
                    :default-open="activeGroupSlug === groupItem.slug"
                >
                    <AppSidebarGroup :group="groupItem" :collection-slug="collectionSlug" />
                </DocCollapsible>
            </div>
        </DocSidebarContent>

        <SidebarRail />
    </DocSidebar>
</template>
