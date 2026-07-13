<script setup>
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/common/AppIcon.vue'

const uiStore = useUiStore()
</script>

<template>
  <button
    type="button"
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10"
    :aria-pressed="uiStore.darkMode"
    aria-label="Toggle dark mode"
    @click="uiStore.toggleDarkMode()"
  >
    <AppIcon :name="uiStore.darkMode ? 'sun' : 'moon'" class="h-[18px] w-[18px]" />
  </button>
</template>
