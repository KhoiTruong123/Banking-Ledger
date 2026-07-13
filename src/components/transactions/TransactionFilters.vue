<script setup>
import { CATEGORIES } from '@/utils/constants'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  filters: { type: Object, required: true },
  accounts: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:filters', 'reset'])

function update(field, value) {
  emit('update:filters', { ...props.filters, [field]: value })
}
</script>

<template>
  <div class="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-4">
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Search Merchants or Description</span>
      <span class="relative">
        <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          class="input w-full py-2.5 pl-9 text-sm"
          type="search"
          placeholder="Apple, Starbucks, Rent…"
          :value="filters.search"
          @input="update('search', $event.target.value)"
        />
      </span>
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Account</span>
      <span class="relative">
        <select
          class="input w-full appearance-none py-2.5 pr-9 text-sm"
          :value="filters.accountId"
          @change="update('accountId', $event.target.value)"
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
          @change="update('category', $event.target.value)"
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
          @change="update('status', $event.target.value)"
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
        @change="update('dateFrom', $event.target.value)"
      />
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-medium text-ink">Til</span>
      <input
        class="input w-full py-2.5 text-sm"
        type="date"
        :value="filters.dateTo"
        :min="filters.dateFrom || undefined"
        @change="update('dateTo', $event.target.value)"
      />
    </label>

    <div class="flex items-end">
      <button type="button" class="btn btn-primary text-sm" @click="emit('reset')">
        <AppIcon name="refresh" class="h-4 w-4" />
        Reset Filters
      </button>
    </div>
  </div>
</template>
