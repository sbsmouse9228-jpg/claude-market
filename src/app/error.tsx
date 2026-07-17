'use client'

import { useEffect } from 'react'
import { getClientLocale, getDict } from '@/lib/i18n'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = getDict(getClientLocale())

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-gray-900 mb-2">{t.error_title}</h1>
      <p className="text-gray-500 mb-6 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-gray-950 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        {t.error_retry}
      </button>
    </main>
  )
}
