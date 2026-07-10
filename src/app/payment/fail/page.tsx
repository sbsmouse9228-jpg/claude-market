'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PaymentFailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message') ?? '결제가 취소되거나 실패했어요.'

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <span className="text-5xl mb-4">😢</span>
      <h1 className="text-xl font-bold text-gray-900 mb-2">결제에 실패했어요</h1>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        돌아가기
      </button>
    </main>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <PaymentFailContent />
    </Suspense>
  )
}
