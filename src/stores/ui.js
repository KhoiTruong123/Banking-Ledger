import { defineStore } from 'pinia'

const THEME_KEY = 'theme'

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    darkMode: document.documentElement.classList.contains('dark')
  }),
  actions: {
    pushToast(type, message) {
      const id = `${Date.now()}-${Math.random()}`
      this.toasts.push({ id, type, message })
      setTimeout(() => this.dismiss(id), 4500)
    },
    dismiss(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode)
    },
    setDarkMode(enabled) {
      this.darkMode = enabled
      document.documentElement.classList.toggle('dark', enabled)
      localStorage.setItem(THEME_KEY, enabled ? 'dark' : 'light')
    }
  }
})
