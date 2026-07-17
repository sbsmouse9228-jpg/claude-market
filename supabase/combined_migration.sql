-- =============================================
-- claude-market 통합 마이그레이션 (001~005)
-- Supabase SQL Editor에 붙여넣고 Run 실행
-- =============================================

-- ===== 001: users 테이블 =====

create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  kakao_id      text,
  nickname      text not null,
  profile_image text,
  created_at    timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "사용자 프로필 전체 공개 조회"
  on public.users for select using (true);

create policy "본인 프로필 삽입"
  on public.users for insert
  with check (auth.uid() = id);

create policy "본인 프로필 수정"
  on public.users for update
  using (auth.uid() = id);

-- ===== 002: products 테이블 =====

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

-- ===== 003: orders 테이블 =====

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  buyer_id         uuid not null references public.users(id) on delete cascade,
  product_id       uuid not null references public.products(id),
  amount           integer not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'paid', 'failed', 'cancelled')),
  toss_order_id    text unique,
  toss_payment_key text,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  unique (buyer_id, product_id)
);

alter table public.orders enable row level security;

-- 구매자 본인만 자신의 주문 조회
create policy "본인 주문 조회"
  on public.orders for select
  using (auth.uid() = buyer_id);

-- 로그인 사용자만 주문 생성
create policy "본인 주문 생성"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- ===== 004: Storage 버킷 + 정책 =====

-- 상품 이미지 (공개 버킷)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 상품 파일 (비공개 버킷)
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

-- product-images: 누구나 조회 가능
create policy "이미지 공개 조회"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- product-files: 인증된 사용자만 (다운로드는 서버에서 signed URL 발급)
create policy "파일 비공개 조회"
  on storage.objects for select
  using (bucket_id = 'product-files' and auth.role() = 'authenticated');

-- ===== 005: 유틸리티 함수 =====

-- 다운로드 카운트 증가
create or replace function public.increment_download_count(product_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.products
  set download_count = download_count + 1
  where id = product_id;
end;
$$;
