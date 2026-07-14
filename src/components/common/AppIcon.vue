<script setup lang="ts">
import { ICONS } from '@/utils/icons'

defineProps<{
  name: string
}>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="ICONS[name]"
  />
</template>
