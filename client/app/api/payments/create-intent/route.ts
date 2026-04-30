export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, paymentMethod } = await req.json()
    
    // For now, return mock response
    return NextResponse.json({
      success: true,
      clientSecret: `mock_secret_${Date.now()}`,
      transactionId: `TXN_${Date.now()}`,
      paymentUrl: `https://sandbox.payment.com/pay/${Date.now()}`
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
