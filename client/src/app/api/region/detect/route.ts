import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const headersList = headers();
  const region = headersList.get('x-region') || 'PK';
  const currency = headersList.get('x-currency') || 'PKR';
  const locale = headersList.get('x-locale') || 'ur';
  
  return NextResponse.json({
    regionCode: region,
    currency: currency,
    language: locale,
    timestamp: new Date().toISOString(),
  });
}