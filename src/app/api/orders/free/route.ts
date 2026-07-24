import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })

  // 무료 상품인지 서버에서 직접 확인 (클라이언트가 보낸 가격은 신뢰하지 않음)
  const { data: product } = await supabase
    .from('products')
    .select('id, price')
    .eq('id', productId)
    .single()

  if (!product) return NextResponse.json({ error: '상품을 찾을 수 없어요.' }, { status: 404 })
  if (product.price !== 0) return NextResponse.json({ error: '무료 상품이 아니에요.' }, { status: 400 })

  // paid 상태 전환은 service_role로만 수행
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: upserted, error } = await admin.from('orders').upsert(
    { buyer_id: user.id, product_id: productId, amount: 0, status: 'paid', paid_at: new Date().toISOString() },
    { onConflict: 'buyer_id,product_id', ignoreDuplicates: true }
  ).select('id')

  if (error) return NextResponse.json({ error: '주문 처리에 실패했어요.' }, { status: 500 })

  // 신규 주문일 때만 다운로드 카운트 증가 (이미 보유 중이면 upsert가 아무 것도 반환하지 않음)
  if (upserted && upserted.length > 0) {
    await admin.rpc('increment_download_count', { product_id: productId })
  }

  return NextResponse.json({ success: true })
}
