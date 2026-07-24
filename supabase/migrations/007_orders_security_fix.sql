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
