import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paymentKey, orderId, amount } = await req.json()
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  // 주문 검증
  const { data: order } = await supabase
    .from('orders')
    .select('id, product_id, amount, status')
    .eq('toss_order_id', orderId)
    .eq('buyer_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: '주문을 찾을 수 없어요.' }, { status: 404 })
  if (order.status === 'paid') return NextResponse.json({ success: true })
  if (order.amount !== amount) return NextResponse.json({ error: '결제 금액이 일치하지 않아요.' }, { status: 400 })

  // 토스페이먼츠 서버 승인
  const secretKey = process.env.TOSS_SECRET_KEY!
  const encodedKey = Buffer.from(`${secretKey}:`).toString('base64')

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  if (!tossRes.ok) {
    const tossError = await tossRes.json()
    return NextResponse.json(
      { error: tossError.message ?? '결제 승인에 실패했어요.' },
      { status: 400 }
    )
  }

  // service_role key로 orders + download_count 업데이트
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await Promise.all([
    admin.from('orders').update({
      status: 'paid',
      toss_payment_key: paymentKey,
      paid_at: new Date().toISOString(),
    }).eq('id', order.id),

    admin.rpc('increment_download_count', { product_id: order.product_id }),
  ])

  return NextResponse.json({ success: true })
}
