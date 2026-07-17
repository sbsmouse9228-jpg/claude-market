'use client'

import { LOCALE_COOKIE, type Locale } from '@/lib/i18n'

// 한/영 전환 토글 — 쿠키 저장 후 전체 새로고침 (라우터 캐시 무효화 보장)
export default function LanguageToggle({ locale }: { locale: Locale }) {
  function setLocale(next: Locale) {
    if (next === locale) return
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return (
    <div className="flex items-center text-xs font-semibold tracking-wider border border-gray-300">
      <button
        onClick={() => setLocale('ko')}
        aria-pressed={locale === 'ko'}
        className={`px-2.5 py-1.5 transition-colors ${
          locale === 'ko' ? 'bg-gray-950 text-white' : 'text-gray-400 hover:text-gray-950'
        }`}
      >
        KO
      </button>
      <button
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`px-2.5 py-1.5 transition-colors ${
          locale === 'en' ? 'bg-gray-950 text-white' : 'text-gray-400 hover:text-gray-950'
        }`}
      >
        EN
      </button>
    </div>
  )
}
