<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/common/AppIcon.vue'

const uiStore = useUiStore()
</script>

<template>
  <button
    type="button"
    class="fixed bottom-8 left-56 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-black/30 transition-colors hover:bg-primary-dark dark:bg-white dark:text-primary dark:hover:bg-white/90"
    :aria-pressed="uiStore.darkMode"
    aria-label="Toggle dark mode"
    @click="uiStore.toggleDarkMode()"
  >
    <AppIcon :name="uiStore.darkMode ? 'sun' : 'moon'" class="h-[18px] w-[18px]" />
  </button>
</template>
