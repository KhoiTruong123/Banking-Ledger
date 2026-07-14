<script setup lang="ts">
import { CATEGORIES } from '@/utils/constants'
import AppIcon from '@/components/common/AppIcon.vue'
import type { Account, TransactionFilters } from '@/types'

const props = withDefaults(
  defineProps<{
    filters: TransactionFilters
    accounts?: Account[]
  }>(),
  {
    accounts: () => []
  }
)

const emit = defineEmits<{
  'update:filters': [filters: TransactionFilters]
  reset: []
}>()

function update(field: keyof TransactionFilters, value: string) {
  emit('update:filters', { ...props.filters, [field]: value })
}
</script>

<template>
  <div class="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Search Merchants or Description</span>
      <span class="relative">
        <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          class="input w-full py-2.5 pl-9 text-sm"
          type="search"
          placeholder="Apple, Starbucks, Rent…"
          :value="filters.search"
          @input="update('search', ($event.target as HTMLInputElement).value)"
        />
      </span>
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Account</span>
      <span class="relative">
        <select
          class="input w-full appearance-none py-2.5 pr-9 text-sm"
          :value="filters.accountId"
          @change="update('accountId', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All Accounts</option>
          <option v-for="account in accounts" :key="account.id" :value="account.id">{{ account.nickname }}</option>
        </select>
        <AppIcon name="chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Category</span>
      <span class="relative">
        <select
          class="input w-full appearance-none py-2.5 pr-9 text-sm"
          :value="filters.category"
          @change="update('category', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All Categories</option>
          <option v-for="category in CATEGORIES" :key="category" :value="category">{{ category }}</option>
        </select>
        <AppIcon name="chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Status</span>
      <span class="relative">
        <select
          class="input w-full appearance-none py-2.5 pr-9 text-sm"
          :value="filters.status"
          @change="update('status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All Status</option>
          <option value="posted">Posted</option>
          <option value="pending">Pending</option>
        </select>
        <AppIcon name="chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">From</span>
      <input
        class="input w-full py-2.5 text-sm"
        type="date"
        :value="filters.dateFrom"
        :max="filters.dateTo || undefined"
        @change="update('dateFrom', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Til</span>
      <input
        class="input w-full py-2.5 text-sm"
        type="date"
        :value="filters.dateTo"
        :min="filters.dateFrom || undefined"
        @change="update('dateTo', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <div class="flex items-end">
      <button type="button" class="btn btn-primary w-full whitespace-nowrap text-sm" @click="emit('reset')">
        <AppIcon name="refresh" class="h-4 w-4" />
        Reset Filters
      </button>
    </div>
  </div>
</template>
