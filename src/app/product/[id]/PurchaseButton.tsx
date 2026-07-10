'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
  productTitle: string
  price: number
  userId: string | null
  hasPurchased: boolean
}

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: {
        amount: number
        orderId: string
        orderName: string
        successUrl: string
        failUrl: string
      }) => Promise<void>
    }
  }
}

function loadTossScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('toss-payments-sdk')) { resolve(); return }
    const script = document.createElement('script')
    script.id = 'toss-payments-sdk'
    script.src = 'https://js.tosspayments.com/v1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('토스 SDK 로드 실패'))
    document.head.appendChild(script)
  })
}

export default function PurchaseButton({
  productId, productTitle, price, userId, hasPurchased,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (hasPurchased) {
    return (
      <a
        href={`/api/download/${productId}`}
        className="flex items-center justify-center w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
      >
        다운로드
      </a>
    )
  }

  if (!userId) {
    return (
      <button
        onClick={() => router.push(`/login?redirect=/product/${productId}`)}
        className="w-full py-3 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-xl hover:bg-[#F6DC00] transition-colors"
      >
        카카오 로그인 후 구매
      </button>
    )
  }

  async function handleFreeDownload() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').upsert(
      { buyer_id: userId, product_id: productId, amount: 0, status: 'paid', paid_at: new Date().toISOString() },
      { onConflict: 'buyer_id,product_id', ignoreDuplicates: true }
    )
    window.location.href = `/api/download/${productId}`
  }

  async function handlePurchase() {
    setLoading(true)
    try {
      const supabase = createClient()
      const tossOrderId = crypto.randomUUID()

      const { error } = await supabase.from('orders').insert({
        buyer_id: userId,
        product_id: productId,
        amount: price,
        status: 'pending',
        toss_order_id: tossOrderId,
      })

      if (error) {
        if (error.code === '23505') { alert('이미 구매한 상품이에요.'); router.refresh(); return }
        throw new Error('주문 생성 실패')
      }

      await loadTossScript()
      const tossPayments = window.TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)
      await tossPayments.requestPayment('카드', {
        amount: price,
        orderId: tossOrderId,
        orderName: productTitle,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e?.code === 'USER_CANCEL') { setLoading(false); return }
      alert('결제 중 오류가 발생했어요. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  if (price === 0) {
    return (
      <button
        disabled={loading}
        onClick={handleFreeDownload}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {loading ? '처리 중...' : '무료 다운로드'}
      </button>
    )
  }

  return (
    <button
      disabled={loading}
      onClick={handlePurchase}
      className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
    >
      {loading ? '결제창 여는 중...' : `${price.toLocaleString()}원 구매하기`}
    </button>
  )
}
