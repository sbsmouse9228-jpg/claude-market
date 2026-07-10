export type ProductCategory = 'prompt' | 'starter' | 'notion' | 'design'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  prompt: 'AI 프롬프트',
  starter: '스타터킷',
  notion: 'Notion 템플릿',
  design: '디자인 에셋',
}

export interface User {
  id: string
  kakao_id: string | null
  nickname: string
  profile_image: string | null
  created_at: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: ProductCategory
  thumbnail_url: string | null
  file_path: string
  preview_urls: string[]
  tags: string[]
  is_published: boolean
  download_count: number
  created_at: string
}

export interface Order {
  id: string
  buyer_id: string
  product_id: string
  amount: number
  status: OrderStatus
  toss_order_id: string | null
  toss_payment_key: string | null
  paid_at: string | null
  created_at: string
  product?: Product
}
