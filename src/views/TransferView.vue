<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useTransferStore } from '@/stores/transfer'
import TransferForm from '@/components/transfer/TransferForm.vue'
import TransferReceipt from '@/components/transfer/TransferReceipt.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const transferStore = useTransferStore()

onUnmounted(() => {
  transferStore.reset()
})
</script>

<template>
  <div class="flex max-w-5xl flex-col gap-6">
    <header>
      <h1 class="text-[32px] font-bold">Transfer Money</h1>
      <p class="mt-1.5 text-sm text-dim">Move funds instantly between your accounts or to a saved contact.</p>
    </header>

    <div class="flex flex-col lg:flex-row lg:items-start justify-center items-center gap-6 ">
      <TransferForm />

      <TransferReceipt v-if="transferStore.lastResult" :result="transferStore.lastResult" />
      <div v-else class="flex w-full max-w-[480px] flex-col gap-4">
        <div class="flex flex-col gap-3 rounded-xl bg-primary p-6 text-white">
          <AppIcon name="shield-check" class="h-6 w-6" />
          <h3 class="text-base text-white">Secure Transfer</h3>
          <p class="text-sm text-white/80">
            All transfers within Ledger are encrypted and processed immediately. External transfers may take 1-3
            business days.
          </p>
          <ul class="m-0 flex list-none flex-col gap-1.5 p-0 text-sm text-white">
            <li class="flex items-center gap-2">
              <AppIcon name="check-circle" class="h-4 w-4 shrink-0" />
              No fees for internal accounts
            </li>
            <li class="flex items-center gap-2">
              <AppIcon name="check-circle" class="h-4 w-4 shrink-0" />
              Real-time balance updates
            </li>
            <li class="flex items-center gap-2">
              <AppIcon name="check-circle" class="h-4 w-4 shrink-0" />
              Fraud protection active
            </li>
          </ul>
        </div>

        <div class="card flex flex-col gap-1 p-5">
          <span class="text-xs font-semibold uppercase tracking-wide text-muted">Cash Flow Visualization</span>
          <h3 class="text-base text-primary">Trends Overview</h3>
        </div>
      </div>
    </div>
  </div>
</template>
