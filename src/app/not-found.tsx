import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">페이지를 찾을 수 없어요</p>
      <Link href="/" className="text-indigo-600 font-medium hover:underline">
        홈으로 돌아가기
      </Link>
    </main>
  )
}
