'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDict, formatPriceLocale, type Locale } from '@/lib/i18n'

interface Props {
  productId: string
  productTitle: string
  price: number
  userId: string | null
  hasPurchased: boolean
  locale?: Locale
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
  productId, productTitle, price, userId, hasPurchased, locale = 'ko',
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const t = getDict(locale)

  if (hasPurchased) {
    return (
      <a
        href={`/api/download/${productId}`}
        className="flex items-center justify-center w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
      >
        {t.btn_download}
      </a>
    )
  }

  if (!userId) {
    return (
      <button
        onClick={() => router.push(`/login?redirect=/product/${productId}`)}
        className="w-full py-3 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-xl hover:bg-[#F6DC00] transition-colors"
      >
        {t.btn_login_to_buy}
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

      // 결제 중단으로 남은 pending 주문은 새 주문번호로 재사용 (RLS가 paid 주문 수정은 차단)
      const { error } = await supabase.from('orders').upsert(
        {
          buyer_id: userId,
          product_id: productId,
          amount: price,
          status: 'pending',
          toss_order_id: tossOrderId,
        },
        { onConflict: 'buyer_id,product_id' }
      )

      if (error) {
        if (error.code === '42501' || error.code === '23505') {
          alert(t.alert_already_purchased); router.refresh(); return
        }
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
      alert(t.alert_pay_error)
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
        {loading ? t.btn_processing : t.btn_free_download}
      </button>
    )
  }

  return (
    <button
      disabled={loading}
      onClick={handlePurchase}
      className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
    >
      {loading ? t.btn_opening : t.btn_buy(formatPriceLocale(price, locale))}
    </button>
  )
}
