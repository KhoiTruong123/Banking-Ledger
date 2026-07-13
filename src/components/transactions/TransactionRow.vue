<script setup>
import { formatCurrency, formatDate } from '@/utils/format'
import { categoryIcon } from '@/utils/categoryIcons'
import { transactionStatusClasses } from '@/utils/statusStyles'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  transaction: { type: Object, required: true },
  accountName: { type: String, default: '' }
})

defineEmits(['select'])

const icon = categoryIcon(props.transaction.category)
</script>

<template>
  <button
    class="grid w-full min-w-[720px] grid-cols-[40px_minmax(180px,1.6fr)_100px_130px_120px_100px] items-center gap-4 border-b border-line px-1 py-3.5 text-left last:border-b-0 hover:bg-paper"
    @click="$emit('select', transaction.id)"
  >
    <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-wash text-primary">
      <AppIcon :name="icon" class="h-4 w-4" />
    </span>

    <span class="flex min-w-0 flex-col gap-0.5">
      <span class="flex items-center gap-2">
        <span class="truncate text-sm font-bold text-ink">{{ transaction.description }}</span>
        <span class="status-pill" :class="transactionStatusClasses(transaction.status)">{{ transaction.status }}</span>
      </span>
      <span class="truncate text-xs text-muted">{{ transaction.merchant }}</span>
    </span>

    <span class="text-xs text-dim">{{ formatDate(transaction.date) }}</span>
    <span class="truncate text-xs text-dim">{{ accountName }}</span>
    <span>
      <span class="status-pill bg-primary-wash text-primary">{{ transaction.category }}</span>
    </span>

    <span
      class="ledger-num text-right text-sm font-medium"
      :class="transaction.amount >= 0 ? 'amount-credit' : 'amount-debit'"
    >
      {{ transaction.amount >= 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
    </span>
  </button>
</template>
