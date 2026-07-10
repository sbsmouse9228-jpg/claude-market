-- =============================================
-- claude-market 003: orders 테이블
-- =============================================

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

-- 결제 상태 업데이트는 API Route에서 service_role key로 처리
