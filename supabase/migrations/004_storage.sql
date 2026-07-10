-- =============================================
-- claude-market 004: Storage 버킷 + 정책
-- =============================================

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
