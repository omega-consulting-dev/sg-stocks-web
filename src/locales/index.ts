import { createI18n } from 'vue-i18n'
import fr from './fr'
import en from './en'

// Fonction pour obtenir la langue depuis le cookie Django
function getLanguageFromCookie(): string {
  const match = document.cookie.match(/django_language=([^;]+)/)
  return match ? match[1] : 'fr'
}

const i18n = createI18n({
  legacy: false,
  locale: getLanguageFromCookie(),
  fallbackLocale: 'fr',
  messages: {
    fr,
    en
  },
  globalInjection: true
})

export default i18n
