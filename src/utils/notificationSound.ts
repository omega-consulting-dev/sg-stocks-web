// Générateur de son de notification simple
// Ce fichier peut être utilisé pour créer un son synthétique si nécessaire

// Créer un contexte audio global pour éviter les problèmes de suspension
let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export const generateNotificationSound = async () => {
  try {
    const ctx = getAudioContext()

    // Reprendre le contexte audio s'il est suspendu (politique du navigateur)
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    // Premier beep
    const oscillator1 = ctx.createOscillator()
    const gainNode1 = ctx.createGain()

    oscillator1.connect(gainNode1)
    gainNode1.connect(ctx.destination)

    oscillator1.frequency.value = 800
    oscillator1.type = 'sine'

    gainNode1.gain.setValueAtTime(0, ctx.currentTime)
    gainNode1.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01)
    gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator1.start(ctx.currentTime)
    oscillator1.stop(ctx.currentTime + 0.15)

    // Deuxième beep légèrement plus aigu
    const oscillator2 = ctx.createOscillator()
    const gainNode2 = ctx.createGain()

    oscillator2.connect(gainNode2)
    gainNode2.connect(ctx.destination)

    oscillator2.frequency.value = 1000
    oscillator2.type = 'sine'

    gainNode2.gain.setValueAtTime(0, ctx.currentTime + 0.1)
    gainNode2.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.11)
    gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)

    oscillator2.start(ctx.currentTime + 0.1)
    oscillator2.stop(ctx.currentTime + 0.25)
  } catch (error) {
  }
}

// Fonction pour initialiser le contexte audio avec une interaction utilisateur
export const initAudioContext = async () => {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    return true
  } catch (error) {
    return false
  }
}
