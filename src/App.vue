<script setup lang="ts">
import { onMounted } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ToastStack from '@/components/layout/ToastStack.vue'

const accountsStore = useAccountsStore()

onMounted(() => {
  accountsStore.fetchAll()
})
</script>

<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <AppSidebar />
    <main class="w-full min-w-0 flex justify-center px-5 pb-12 pt-6 md:px-12 md:pb-16 md:pt-10">
      <div class="max-w-[1084px] w-full">
        <router-view />
      </div>
    </main>
    <ToastStack />
  </div>
</template>
