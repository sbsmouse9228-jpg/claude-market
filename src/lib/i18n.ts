// 한/영 다국어 사전 — 쿠키 기반 로케일 (서버/클라이언트 공용)
import type { ProductCategory } from '@/types'

export type Locale = 'ko' | 'en'

export const LOCALE_COOKIE = 'locale'
export const DEFAULT_LOCALE: Locale = 'ko'

export function isLocale(value: string | undefined): value is Locale {
  return value === 'ko' || value === 'en'
}

// 클라이언트 컴포넌트에서 쿠키 읽기
export function getClientLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const match = document.cookie.match(/(?:^|;\s*)locale=(ko|en)/)
  return isLocale(match?.[1]) ? match[1] : DEFAULT_LOCALE
}

// 로케일별 가격 표기 (ko: 1,000원 / en: ₩1,000)
export function formatPriceLocale(amount: number, locale: Locale) {
  return locale === 'ko'
    ? amount.toLocaleString('ko-KR') + '원'
    : '₩' + amount.toLocaleString('en-US')
}

export const CATEGORY_LABELS: Record<Locale, Record<ProductCategory, string>> = {
  ko: {
    prompt: 'AI 프롬프트',
    starter: '스타터킷',
    notion: 'Notion 템플릿',
    design: '디자인 에셋',
  },
  en: {
    prompt: 'AI Prompts',
    starter: 'Starter Kits',
    notion: 'Notion Templates',
    design: 'Design Assets',
  },
}

export const dict = {
  ko: {
    // 헤더
    nav_purchases: '구매 목록',
    nav_admin: '관리자',
    nav_logout: '로그아웃',
    nav_login: '로그인',
    // 홈
    home_title: '디지털 상품 마켓',
    home_subtitle_items: ['AI 프롬프트', '스타터킷', 'Notion 템플릿', '디자인 에셋'],
    home_all: '전체',
    home_empty_category: '해당 카테고리에 상품이 없어요',
    home_empty: '아직 등록된 상품이 없어요',
    // 상품 공통
    free: '무료',
    downloads_suffix: '회 다운로드',
    product_description: '상품 설명',
    preview_alt: '미리보기',
    // 구매 버튼
    btn_download: '다운로드',
    btn_login_to_buy: '카카오 로그인 후 구매',
    btn_free_download: '무료 다운로드',
    btn_processing: '처리 중...',
    btn_opening: '결제창 여는 중...',
    btn_buy: (price: string) => `${price} 구매하기`,
    alert_already_purchased: '이미 구매한 상품이에요.',
    alert_pay_error: '결제 중 오류가 발생했어요. 다시 시도해주세요.',
    // 구매 목록
    purchases_title: '내 구매 목록',
    purchases_empty: '아직 구매한 상품이 없어요',
    purchases_browse: '상품 둘러보기',
    purchases_get: '받기',
    // 로그인
    login_subtitle: 'AI 프롬프트 · 스타터킷 · 템플릿 · 에셋',
    login_terms: '로그인 시 서비스 이용약관에 동의하는 것으로 간주합니다',
    login_kakao: '카카오로 시작하기',
    // 결제 결과
    pay_checking: '결제를 확인하는 중이에요...',
    pay_done: '구매가 완료됐어요!',
    pay_redirecting: '구매 목록 페이지로 이동합니다...',
    pay_confirm_fail: '결제 확인에 실패했어요',
    pay_fail: '결제에 실패했어요',
    pay_fail_default: '결제가 취소되거나 실패했어요.',
    pay_invalid: '결제 정보가 올바르지 않아요.',
    pay_approve_fail: '결제 승인 실패',
    back: '돌아가기',
    // 404 / 오류
    notfound_message: '페이지를 찾을 수 없어요',
    notfound_home: '홈으로 돌아가기',
    error_title: '오류가 발생했어요',
    error_retry: '다시 시도',
  },
  en: {
    // Header
    nav_purchases: 'My Purchases',
    nav_admin: 'Admin',
    nav_logout: 'Log out',
    nav_login: 'Log in',
    // Home
    home_title: 'Digital Goods Market',
    home_subtitle_items: ['AI Prompts', 'Starter Kits', 'Notion Templates', 'Design Assets'],
    home_all: 'All',
    home_empty_category: 'No products in this category yet',
    home_empty: 'No products available yet',
    // Product
    free: 'Free',
    downloads_suffix: ' downloads',
    product_description: 'Description',
    preview_alt: 'Preview',
    // Purchase button
    btn_download: 'Download',
    btn_login_to_buy: 'Log in with Kakao to buy',
    btn_free_download: 'Free Download',
    btn_processing: 'Processing...',
    btn_opening: 'Opening checkout...',
    btn_buy: (price: string) => `Buy for ${price}`,
    alert_already_purchased: 'You already own this product.',
    alert_pay_error: 'Something went wrong with the payment. Please try again.',
    // Purchases
    purchases_title: 'My Purchases',
    purchases_empty: "You haven't purchased anything yet",
    purchases_browse: 'Browse products',
    purchases_get: 'Get',
    // Login
    login_subtitle: 'AI Prompts · Starter Kits · Templates · Assets',
    login_terms: 'By logging in, you agree to our Terms of Service',
    login_kakao: 'Continue with Kakao',
    // Payment result
    pay_checking: 'Confirming your payment...',
    pay_done: 'Purchase complete!',
    pay_redirecting: 'Redirecting to your purchases...',
    pay_confirm_fail: 'Payment confirmation failed',
    pay_fail: 'Payment failed',
    pay_fail_default: 'The payment was cancelled or failed.',
    pay_invalid: 'Invalid payment information.',
    pay_approve_fail: 'Payment approval failed',
    back: 'Go back',
    // 404 / Error
    notfound_message: 'Page not found',
    notfound_home: 'Back to home',
    error_title: 'Something went wrong',
    error_retry: 'Try again',
  },
} as const

export type Dict = (typeof dict)[Locale]

export function getDict(locale: Locale): Dict {
  return dict[locale]
}
