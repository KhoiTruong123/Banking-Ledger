<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useTransactionsStore } from '@/stores/transactions'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import TransactionRow from '@/components/transactions/TransactionRow.vue'
import TransactionDetail from '@/components/transactions/TransactionDetail.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { exportTransactionsToCsv } from '@/utils/csv'
import type { TransactionFilters as TransactionFiltersType } from '@/types'

const route = useRoute()
const router = useRouter()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()

let searchDebounce: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  transactionsStore.fetch({
    accountId: String(route.query.accountId ?? ''),
    category: '',
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
})

watch(
  () => route.query.accountId,
  (accountId) => {
    if (accountId !== undefined && accountId !== transactionsStore.filters.accountId) {
      transactionsStore.fetch({ accountId: String(accountId ?? '') })
    }
  }
)

function onFiltersUpdate(next: TransactionFiltersType) {
  const searchChanged = next.search !== transactionsStore.filters.search
  if (next.accountId !== route.query.accountId) {
    router.replace({ query: next.accountId ? { accountId: next.accountId } : {} })
  }
  if (searchChanged) {
    transactionsStore.filters = next
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => transactionsStore.fetch(), 300)
  } else {
    transactionsStore.fetch(next)
  }
}

function resetFilters() {
  if (route.query.accountId) router.replace({ query: {} })
  transactionsStore.fetch({ accountId: '', category: '', search: '', status: '', dateFrom: '', dateTo: '' })
}

const accountNameById = computed(() => {
  const map: Record<string, string> = {}
  for (const account of accountsStore.accounts) map[account.id] = account.nickname
  return map
})

const selectedAccountName = computed(() => {
  if (!transactionsStore.selected) return ''
  return accountNameById.value[transactionsStore.selected.accountId] ?? ''
})

const rangeStart = computed(() => (transactionsStore.items.length === 0 ? 0 : (transactionsStore.page - 1) * transactionsStore.pageSize + 1))
const rangeEnd = computed(() => Math.min(transactionsStore.page * transactionsStore.pageSize, transactionsStore.items.length))

const pageWindow = computed(() => {
  const total = transactionsStore.totalPages
  const current = transactionsStore.page
  const size = Math.min(5, total)
  let start = Math.max(1, current - Math.floor(size / 2))
  let end = start + size - 1
  if (end > total) {
    end = total
    start = Math.max(1, end - size + 1)
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function handleExport() {
  exportTransactionsToCsv(transactionsStore.items)
}
</script>

<template>
  <div class="flex max-w-5xl flex-col gap-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-[32px] font-bold">Transactions</h1>
        <p class="mt-1.5 text-sm text-dim">Review and manage your financial activity</p>
      </div>
    </header>

    <TransactionFilters
      :filters="transactionsStore.filters"
      :accounts="accountsStore.accounts"
      @update:filters="onFiltersUpdate"
      @reset="resetFilters"
    />

    <div class="card overflow-x-auto px-[18px] py-2">
      <p v-if="transactionsStore.status === 'loading'" class="px-1 py-6 text-sm text-dim">Loading transactions…</p>
      <p v-else-if="transactionsStore.status === 'error'" class="px-1 py-6 text-sm text-brick">
        {{ transactionsStore.error }}
      </p>
      <p v-else-if="transactionsStore.items.length === 0" class="px-1 py-6 text-sm text-dim">
        No transactions match these filters. Try clearing the search or picking another account.
      </p>
      <template v-else>
        <div
          class="grid min-w-[720px] grid-cols-[40px_minmax(180px,1.6fr)_100px_130px_120px_100px] gap-4 border-b border-line px-1 pb-2 text-xs font-bold text-ink"
        >
          <span></span>
          <span>Description</span>
          <span>Date</span>
          <span>Account</span>
          <span>Category</span>
          <span class="text-right">Amount</span>
        </div>
        <TransactionRow
          v-for="transaction in transactionsStore.pagedItems"
          :key="transaction.id"
          :transaction="transaction"
          :account-name="accountNameById[transaction.accountId]"
          @select="transactionsStore.selectTransaction"
        />

        <div class="flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-xs text-muted">
          <span>Showing {{ rangeStart }}-{{ rangeEnd }} of {{ transactionsStore.items.length }} transactions</span>
          <div class="flex items-center gap-1">
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-dim hover:bg-paper disabled:opacity-40"
              :disabled="transactionsStore.page <= 1"
              @click="transactionsStore.setPage(transactionsStore.page - 1)"
            >
              <AppIcon name="chevron-left" class="h-4 w-4" />
            </button>
            <button
              v-for="p in pageWindow"
              :key="p"
              class="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium"
              :class="p === transactionsStore.page ? 'bg-primary text-white' : 'text-dim hover:bg-paper'"
              @click="transactionsStore.setPage(p)"
            >
              {{ p }}
            </button>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-dim hover:bg-paper disabled:opacity-40"
              :disabled="transactionsStore.page >= transactionsStore.totalPages"
              @click="transactionsStore.setPage(transactionsStore.page + 1)"
            >
              <AppIcon name="chevron-right" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <TransactionDetail
      :open="Boolean(transactionsStore.selected || transactionsStore.selectedStatus === 'loading')"
      :transaction="transactionsStore.selected"
      :account-name="selectedAccountName"
      :status="transactionsStore.selectedStatus"
      @close="transactionsStore.clearSelected"
    />
  </div>
</template>
