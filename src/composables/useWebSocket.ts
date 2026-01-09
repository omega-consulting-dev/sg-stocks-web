import { ref } from 'vue'

// Global singleton variables to ensure only one WebSocket instance
let globalSocket: WebSocket | null = null
let globalIsConnecting = false
let globalReconnectAttempts = 0
let globalMessageHandler: ((data: any) => void) | null = null
let globalPingInterval: any = null

// Configuration
const maxReconnectAttempts = 5
const reconnectDelay = 3000
const pingInterval = 25000 // 25 seconds - keep connection alive

// Reactive states
const globalIsConnected = ref(false)
const globalLastError = ref<string | null>(null)

export function useWebSocket() {
  const connect = (token: string) => {
    // If already connected or connecting, don't create a new connection
    if (globalSocket && globalIsConnected.value) {
      return
    }

    if (globalIsConnecting) {
      return
    }

    globalIsConnecting = true

    // Extract tenant from window location
    // For multi-tenant setup, use main domain without tenant subdomain
    let hostname = window.location.hostname

    // Remove tenant subdomain for WebSocket connection
    // Example: dov.localhost -> localhost
    if (hostname.includes('.localhost')) {
      hostname = 'localhost'
    } else if (hostname.includes('.')) {
      // For production domains, keep only the main domain
      const parts = hostname.split('.')
      if (parts.length > 2) {
        hostname = parts.slice(-2).join('.')
      }
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${hostname}:8000/ws/notifications/?token=${token}`

    console.log('[WebSocket] Connecting to:', wsUrl)

    try {
      globalSocket = new WebSocket(wsUrl)

      globalSocket.onopen = () => {
        globalIsConnected.value = true
        globalIsConnecting = false
        globalReconnectAttempts = 0
        globalLastError.value = null

        // Send initial ping
        if (globalSocket) {
          globalSocket.send(JSON.stringify({ type: 'ping' }))
        }

        // Start keep-alive ping (25s interval)
        if (globalPingInterval) {
          clearInterval(globalPingInterval)
        }
        globalPingInterval = setInterval(() => {
          if (globalSocket && globalIsConnected.value) {
            globalSocket.send(JSON.stringify({ type: 'ping' }))
          }
        }, pingInterval)
      }

      globalSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Ignore pong responses
          if (data.type === 'pong') {
            return
          }

          // Pass message to handler
          if (globalMessageHandler) {
            globalMessageHandler(data)
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
        }
      }

      globalSocket.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        globalLastError.value = 'Connection error'
      }

      globalSocket.onclose = (event) => {
        globalIsConnected.value = false
        globalIsConnecting = false

        // Stop ping interval
        if (globalPingInterval) {
          clearInterval(globalPingInterval)
          globalPingInterval = null
        }

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && globalReconnectAttempts < maxReconnectAttempts) {
          globalReconnectAttempts++
          setTimeout(() => {
            connect(token)
          }, reconnectDelay)
        } else if (globalReconnectAttempts >= maxReconnectAttempts) {
          globalLastError.value = 'Connection lost'
        }
      }
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      globalIsConnecting = false
      globalLastError.value = 'Failed to connect'
    }
  }

  const disconnect = () => {
    if (globalPingInterval) {
      clearInterval(globalPingInterval)
      globalPingInterval = null
    }
    if (globalSocket) {
      globalSocket.close(1000, 'User disconnected')
      globalSocket = null
    }
    globalIsConnected.value = false
    globalIsConnecting = false
  }

  const setMessageHandler = (handler: (data: any) => void) => {
    globalMessageHandler = handler
  }

  return {
    connect,
    disconnect,
    setMessageHandler,
    isConnected: globalIsConnected,
    lastError: globalLastError
  }
}
