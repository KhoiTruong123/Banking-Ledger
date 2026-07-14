<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="fixed right-5 top-5 z-50 flex max-w-xs flex-col gap-2" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="flex items-center justify-between gap-3 rounded border px-3.5 py-3 text-[13px] font-medium shadow-lg shadow-ink/10"
        :class="toast.type === 'success' ? 'border-teal bg-teal-wash text-teal-dark' : 'border-brick bg-brick-wash text-brick'"
      >
        <span>{{ toast.message }}</span>
        <button
          class="border-none bg-transparent text-base leading-none opacity-60 hover:opacity-100"
          aria-label="Dismiss notification"
          @click="uiStore.dismiss(toast.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
/* transition-group hooks — kept as CSS since Tailwind has no equivalent */
.toast-enter-active,
.toast-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(16px);
  opacity: 0;
}
</style>
