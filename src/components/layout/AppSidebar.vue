<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import AppIcon from '@/components/common/AppIcon.vue'
import DarkModeToggle from '@/components/common/DarkModeToggle.vue'

const accountsStore = useAccountsStore()
const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { to: '/accounts', label: 'Accounts', icon: 'squares' },
  { to: '/transactions', label: 'Transactions', icon: 'document-text' },
  { to: '/transfer', label: 'Transfer', icon: 'arrows-right-left' },
  { to: '/insights', label: 'Insights', icon: 'trending-up' }
]

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="w-full shrink-0 bg-ink text-white/90 md:flex md:w-60 md:flex-col md:overflow-visible md:py-7">
    <div
      class="flex items-center justify-between px-4 py-3 md:flex-col md:items-stretch md:gap-0.5 md:border-b md:border-white/10 md:px-6 md:py-0 md:pb-6"
    >
      <div class="flex items-baseline gap-2 md:flex-col md:items-stretch md:gap-0.5">
        <span class="font-display text-[22px] font-bold tracking-tight text-white">Ledger</span>
        <span v-if="accountsStore.customer" class="text-xs text-white/55">{{ accountsStore.customer.name }}</span>
      </div>

      <div class="flex items-center gap-1 md:self-end">
        <DarkModeToggle />

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <AppIcon :name="mobileMenuOpen ? 'x-mark' : 'menu'" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <nav
      class="flex-col gap-0.5 px-2 pb-3 md:flex md:flex-1 md:px-3 md:py-2 md:pb-2"
      :class="mobileMenuOpen ? 'flex' : 'hidden'"
    >
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-4 py-[11px] text-sm font-bold transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-white/10 text-teal'
            : 'text-white/70 hover:bg-white/5 hover:text-white'
        "
        @click="mobileMenuOpen = false"
      >
        <AppIcon :name="item.icon" class="h-[18px] w-[18px] shrink-0" />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="flex-col gap-4 px-4 pb-4 md:flex md:px-3 md:pb-2" :class="mobileMenuOpen ? 'flex' : 'hidden'">
      <router-link
        to="/transfer"
        class="flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark"
        @click="mobileMenuOpen = false"
      >
        <AppIcon name="plus" class="h-4 w-4" />
        Transfer Money
      </router-link>
    </div>
  </aside>
</template>
