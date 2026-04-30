const WHATSAPP_SERVICE_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL || 'http://localhost:4001'

export const devicesApi = {
  getAll: () => apiCall('whatsapp-handler/devices'),
  
  connect: async (name?: string) => {
    // First create device in database
    const device = await apiCall('whatsapp-handler/connect', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
    
    // Then connect to WhatsApp service
    await fetch(`${WHATSAPP_SERVICE_URL}/api/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: device.id })
    })
    
    return device
  },
  
  disconnect: (deviceId: string) => apiCall('whatsapp-handler/disconnect', {
    method: 'POST',
    body: JSON.stringify({ deviceId })
  }),
}
