import Link from 'next/link'
import { getLocale } from '@/lib/i18n-server'
import { getDict } from '@/lib/i18n'

export default async function NotFound() {
  const locale = await getLocale()
  const t = getDict(locale)

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">{t.notfound_message}</p>
      <Link href="/" className="text-gray-950 font-medium underline underline-offset-4 hover:bg-amber-400 transition-colors">
        {t.notfound_home}
      </Link>
    </main>
  )
}
