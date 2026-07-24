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

-- 미결제 주문은 본인이 새 주문번호로 갱신 가능 (결제 재시도용, paid는 수정 불가)
create policy "본인 미결제 주문 수정"
  on public.orders for update
  using (auth.uid() = buyer_id and status <> 'paid')
  with check (auth.uid() = buyer_id and status <> 'paid');

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

-- ===== 007: 보안 결함 수정 (orders 위조 방지 + storage 직접 접근 차단) =====

-- =============================================
-- claude-market 007: 보안 결함 수정
-- 1) orders INSERT/UPDATE 시 클라이언트가 status='paid' 또는 임의 금액으로
--    주문을 위조할 수 있던 결함 수정 (paid 전환은 service_role API만 가능)
-- 2) product-files 스토리지 버킷을 인증 사용자에게 직접 노출하던 정책 제거
--    (다운로드는 항상 서버가 service_role로 발급하는 signed URL 경로만 허용)
-- =============================================

-- 1) orders INSERT: 최초 주문은 반드시 pending 상태 + 실제 상품가와 일치하는 금액만 허용
drop policy if exists "본인 주문 생성" on public.orders;

create policy "본인 주문 생성"
  on public.orders for insert
  with check (
    auth.uid() = buyer_id
    and status = 'pending'
    and amount = (select price from public.products where id = product_id)
  );

-- 006에서 만든 재시도용 UPDATE 정책도 금액 위조를 막도록 강화
drop policy if exists "본인 미결제 주문 수정" on public.orders;

create policy "본인 미결제 주문 수정"
  on public.orders for update
  using (auth.uid() = buyer_id and status <> 'paid')
  with check (
    auth.uid() = buyer_id
    and status <> 'paid'
    and amount = (select price from public.products where id = product_id)
  );

-- 2) product-files: 인증 사용자 전체 조회 정책 제거
--    (신규/편집 없이도 정책 자체를 없애 storage.objects 직접 조회를 완전 차단)
drop policy if exists "파일 비공개 조회" on storage.objects;
