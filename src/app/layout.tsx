import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { getLocale } from '@/lib/i18n-server'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Claude Market — 디지털 상품 마켓',
  description: 'AI 프롬프트, 스타터킷, Notion 템플릿, 디자인 에셋을 구매하세요',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
