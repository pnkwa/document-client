<script setup lang="ts">
import { ref } from 'vue'
import { Rocket } from 'lucide-vue-next'
import SearchDialog from '~/feature/layout/components/SearchDialog.vue'

const showBadge = ref(true)
const isSearchOpen = ref(false)

const vReveal = {
    mounted(el: HTMLElement) {
        el.classList.add('reveal-init')
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add('reveal-in')
                        observer.unobserve(el)
                    }
                })
            },
            { threshold: 0.12 },
        )
        observer.observe(el)
    },
}
</script>

<template>
    <section id="top" class="hero">
        <div class="hero__inner">
            <div v-if="showBadge" v-reveal style="--d: 40ms" class="hero__badge">
                <Rocket class="h-4 w-4" />
                Docs hub • Fresh look
            </div>

            <h1 v-reveal style="--d: 0ms" class="hero__title">
                Find answers fast in the documentation
            </h1>

            <p v-reveal style="--d: 80ms" class="hero__lede">
                Clear guides, practical walkthroughs, and release notes—organized by real tasks so
                you can move from question to solution in minutes.
            </p>
            <DocButton
                aria-label="Search documentation"
                variant="ghost"
                size="icon"
                class="bg-primary hover:bg-primary-hover w-fit max-h-16 text-white hover:text-white p-4"
                @click="isSearchOpen = true"
            >
                Explore Documentation
            </DocButton>
        </div>
        <SearchDialog v-model="isSearchOpen" />
    </section>
</template>

<style scoped lang="scss">
$reveal-distance: 8px;
$reveal-duration: 0.5s;
$reveal-ease: ease;

.hero {
    position: relative;
    overflow: hidden;
    padding: clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem);
    border: 1px solid rgba(219, 28, 141, 0.18);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(219, 28, 141, 0.28), transparent 60%),
        radial-gradient(100% 120% at 100% 0%, rgba(246, 243, 59, 0.28), transparent 60%),
        linear-gradient(130deg, rgba(255, 255, 255, 0.96), rgba(245, 248, 255, 0.94));
    box-shadow: 0 40px 80px -60px rgba(37, 56, 88, 0.45);
}

.hero::before,
.hero::after {
    content: '';
    position: absolute;
    pointer-events: none;
}

.hero::before {
    top: -140px;
    right: -160px;
    width: 320px;
    height: 320px;
    background: radial-gradient(50% 50% at 50% 50%, rgba(246, 243, 59, 0.28), transparent 70%);
    filter: blur(20px);
    opacity: 0.75;
}

.hero::after {
    inset: auto 20% -120px;
    width: 60%;
    height: 220px;
    margin: 0 auto;
    background: radial-gradient(50% 50% at 50% 50%, rgba(219, 28, 141, 0.3), transparent 70%);
    filter: blur(60px);
    opacity: 0.8;
}

.dark .hero {
    border-color: rgba(219, 28, 141, 0.35);
    background:
        radial-gradient(120% 140% at 0% 0%, rgba(219, 28, 141, 0.4), transparent 65%),
        radial-gradient(100% 120% at 100% 0%, rgba(248, 223, 56, 0.28), transparent 60%),
        linear-gradient(130deg, rgba(24, 28, 41, 0.92), rgba(22, 24, 36, 0.92));
    box-shadow: 0 50px 90px -70px rgba(5, 8, 16, 0.7);
}

.dark .hero::before {
    background: radial-gradient(50% 50% at 50% 50%, rgba(248, 184, 56, 0.4), transparent 70%);
}

.dark .hero::after {
    background: radial-gradient(50% 50% at 50% 50%, rgba(219, 28, 141, 0.35), transparent 70%);
}

.hero__inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    text-align: center;
    max-width: 48rem;
    margin: 0 auto;
}

.hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(219, 28, 141, 0.35);
    background: rgba(219, 28, 141, 0.08);
    color: var(--color-primary);
    padding: 0.35rem 0.85rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: 999px;
}

.dark .hero__badge {
    background: rgba(219, 28, 141, 0.18);
    color: rgba(255, 214, 236, 0.95);
}

.hero__title {
    font-size: clamp(2.6rem, 6vw, 3.6rem);
    line-height: 1.05;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--color-navy-100);
}

.dark .hero__title {
    color: #f8fafc;
}

.hero__lede {
    font-size: clamp(1.05rem, 2.5vw, 1.25rem);
    line-height: 1.65;
    color: var(--color-navy-80);
}

.dark .hero__lede {
    color: rgba(226, 232, 240, 0.78);
}

.hero__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
}

.hero__primary,
.hero__ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.6rem;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition:
        background-color 0.25s ease,
        color 0.25s ease,
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.hero__primary {
    background: var(--color-primary);
    color: #fff;
    box-shadow: 0 22px 40px -24px rgba(219, 28, 141, 0.65);
}

.hero__primary:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
}

.dark .hero__primary {
    box-shadow: 0 22px 40px -24px rgba(219, 28, 141, 0.85);
}

.hero__ghost {
    border: 1px solid rgba(219, 28, 141, 0.3);
    color: var(--color-primary);
    background: rgba(219, 28, 141, 0.08);
}

.hero__ghost:hover {
    background: rgba(219, 28, 141, 0.14);
}

.dark .hero__ghost {
    background: rgba(219, 28, 141, 0.18);
    border-color: rgba(219, 28, 141, 0.45);
    color: rgba(255, 214, 236, 0.95);
}

.dark .hero__ghost:hover {
    background: rgba(219, 28, 141, 0.24);
}

.hero__stats {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    width: 100%;
    max-width: 42rem;
}

.hero__stat {
    padding: 1.25rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
}

.hero__stat dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: rgba(15, 23, 42, 0.6);
    margin-bottom: 0.35rem;
}

.hero__stat dd {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-navy-100);
}

.dark .hero__stat {
    background: rgba(22, 27, 38, 0.55);
    border-color: rgba(148, 163, 184, 0.35);
}

.dark .hero__stat dt {
    color: rgba(226, 232, 240, 0.6);
}

.dark .hero__stat dd {
    color: #f8fafc;
}

.reveal-init {
    opacity: 0;
    transform: translateY($reveal-distance);
}

.reveal-in {
    opacity: 1;
    transform: translateY(0);
    transition:
        opacity $reveal-duration $reveal-ease,
        transform $reveal-duration $reveal-ease;
    transition-delay: var(--d, 0ms);
}

@media (prefers-reduced-motion: reduce) {
    .hero {
        transition: none;
    }

    .reveal-in {
        transition: none;
    }
}
</style>
