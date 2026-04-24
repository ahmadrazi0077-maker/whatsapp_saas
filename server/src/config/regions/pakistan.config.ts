export const pakistanConfig = {
  region: {
    code: 'PK',
    name: 'Pakistan',
    timezone: 'Asia/Karachi',
    currency: 'PKR',
    currencySymbol: '₨',
    language: 'ur',
    rtl: false,
    phoneCode: '+92',
  },
  
  compliance: {
    regulations: ['PECA', 'GDPR_OPTIONAL'],
    dataResidency: false,
    requiresConsent: true,
    messageRetentionDays: 365,
    allowedMessageTypes: ['text', 'image', 'document', 'audio', 'video'],
    prohibitedContent: ['political', 'gambling', 'adult'],
  },
  
  pricing: {
    multiplier: 0.3,
    tiers: [
      { name: 'Basic', price: 999, messages: 1000, devices: 1, users: 1 },
      { name: 'Pro', price: 2499, messages: 5000, devices: 3, users: 5 },
      { name: 'Business', price: 4999, messages: 20000, devices: 10, users: 20 },
    ],
  },
  
  payments: {
    gateways: ['easypaisa', 'jazzcash', 'stripe'],
    methods: ['mobile_account', 'bank_transfer', 'credit_card'],
    taxRate: 0, // No VAT in Pakistan currently
  },
  
  features: {
    whatsAppBusinessAPI: true,
    bulkMessaging: true,
    autoReply: true,
    teamCollaboration: true,
    apiAccess: true,
    mediaSupport: true,
    scheduledMessages: true,
  },
  
  marketing: {
    localKeywords: ['WhatsApp Marketing', 'Bulk WhatsApp', 'Auto Reply', 'Business WhatsApp'],
    socialProof: ['Trusted by 500+ Pakistani businesses'],
    testimonials: true,
    caseStudies: true,
  },
  
  support: {
    hours: '9:00 AM - 11:00 PM PKT',
    channels: ['email', 'chat', 'phone'],
    localNumber: '+92-XXX-XXXXXXX',
  },
};