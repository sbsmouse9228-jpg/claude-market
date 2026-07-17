'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getClientLocale, getDict } from '@/lib/i18n'

function PaymentFailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = getDict(getClientLocale())
  const message = searchParams.get('message') ?? t.pay_fail_default

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <span className="text-5xl mb-4">😢</span>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{t.pay_fail}</h1>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-950 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        {t.back}
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
