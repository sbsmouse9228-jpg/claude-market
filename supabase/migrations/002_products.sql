-- =============================================
-- claude-market 002: products 테이블
-- =============================================

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text not null,
  price          integer not null check (price >= 0),
  category       text not null check (category in ('prompt', 'starter', 'notion', 'design')),
  thumbnail_url  text,
  file_path      text not null,
  preview_urls   text[] not null default '{}',
  tags           text[] not null default '{}',
  is_published   boolean not null default false,
  download_count integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.products enable row level security;

-- 공개된 상품은 비회원도 조회 가능
create policy "공개 상품 전체 조회"
  on public.products for select
  using (is_published = true);

-- 비공개 상품은 service_role만 조회 가능 (관리자 패널용 — service_role key 사용)
-- INSERT/UPDATE/DELETE: API Route에서 service_role key로 처리 (RLS 우회)
