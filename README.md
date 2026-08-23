# web1

## 해외주식 아침 알림 시스템

매일 아침 KST 07:00에 보유 해외주식(브로드컴/아이온큐/엔비디아/오클로/팔란티어/우라늄에너지)의
원화 기준 평가손익, 관련 뉴스, 분할매도·트레일링스탑 규칙 발동 여부를 카카오톡 나챗방으로 보내는
알림용(자동매매 아님) 시스템이다. 자동 실행은 2026-09-01부터 시작.

- `portfolio/holdings.json` — 보유 종목 원장 (원 보유수량, 잔여수량, 평균단가)
- `portfolio/state.json` — 최고 수익률, 분할매도 단계, 연간 실현손익 누계 등 매일 갱신되는 상태
- `scripts/fetch_prices.py` — yfinance로 시세/환율 조회
- `scripts/compute_alerts.py` — 원화 환산 손익률 계산 + 매도규칙 평가 + 상태 갱신
- `scripts/format_messages.py` — 카카오톡 메시지(200자 이내) 생성
- `docs/daily_runbook.md` — 매일 자동 세션이 따르는 실행 절차 (전제 조건, 실패 시 처리 포함)

### 실행 전제 조건
1. ✅ **PlayMCP 네이버 검색 MCP 연결** — 완료
2. ✅ **환경 네트워크 정책에서 Yahoo Finance(query1.finance.yahoo.com) 아웃바운드 허용** — 완료. 단 `yfinance`
   패키지 자체는 이 환경 프록시와 궁합이 안 맞아 표준 `requests`로 Yahoo chart API를 직접 호출하도록 구현함
   (`scripts/fetch_prices.py` 참고)
3. ⛔ **claude.ai Routines(예약) 화면에서 매일 07:00 KST 트리거를 직접 생성** — API로 만든 트리거는 이 조직에서
   PlayMCP 커넥터를 붙일 수 없어서, 반드시 웹 UI에서 만들어야 카카오톡/네이버 도구가 실제로 동작함
