export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, paymentMethod } = await req.json()
    
    // For Stripe
    if (paymentMethod === 'stripe') {
      const Stripe = require('stripe')
      const stripe = new Stripe(STRIPE_SECRET_KEY)
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency || 'usd',
        automatic_payment_methods: { enabled: true }
      })
      
      return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    }
    
    // For EasyPaisa/JazzCash (Pakistan)
    if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
      // Mock response for local payments
      return NextResponse.json({
        success: true,
        transactionId: `TXN_${Date.now()}`,
        paymentUrl: `https://sandbox.${paymentMethod}.com/pay/${Date.now()}`
      })
    }
    
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
