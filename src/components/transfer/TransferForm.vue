<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import { useTransferStore } from '@/stores/transfer'
import { formatCurrency, maskAccountNumber } from '@/utils/format'
import AppIcon from '@/components/common/AppIcon.vue'

const accountsStore = useAccountsStore()
const transferStore = useTransferStore()

const form = reactive({
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  note: ''
})

const fieldErrors = reactive({ fromAccountId: '', toAccountId: '', amount: '' })

const amountDisplay = ref('')

// Keeps the visible field grouped with thousands separators (e.g. 222,222.50)
// while `form.amount` stays a plain numeric string for validation/submit.
function formatAmountInput(raw) {
  let cleaned = raw.replace(/[^\d.]/g, '')
  const firstDot = cleaned.indexOf('.')
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
  }
  const [intPart, decPart] = cleaned.split('.')
  const groupedInt = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart !== undefined ? `${groupedInt}.${decPart}` : groupedInt
}

function onAmountInput(event) {
  const formatted = formatAmountInput(event.target.value)
  amountDisplay.value = formatted
  form.amount = formatted.replace(/,/g, '')
}

const fromAccount = computed(() => accountsStore.getAccountById(form.fromAccountId))

const destinationOptions = computed(() =>
  accountsStore.transferableAccounts.filter((a) => a.id !== form.fromAccountId)
)

watch(
  () => form.fromAccountId,
  () => {
    if (form.toAccountId === form.fromAccountId) form.toAccountId = ''
  }
)

function validate() {
  fieldErrors.fromAccountId = form.fromAccountId ? '' : 'Choose a source account.'
  fieldErrors.toAccountId = form.toAccountId ? '' : 'Choose a destination account.'

  const amount = Number(form.amount)
  if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
    fieldErrors.amount = 'Enter an amount greater than zero.'
  } else if (fromAccount.value && amount > fromAccount.value.availableBalance) {
    fieldErrors.amount = `Exceeds the ${formatCurrency(fromAccount.value.availableBalance)} available in ${fromAccount.value.nickname}.`
  } else {
    fieldErrors.amount = ''
  }

  return !fieldErrors.fromAccountId && !fieldErrors.toAccountId && !fieldErrors.amount
}

async function onSubmit() {
  transferStore.reset()
  if (!validate()) return

  try {
    await transferStore.submit({
      fromAccountId: form.fromAccountId,
      toAccountId: form.toAccountId,
      amount: Number(form.amount),
      note: form.note.trim()
    })
    form.amount = ''
    amountDisplay.value = ''
    form.note = ''
  } catch {
    // Error state is handled by the store (toast + transferStore.error).
  }
}
</script>

<template>
  <form class="card flex w-full max-w-[480px] flex-col gap-5 p-6" @submit.prevent="onSubmit">
    <header class="flex items-center justify-between">
      <h3 class="text-base">New Transaction</h3>
      <AppIcon name="swap" class="h-5 w-5 text-primary" />
    </header>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium text-ink" for="from">From Account</label>
      <span class="relative">
        <select id="from" v-model="form.fromAccountId" class="input w-full appearance-none pr-9">
          <option value="" disabled>Select Source</option>
          <option v-for="account in accountsStore.transferableAccounts" :key="account.id" :value="account.id">
            {{ account.nickname }} ({{ maskAccountNumber(account.accountNumber) }}) — {{ formatCurrency(account.availableBalance) }} available
          </option>
        </select>
        <AppIcon name="chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
      <p v-if="fieldErrors.fromAccountId" class="text-xs text-brick">{{ fieldErrors.fromAccountId }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium text-ink" for="to">To Account</label>
      <span class="relative">
        <select id="to" v-model="form.toAccountId" class="input w-full appearance-none pr-9">
          <option value="" disabled>Select Destination</option>
          <option v-for="account in destinationOptions" :key="account.id" :value="account.id">
            {{ account.nickname }} ({{ maskAccountNumber(account.accountNumber) }})
          </option>
        </select>
        <AppIcon name="chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </span>
      <p v-if="fieldErrors.toAccountId" class="text-xs text-brick">{{ fieldErrors.toAccountId }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium text-ink" for="amount">Amount</label>
      <span class="relative">
        <span class="ledger-num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim">$</span>
        <input
          id="amount"
          class="input w-full font-ledger pl-7"
          type="text"
          inputmode="decimal"
          placeholder="0.00"
          :value="amountDisplay"
          @input="onAmountInput"
        />
      </span>
      <p v-if="fieldErrors.amount" class="text-xs text-brick">{{ fieldErrors.amount }}</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-xs font-medium text-ink" for="note">
        Note <span class="font-normal normal-case text-muted">(optional)</span>
      </label>
      <textarea
        id="note"
        v-model="form.note"
        class="input resize-none"
        rows="2"
        maxlength="80"
        placeholder="What's this for?"
      ></textarea>
    </div>

    <p v-if="transferStore.error" class="rounded-lg border border-brick bg-brick-wash px-3 py-2.5 text-[13px] text-brick">
      {{ transferStore.error }}
    </p>

    <button class="btn btn-primary w-full" type="submit" :disabled="transferStore.submitting">
      {{ transferStore.submitting ? 'Transferring…' : 'Confirm Transfer' }}
    </button>
  </form>
</template>
