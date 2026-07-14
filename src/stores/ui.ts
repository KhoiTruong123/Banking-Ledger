import { defineStore } from 'pinia'

const THEME_KEY = 'theme'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface UiState {
  toasts: Toast[]
  darkMode: boolean
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    toasts: [],
    darkMode: document.documentElement.classList.contains('dark')
  }),
  actions: {
    pushToast(type: ToastType, message: string) {
      const id = `${Date.now()}-${Math.random()}`
      this.toasts.push({ id, type, message })
      setTimeout(() => this.dismiss(id), 4500)
    },
    dismiss(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode)
    },
    setDarkMode(enabled: boolean) {
      this.darkMode = enabled
      document.documentElement.classList.toggle('dark', enabled)
      localStorage.setItem(THEME_KEY, enabled ? 'dark' : 'light')
    }
  }
})
