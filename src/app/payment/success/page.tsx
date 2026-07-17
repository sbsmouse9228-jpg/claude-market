'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { getClientLocale, getDict } from '@/lib/i18n'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const called = useRef(false)
  const t = getDict(getClientLocale())

  useEffect(() => {
    if (called.current) return
    called.current = true

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setMessage(t.pay_invalid)
      return
    }

    fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? t.pay_approve_fail)
        }
        setStatus('success')
        setTimeout(() => router.push('/my/purchases'), 2000)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router])

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-4 border-gray-950 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">{t.pay_checking}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <span className="text-5xl mb-4">🎉</span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t.pay_done}</h1>
          <p className="text-sm text-gray-500">{t.pay_redirecting}</p>
        </>
      )}
      {status === 'error' && (
        <>
          <span className="text-5xl mb-4">❌</span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t.pay_confirm_fail}</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-950 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {t.back}
          </button>
        </>
      )}
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  )
}
