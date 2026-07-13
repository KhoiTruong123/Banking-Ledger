<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { transactionService } from '@/services/transactionService'
import { formatCurrency } from '@/utils/format'
import AccountCard from '@/components/accounts/AccountCard.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const accountsStore = useAccountsStore()
const router = useRouter()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const firstName = computed(() => accountsStore.customer?.name?.split(' ')[0] ?? '')

const pendingCount = ref(0)

onMounted(async () => {
  const pending = await transactionService.getTransactions({ status: 'pending' })
  pendingCount.value = pending.length
})

function goToTransactions(accountId) {
  router.push({ name: 'transactions', query: { accountId } })
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="flex flex-col gap-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-[32px] font-bold">{{ greeting }}{{ firstName ? `, ${firstName}` : '' }}</p>
        </div>
      </div>
      <p class="text-sm">Here's what's happening with your accounts today.</p>
    </section>

    <p v-if="accountsStore.status === 'loading'" class="text-sm text-dim">Loading accounts…</p>
    <p v-else-if="accountsStore.status === 'error'" class="text-sm text-brick">{{ accountsStore.error }}</p>

    <template v-else>
      <div class="grid grid-cols-2 gap-4">
        <AccountCard
          v-for="account in accountsStore.accounts"
          :key="account.id"
          :account="account"
          @view-transactions="goToTransactions"
        />
      </div>

      <div class="grid grid-cols-[2fr_1fr] gap-4 max-md:grid-cols-1">
        <div class="flex flex-col gap-2 rounded-xl bg-primary p-6 text-white">
          <h3 class="text-lg text-white">Secure your future</h3>
          <p class="max-w-sm text-sm text-white/80">
            Open a new High-Yield Savings account and earn up to 4.50% APY. Start growing your wealth today.
          </p>
          <button class="btn mt-2 self-start bg-teal text-ink hover:bg-teal-dark hover:text-white">Apply Now</button>
        </div>

        <div class="card flex flex-col gap-3 p-5">
          <h3 class="text-sm text-dim">Recent Activity</h3>
          <p class="text-sm font-medium text-ink">{{ pendingCount }} pending transaction{{ pendingCount === 1 ? '' : 's' }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
