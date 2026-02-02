import { ref } from 'vue'

// Global singleton variables to ensure only one WebSocket instance
let globalSocket: WebSocket | null = null
let globalIsConnecting = false
let globalReconnectAttempts = 0
let globalMessageHandler: ((data: any) => void) | null = null
let globalPingInterval: any = null
let globalHasConnectedOnce = false  // Track if connection was ever successful

// Configuration
const maxReconnectAttempts = 3  // Réduit de 5 à 3
const reconnectDelay = 5000  // Augmenté de 3s à 5s
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
    try {
      globalSocket = new WebSocket(wsUrl)

      globalSocket.onopen = () => {
        globalIsConnected.value = true
        globalIsConnecting = false
        globalReconnectAttempts = 0
        globalLastError.value = null
        globalHasConnectedOnce = true  // Mark that we've connected successfully

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
        }
      }

      globalSocket.onerror = () => {
        // Silently handle connection errors
        globalLastError.value = 'Connection error'
        globalIsConnecting = false
      }

      globalSocket.onclose = (event) => {
        globalIsConnected.value = false
        globalIsConnecting = false

        // Stop ping interval
        if (globalPingInterval) {
          clearInterval(globalPingInterval)
          globalPingInterval = null
        }

        // Only attempt to reconnect if we've successfully connected before
        // and it's not a normal closure (code 1000)
        // code 1006 = abnormal closure (server unavailable)
        const shouldReconnect = globalHasConnectedOnce &&
                               event.code !== 1000 &&
                               event.code !== 1006 &&
                               globalReconnectAttempts < maxReconnectAttempts

        if (shouldReconnect) {
          globalReconnectAttempts++
          setTimeout(() => {
            connect(token)
          }, reconnectDelay)
        } else if (globalReconnectAttempts >= maxReconnectAttempts) {
          globalLastError.value = 'Connection lost - server unavailable'
        } else if (!globalHasConnectedOnce && event.code === 1006) {
          // Initial connection failed - server not available
          // Don't spam reconnection attempts
          globalLastError.value = 'WebSocket server not available'
        }
      }
    } catch (error) {
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
