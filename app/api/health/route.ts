import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'UnlocQ Loan Angel API',
    version: '1.0.0'
  });
}
