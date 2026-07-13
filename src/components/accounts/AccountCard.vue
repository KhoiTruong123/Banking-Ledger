<script setup>
import { computed } from 'vue'
import { formatCurrency, maskAccountNumber } from '@/utils/format'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  account: { type: Object, required: true }
})

const emit = defineEmits(['view-transactions'])

const typeLabel = computed(() => {
  return props.account.type === 'checking' ? 'Checking' : 'Savings'
})

const typeIcon = computed(() => (props.account.type === 'checking' ? 'wallet' : 'piggy-bank'))

const isTinted = computed(() => props.account.status === 'active')

const hasHold = computed(() => props.account.pendingHoldsTotal > 0)
const isClosed = computed(() => props.account.status === 'closed')
</script>

<template>
  <article class="card flex flex-col gap-4 p-5">
    <header class="flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-[24px]">{{ account.nickname }}</h3>
          <span class="status-pill" :class="account.status">{{ account.status }}</span>
        </div>
        <p class="mt-1 text-[13px]">{{ typeLabel }} · {{ maskAccountNumber(account.accountNumber) }}</p>
      </div>
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        :class="isTinted ? 'bg-primary-wash text-primary' : 'bg-steel-wash text-steel'"
      >
        <AppIcon :name="typeIcon" class="h-[18px] w-[18px]" />
      </span>
    </header>

    <div class="flex flex-col gap-1">
      <span class="text-xs font-bold">{{ isClosed ? 'Final balance' : 'Available balance' }}</span>
      <span class="ledger-num text-[28px] font-medium text-ink">{{ formatCurrency(account.availableBalance) }}</span>

      <template v-if="!isClosed">
        <div class="mt-1 flex items-center justify-between border-t border-line pt-2 text-[13px]">
          <span>Ledger balance</span>
          <span class="ledger-num text-ink font-bold">{{ formatCurrency(account.ledgerBalance) }}</span>
        </div>
        <div class="flex items-center justify-between text-[13px]">
          <span>Hold amount</span>
          <span class="ledger-num font-bold" :class="hasHold ? 'text-brick' : 'text-ink'">
            {{ hasHold ? `-${formatCurrency(account.pendingHoldsTotal)}` : formatCurrency(0) }}
          </span>
        </div>
      </template>
      <p v-else class="mt-1 flex items-center gap-1.5 border-t border-line pt-2 text-[13px] text-brick">
        Account closed
      </p>
    </div>

    <button class="btn btn-primary self-stretch text-[13px] font-bold" @click="emit('view-transactions', account.id)">
      {{ isClosed ? 'View history' : 'View transactions' }}
    </button>
  </article>
</template>
