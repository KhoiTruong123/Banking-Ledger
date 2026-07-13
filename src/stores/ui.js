import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: []
  }),
  actions: {
    pushToast(type, message) {
      const id = `${Date.now()}-${Math.random()}`
      this.toasts.push({ id, type, message })
      setTimeout(() => this.dismiss(id), 4500)
    },
    dismiss(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }
  }
})
