import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import PurchaseButton from './PurchaseButton'
import { CATEGORY_LABEL } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Download, Tag } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!product) notFound()

  let profile = null
  let hasPurchased = false

  if (user) {
    const [{ data: p }, { data: order }] = await Promise.all([
      supabase.from('users').select('nickname').eq('id', user.id).single(),
      supabase
        .from('orders')
        .select('id, status')
        .eq('buyer_id', user.id)
        .eq('product_id', id)
        .eq('status', 'paid')
        .maybeSingle(),
    ])
    profile = p
    hasPurchased = !!order
  }

  const isAdmin = user?.id === process.env.ADMIN_USER_ID

  return (
    <div className="min-h-screen flex flex-col">
      <Header userNickname={profile?.nickname} isAdmin={isAdmin} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 이미지 영역 */}
          <div className="flex flex-col gap-3">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
              {product.thumbnail_url ? (
                <Image
                  src={product.thumbnail_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {product.category === 'prompt' ? '🤖' :
                   product.category === 'starter' ? '⚡' :
                   product.category === 'notion' ? '📋' : '🎨'}
                </div>
              )}
            </div>
            {/* 미리보기 이미지 */}
            {product.preview_urls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.preview_urls.map((url: string, i: number) => (
                  <div key={i} className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative bg-gray-100">
                    <Image src={url} alt={`미리보기 ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full">
                {CATEGORY_LABEL[product.category as keyof typeof CATEGORY_LABEL]}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-3 leading-snug">
                {product.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Download size={14} />
                {product.download_count.toLocaleString()}회 다운로드
              </span>
            </div>

            {/* 가격 + 구매 */}
            <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-4">
              <div className="text-3xl font-bold text-indigo-600">
                {product.price === 0 ? '무료' : formatPrice(product.price)}
              </div>
              <PurchaseButton
                productId={product.id}
                productTitle={product.title}
                price={product.price}
                userId={user?.id ?? null}
                hasPurchased={hasPurchased}
              />
            </div>

            {/* 태그 */}
            {product.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-gray-400" />
                {product.tags.map((tag: string) => (
                  <span key={tag} className="text-sm text-gray-500">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">상품 설명</h2>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>
      </main>
    </div>
  )
}
