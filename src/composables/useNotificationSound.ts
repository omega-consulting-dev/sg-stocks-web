import { ref } from 'vue'
import { generateNotificationSound, initAudioContext } from '@/utils/notificationSound'

interface NotificationSoundOptions {
  enabled?: boolean
  volume?: number
}

export const useNotificationSound = (options: NotificationSoundOptions = {}) => {
  const { enabled = true, volume = 0.5 } = options
  const isEnabled = ref(enabled)
  const currentVolume = ref(volume)

  // Vérifier si l'utilisateur a autorisé le son
  const checkPermission = async () => {
    try {
      // Demander la permission pour les notifications
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      return true
    } catch (error) {
      return false
    }
  }

  // Jouer le son de notification
  const playSound = async () => {
    if (!isEnabled.value) return

    try {
      await generateNotificationSound()
    } catch (error) {
    }
  }

  // Jouer le son avec vérification de permission
  const play = async () => {
    const hasPermission = await checkPermission()
    if (hasPermission) {
      await playSound()
    }
  }

  // Activer/désactiver le son
  const toggle = () => {
    isEnabled.value = !isEnabled.value
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('notificationSoundEnabled', isEnabled.value.toString())
  }

  // Charger la préférence depuis localStorage
  const loadPreference = () => {
    const saved = localStorage.getItem('notificationSoundEnabled')
    if (saved !== null) {
      isEnabled.value = saved === 'true'
    }
  }

  // Charger la préférence au démarrage
  loadPreference()

  // Initialiser le contexte audio
  const init = async () => {
    await initAudioContext()
  }

  return {
    isEnabled,
    currentVolume,
    play,
    toggle,
    checkPermission,
    init
  }
}
