import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL(`/login?redirect=/product/${productId}`, _req.url))
  }

  // 구매 확인
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('product_id', productId)
    .eq('status', 'paid')
    .maybeSingle()

  if (!order) {
    return NextResponse.json({ error: '구매 내역이 없어요.' }, { status: 403 })
  }

  // 상품 파일 경로 조회
  const { data: product } = await supabase
    .from('products')
    .select('file_path')
    .eq('id', productId)
    .single()

  if (!product?.file_path) {
    return NextResponse.json({ error: '파일을 찾을 수 없어요.' }, { status: 404 })
  }

  // service_role key로 signed URL 발급 (1시간 유효)
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: signedData, error } = await admin.storage
    .from('product-files')
    .createSignedUrl(product.file_path, 3600, { download: true })

  if (error || !signedData?.signedUrl) {
    return NextResponse.json({ error: '다운로드 URL 생성에 실패했어요.' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
