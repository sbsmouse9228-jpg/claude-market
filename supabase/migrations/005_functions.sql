-- =============================================
-- claude-market 005: 유틸리티 함수
-- =============================================

-- 다운로드 카운트 증가
create or replace function public.increment_download_count(product_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.products
  set download_count = download_count + 1
  where id = product_id;
end;
$$;
