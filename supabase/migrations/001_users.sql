-- =============================================
-- claude-market 001: users 테이블
-- =============================================

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
