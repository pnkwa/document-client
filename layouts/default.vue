<script setup lang="ts">
import { computed, ref } from 'vue'

import { Search } from 'lucide-vue-next'
import AppSidebar from '~/feature/layout/components/AppSidebar.vue'
import SearchDialog from '~/feature/layout/components/SearchDialog.vue'
import { useBreadcrumbStore } from '~/feature/layout/stores/breadcrumb'

const breadcrumbStore = useBreadcrumbStore()
const { breadcrumbItems } = storeToRefs(breadcrumbStore)

const hasBreadcrumb = computed(() => breadcrumbItems.value.length > 0)
const isSearchOpen = ref(false)
</script>

<template>
    <DocSidebarProvider class="app-shell">
        <AppSidebar />
        <main class="flex min-h-svh w-full flex-1 flex-col">
            <header
                class="flex h-[50px] shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
            >
                <div class="flex gap-2 px-4 justify-between w-full">
                    <div class="flex gap-2 items-center">
                        <DocSidebarTrigger class="-ml-1" />
                        <DocSeparator orientation="vertical" class="mr-2 h-4" />

                        <DocBreadcrumb v-if="hasBreadcrumb">
                            <DocBreadcrumbList>
                                <template
                                    v-for="(item, index) in breadcrumbItems"
                                    :key="`crumb-${index}-${item.label}`"
                                >
                                    <DocBreadcrumbItem>
                                        <template v-if="index < breadcrumbItems.length - 1">
                                            <DocBreadcrumbLink
                                                :as="item.to ? 'a' : 'span'"
                                                :href="item.to"
                                            >
                                                {{ item.label }}
                                            </DocBreadcrumbLink>
                                        </template>
                                        <DocBreadcrumbPage v-else>
                                            {{ item.label }}
                                        </DocBreadcrumbPage>
                                    </DocBreadcrumbItem>
                                    <DocBreadcrumbSeparator
                                        v-if="index < breadcrumbItems.length - 1"
                                    />
                                </template>
                            </DocBreadcrumbList>
                        </DocBreadcrumb>
                    </div>

                    <div class="flex gap-2 items-center justify-center">
                        <DocButton
                            aria-label="Search documentation"
                            variant="ghost"
                            size="icon"
                            class="hover:text-primary"
                            @click="isSearchOpen = true"
                        >
                            <Search :stroke-width="1.8" />
                        </DocButton>
                        <DocDarkMode class="mx-2" />
                    </div>
                </div>
            </header>

            <slot />

            <SearchDialog v-model="isSearchOpen" />
        </main>
    </DocSidebarProvider>
</template>

<style lang="scss">
main {
    width: 100%;
}
</style>
