<script setup lang="ts">
import type { NuxtError } from '#app'
import { clearError } from '#app'
import { useRouter } from '#imports'
import { computed } from 'vue'
import {
    Search,
    Lock,
    ShieldBan,
    Timer,
    ServerCrash,
    Bug,
    Construction,
    CircleAlert,
    ArrowLeft,
    type LucideIcon,
} from 'lucide-vue-next'

type ExtendedNuxtError = NuxtError & { url?: string }

const props = defineProps<{ error: NuxtError }>()
const router = useRouter()

const STATUS_MAP: Record<
    number | 'timeout' | 'server' | 'client' | 'default',
    { title: string; icon: LucideIcon }
> = {
    400: { title: 'Bad request', icon: CircleAlert },
    401: { title: 'Unauthorized', icon: Lock },
    403: { title: 'Access denied', icon: ShieldBan },
    404: { title: 'Page not found', icon: Search },
    408: { title: 'Request timed out', icon: Timer },
    502: { title: 'Bad gateway', icon: ServerCrash },
    503: { title: 'Service unavailable', icon: Construction },
    504: { title: 'Request timed out', icon: Timer },

    timeout: { title: 'Request timed out', icon: Timer },
    server: { title: 'Something went wrong', icon: Bug },
    client: { title: 'Unexpected error', icon: CircleAlert },
    default: { title: 'Something went wrong', icon: CircleAlert },
}

const statusCode = computed(() => props.error.statusCode)

const getErrorInfo = (code: number) => {
    if (STATUS_MAP[code]) return STATUS_MAP[code]
    if (code === 408 || code === 504) return STATUS_MAP.timeout
    if (code >= 500) return STATUS_MAP.server
    if (code >= 400) return STATUS_MAP.client
    return STATUS_MAP.default
}

const { title, Icon } = (() => {
    const errorInfo = computed(() => getErrorInfo(statusCode.value))
    return {
        title: computed(() => errorInfo.value.title),
        Icon: computed(() => errorInfo.value.icon),
    }
})()

const description = computed(() => {
    const e = props.error as ExtendedNuxtError
    if (e.message) return e.message
    if (statusCode.value === 404) return 'We couldn’t find the page you’re looking for.'
    return 'An unexpected error has occurred.'
})

const detailedMessage = computed(() => {
    const msg = props.error.message
    if (!msg || msg === description.value) return null
    return msg
})

const goBack = () => {
    if (import.meta.client && window.history.length > 1) {
        clearError()
        router.back()
        return
    }
}
</script>

<template>
    <main
        class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-200 via-purple-100 to-yellow-100 text-neutral-800 dark:from-purple-950 dark:via-violet-950 dark:to-yellow-900"
        role="main"
    >
        <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_70%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_70%)]"
            aria-hidden="true"
        />

        <section
            class="relative z-10 grid w-full max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center"
        >
            <div class="relative">
                <img
                    src="/images/error.svg"
                    alt=""
                    aria-hidden="true"
                    class="relative z-10 mx-auto max-w-[420px] animate-float"
                />
            </div>

            <div class="text-left">
                <div
                    class="flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-neutral-600 dark:text-neutral-300"
                    aria-label="Error header"
                >
                    <span class="inline-flex h-12 w-12 items-center justify-center">
                        <component
                            :is="Icon"
                            class="h-6 w-6 text-purple-600 dark:text-purple-400"
                        />
                    </span>
                    <span>{{ statusCode }}</span>
                    <span class="h-1 w-1 rounded-full bg-neutral-400" />
                    <span>{{ title }}</span>
                </div>

                <div class="mt-6">
                    <h1 class="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        Something isn't quite right.
                    </h1>
                    <p class="mt-4 max-w-xl text-base text-neutral-700 dark:text-neutral-300">
                        {{ description }}
                    </p>
                </div>

                <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-transparent"
                        @click="goBack"
                    >
                        <ArrowLeft class="h-4 w-4" />
                        Go Back
                    </button>
                </div>

                <div v-if="detailedMessage" class="mt-10 max-w-md" aria-live="polite">
                    <p
                        class="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
                    >
                        Details
                    </p>
                    <p class="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        {{ detailedMessage }}
                    </p>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.animate-float {
    animation: float 12s ease-in-out infinite;
}
@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(12px);
    }
}
</style>
