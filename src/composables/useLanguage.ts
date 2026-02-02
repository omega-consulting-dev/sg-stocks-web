import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Axios from '@/services/axios.service'

export function useLanguage() {
  const { locale, t } = useI18n()

  const currentLanguage = computed(() => locale.value)

  async function changeLanguage(newLocale: string) {
    try {
      // Mettre à jour la langue côté serveur Django
      await Axios.post('/main/set-language/', {
        language: newLocale
      })

      // Mettre à jour la langue locale
      locale.value = newLocale

      // Mettre à jour le cookie
      document.cookie = `django_language=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

      return true
    } catch (error) {
      return false
    }
  }

  return {
    locale,
    currentLanguage,
    changeLanguage,
    t
  }
}
