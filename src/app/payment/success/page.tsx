'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setMessage('결제 정보가 올바르지 않아요.')
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
          throw new Error(data.error ?? '결제 승인 실패')
        }
        setStatus('success')
        setTimeout(() => router.push('/my/purchases'), 2000)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message)
      })
  }, [searchParams, router])

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">결제를 확인하는 중이에요...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <span className="text-5xl mb-4">🎉</span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">구매가 완료됐어요!</h1>
          <p className="text-sm text-gray-500">구매 목록 페이지로 이동합니다...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <span className="text-5xl mb-4">❌</span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">결제 확인에 실패했어요</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
          >
            돌아가기
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
