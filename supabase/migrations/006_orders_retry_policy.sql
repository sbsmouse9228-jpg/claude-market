-- =============================================
-- claude-market 006: 미결제 주문 재시도 정책
-- 결제 중단으로 남은 pending 주문을 본인이 새 주문번호로 갱신할 수 있도록 허용
-- (paid 주문은 수정 불가 — 결제 완료 기록 보호)
-- =============================================

create policy "본인 미결제 주문 수정"
  on public.orders for update
  using (auth.uid() = buyer_id and status <> 'paid')
  with check (auth.uid() = buyer_id and status <> 'paid');
