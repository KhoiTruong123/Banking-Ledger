<script setup>
import { formatCurrency, formatDateTime } from '@/utils/format'

defineProps({
  result: { type: Object, required: true }
})
</script>

<template>
  <aside class="card flex w-full max-w-[480px] flex-col gap-3 rounded-l-none border-l-[3px] border-l-teal p-6">
    <h3 class="text-base">Transfer complete</h3>
    <p class="ledger-num text-[30px] font-medium text-success">
      {{ formatCurrency(result.creditTransaction.amount) }}
    </p>

    <dl class="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-line pt-3">
      <dt class="text-[13px] text-dim">From</dt>
      <dd class="m-0 text-right text-[13px] font-medium">{{ result.fromAccount.nickname }}</dd>

      <dt class="text-[13px] text-dim">To</dt>
      <dd class="m-0 text-right text-[13px] font-medium">{{ result.toAccount.nickname }}</dd>

      <dt class="text-[13px] text-dim">When</dt>
      <dd class="m-0 text-right text-[13px] font-medium">{{ formatDateTime(result.debitTransaction.date) }}</dd>

      <dt class="text-[13px] text-dim">New balance ({{ result.fromAccount.nickname }})</dt>
      <dd class="ledger-num m-0 text-right text-[13px] font-medium">
        {{ formatCurrency(result.fromAccount.availableBalance) }}
      </dd>

      <dt class="text-[13px] text-dim">New balance ({{ result.toAccount.nickname }})</dt>
      <dd class="ledger-num m-0 text-right text-[13px] font-medium">
        {{ formatCurrency(result.toAccount.availableBalance) }}
      </dd>
    </dl>

    <p class="text-xs text-muted">Two linked ledger entries were recorded — a debit and a matching credit.</p>
  </aside>
</template>
