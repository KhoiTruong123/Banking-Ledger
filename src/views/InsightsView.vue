<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { transactionService } from '@/services/transactionService'
import { spendingByCategory, incomeVsExpense, topMerchants } from '@/utils/insights'
import { formatCurrency, formatMonthLabel } from '@/utils/format'
import { categoryIcon } from '@/utils/categoryIcons'
import AppIcon from '@/components/common/AppIcon.vue'
import type { Transaction } from '@/types'

type Status = 'loading' | 'ready' | 'error'

const status = ref<Status>('loading')
const transactions = ref<Transaction[]>([])
const range = ref('30')

const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' }
]

const rangeLabel = computed(() => RANGE_OPTIONS.find((o) => o.value === range.value)?.label ?? '')

onMounted(async () => {
  try {
    transactions.value = await transactionService.getTransactions()
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
})

// Everything except the 6-month trend chart respects the "Last N Days" selector.
const rangedTransactions = computed(() => {
  if (range.value === 'all') return transactions.value
  const days = Number(range.value)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return transactions.value.filter((t) => new Date(t.date).getTime() >= cutoff)
})

const categories = computed(() => spendingByCategory(rangedTransactions.value))
const merchants = computed(() => topMerchants(rangedTransactions.value, 5))

// The trend chart always shows the last 6 calendar months regardless of the range selector.
const monthly = computed(() => incomeVsExpense(transactions.value, 6))

const maxCategoryTotal = computed(() => Math.max(...categories.value.map((c) => c.total), 1))
const maxMonthly = computed(() => Math.max(...monthly.value.flatMap((m) => [m.income, m.expense]), 1))
const maxMerchantTotal = computed(() => Math.max(...merchants.value.map((m) => m.total), 1))

const netForRange = computed(() => {
  let net = 0
  for (const t of rangedTransactions.value) {
    if (t.status !== 'posted' || t.category === 'Transfer') continue
    net += t.amount
  }
  return Math.round(net * 100) / 100
})

// Calendar month-over-month comparison, independent of the range selector above.
const monthOverMonthText = computed(() => {
  const m = monthly.value
  if (m.length < 2) return ''
  const latest = m[m.length - 1]
  const prior = m[m.length - 2]
  if (prior.expense === 0) return ''
  const change = ((latest.expense - prior.expense) / prior.expense) * 100
  const rounded = Math.round(Math.abs(change))
  return `You've spent ${rounded}% ${change <= 0 ? 'less' : 'more'} compared to last month.`
})

const CATEGORY_TINTS = ['bg-primary', 'bg-teal', 'bg-ink-soft', 'bg-steel']
</script>

<template>
  <div class="flex max-w-5xl flex-col gap-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-[32px] font-bold">Spending Behaviour</h1>
        <p class="mt-1.5 max-w-[560px] text-sm text-dim">
          Only includes posted transactions, excluding internal transfers
        </p>
      </div>
      <span class="relative shrink-0">
        <select v-model="range" class="input appearance-none py-2 pl-3 pr-9 text-sm font-medium">
          <option v-for="opt in RANGE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <AppIcon name="chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
    </header>

    <p v-if="status === 'loading'" class="text-sm text-dim">Crunching your transactions…</p>
    <p v-else-if="status === 'error'" class="text-sm text-brick">Insights could not be loaded. Refresh to retry.</p>

    <template v-else>
      <section
        class="card flex flex-col gap-1 rounded-l-none border-l-[3px] p-5"
        :class="netForRange >= 0 ? 'border-l-success' : 'border-l-brick'"
      >
        <span class="text-xs uppercase tracking-wider text-muted">Net cash flow · {{ rangeLabel }}</span>
        <span class="flex items-center gap-2">
          <span class="ledger-num text-[30px] font-medium" :class="netForRange >= 0 ? 'text-success' : 'text-brick'">
            {{ netForRange >= 0 ? '+' : '' }}{{ formatCurrency(netForRange) }}
          </span>
          <AppIcon
            :name="netForRange >= 0 ? 'trending-up' : 'trending-down'"
            class="h-5 w-5"
            :class="netForRange >= 0 ? 'text-success' : 'text-brick'"
          />
        </span>
        <span v-if="monthOverMonthText" class="text-[13px] text-dim">{{ monthOverMonthText }}</span>
      </section>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <section class="card flex flex-col gap-4 p-5">
          <h3 class="text-base">Spending by Category</h3>
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            <li v-for="(item, index) in categories" :key="item.category">
              <div class="mb-1 flex justify-between gap-3 text-[13px]">
                <span>{{ item.category }}</span>
                <span class="ledger-num whitespace-nowrap text-xs text-dim">
                  {{ formatCurrency(item.total) }} · {{ item.percent }}%
                </span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-paper">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="CATEGORY_TINTS[index % CATEGORY_TINTS.length]"
                  :style="{ width: `${(item.total / maxCategoryTotal) * 100}%` }"
                ></div>
              </div>
            </li>
          </ul>
        </section>

        <section class="card flex flex-col gap-4 p-5">
          <div class="flex items-center justify-between">
            <h3 class="text-base">Income vs Expenses</h3>
            <div class="flex gap-3 text-xs text-dim">
              <span class="inline-flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-sm bg-success"></i>Inc</span>
              <span class="inline-flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-sm bg-brick"></i>Exp</span>
            </div>
          </div>
          <div class="flex h-40 items-end gap-3">
            <div v-for="month in monthly" :key="month.month" class="flex h-full flex-1 flex-col">
              <div class="flex flex-1 items-end justify-center gap-1">
                <div
                  class="min-h-[2px] w-3.5 rounded-t bg-success"
                  :style="{ height: `${(month.income / maxMonthly) * 100}%` }"
                  :title="`Income ${formatCurrency(month.income)}`"
                ></div>
                <div
                  class="min-h-[2px] w-3.5 rounded-t bg-brick"
                  :style="{ height: `${(month.expense / maxMonthly) * 100}%` }"
                  :title="`Expenses ${formatCurrency(month.expense)}`"
                ></div>
              </div>
              <span class="pt-1.5 text-center text-[11px] text-muted">{{ formatMonthLabel(month.month) }}</span>
            </div>
          </div>
        </section>
      </div>

      <section class="card flex flex-col gap-4 p-5">
        <div class="flex items-center justify-between">
          <h3 class="text-base">Largest Merchants</h3>
          <router-link to="/transactions" class="text-xs font-medium text-primary hover:underline">
            View All History
          </router-link>
        </div>

        <p v-if="merchants.length === 0" class="text-sm text-dim">No spending in this period.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th class="pb-2 font-semibold">Merchant</th>
                <th class="pb-2 font-semibold">Category</th>
                <th class="pb-2 text-right font-semibold">Transactions</th>
                <th class="pb-2 text-right font-semibold">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in merchants" :key="item.merchant" class="border-b border-line last:border-b-0">
                <td class="py-2.5">
                  <span class="flex items-center gap-2.5">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-wash text-primary">
                      <AppIcon :name="categoryIcon(item.category)" class="h-4 w-4" />
                    </span>
                    <span class="font-medium text-ink">{{ item.merchant }}</span>
                  </span>
                </td>
                <td class="py-2.5"><span class="status-pill bg-primary-wash text-primary">{{ item.category }}</span></td>
                <td class="py-2.5 text-right text-dim">{{ item.count }}</td>
                <td class="ledger-num py-2.5 text-right font-medium text-ink">{{ formatCurrency(item.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
