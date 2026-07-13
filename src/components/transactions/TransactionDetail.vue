<script setup>
import { formatCurrency, formatDateTime } from '@/utils/format'
import { transactionStatusClasses } from '@/utils/statusStyles'
import AppIcon from '@/components/common/AppIcon.vue'

defineProps({
  open: { type: Boolean, default: false },
  transaction: { type: Object, default: null },
  accountName: { type: String, default: '' },
  status: { type: String, default: 'idle' }
})

defineEmits(['close'])
</script>

<template>
  <Transition name="detail-overlay">
    <div v-if="open" class="fixed inset-0 z-40 bg-ink/20" @click="$emit('close')"></div>
  </Transition>

  <Transition name="detail-panel">
    <aside
      v-if="open"
      class="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col gap-5 overflow-y-auto bg-surface p-6 shadow-2xl"
    >
      <header class="flex items-center justify-between">
        <h3 class="text-base">Transaction Details</h3>
        <button
          class="border-none bg-transparent text-muted hover:text-ink"
          aria-label="Close"
          @click="$emit('close')"
        >
          <AppIcon name="x-mark" class="h-5 w-5" />
        </button>
      </header>

      <p v-if="status === 'loading'" class="text-sm text-dim">Loading…</p>

      <template v-else-if="transaction">
        <div class="flex flex-col items-center gap-1 text-center">
          <span class="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-primary-wash text-primary">
            <AppIcon name="landmark" class="h-6 w-6" />
          </span>
          <p class="text-base font-semibold text-ink">{{ transaction.description }}</p>
          <p class="text-sm text-muted">{{ transaction.merchant }}</p>
          <span class="status-pill mt-1" :class="transactionStatusClasses(transaction.status)">{{ transaction.status }}</span>
          <p
            class="ledger-num mt-1 text-3xl font-medium"
            :class="transaction.amount >= 0 ? 'amount-credit' : 'amount-debit'"
          >
            {{ transaction.amount >= 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
          </p>
        </div>

        <dl class="m-0 flex flex-col gap-2.5 border-t border-line pt-4 text-sm">
          <div class="flex items-center justify-between">
            <dt class="text-dim">Type</dt>
            <dd class="m-0 font-medium text-ink">{{ transaction.amount >= 0 ? 'Credit' : 'Debit' }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-dim">Category</dt>
            <dd class="m-0 font-medium text-ink">{{ transaction.category }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-dim">Merchant</dt>
            <dd class="m-0 font-medium text-ink">{{ transaction.merchant }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-dim">Account</dt>
            <dd class="m-0 font-medium text-ink">{{ accountName }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-dim">Date &amp; Time</dt>
            <dd class="m-0 font-medium text-ink">{{ formatDateTime(transaction.date) }}</dd>
          </div>
          <div v-if="transaction.status === 'posted'" class="flex items-center justify-between">
            <dt class="text-dim">Balance After</dt>
            <dd class="ledger-num m-0 font-medium text-ink">{{ formatCurrency(transaction.balanceAfter) }}</dd>
          </div>
          <div class="flex items-center justify-between">
            <dt class="text-dim">Transaction ID</dt>
            <dd class="ledger-num m-0 font-medium text-ink">{{ transaction.id }}</dd>
          </div>
          <p v-if="transaction.transferGroupId" class="m-0 text-xs text-muted">
            This entry has a matching debit/credit on the other account.
          </p>
        </dl>
      </template>
    </aside>
  </Transition>
</template>

<style scoped>
.detail-overlay-enter-active,
.detail-overlay-leave-active {
  @apply transition-opacity duration-200 ease-in-out;
}

.detail-overlay-enter-from,
.detail-overlay-leave-to {
  @apply opacity-0;
}

.detail-panel-enter-active,
.detail-panel-leave-active {
  @apply transition-transform duration-300 ease-in-out;
}

.detail-panel-enter-from,
.detail-panel-leave-to {
  @apply translate-x-full;
}
</style>
