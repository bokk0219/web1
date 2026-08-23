#!/usr/bin/env python3
"""
holdings.json + state.json + prices.json 을 입력받아
원화 기준 평가손익률을 계산하고, 분할매도/트레일링스탑 규칙을 평가해서
alerts.json 을 출력하고 state.json 을 갱신한다.

사용법:
    python3 scripts/compute_alerts.py \
        portfolio/holdings.json portfolio/state.json /tmp/prices.json \
        > /tmp/alerts.json
    (state.json은 이 스크립트가 같은 경로에 직접 덮어쓴다)

매도 트리거 규칙 (모두 "종목별 원화 기준 수익률" 기준):
  - 수익률 구간 30/60/90/120%를 최초로 넘을 때마다 원 보유수량(original_qty)의
    25%씩 누적 매도 알림 (총 4단계, 100%)
  - 트레일링스탑: 그날까지 기록된 최고 수익률(peak_return_pct) 대비 현재 수익률이
    15%p 이상 하락하면 원 보유수량의 25% 매도 알림. 같은 peak에서는 한 번만
    발동하고, peak가 갱신된 뒤 다시 15%p 하락해야 재발동한다.
  - 위 두 트리거로 누적 매도 비율이 100%(original_qty 기준)를 넘지 않도록 캡을 건다.
  - 연간 실현이익 누계(realized_profit_krw_ytd, 트리거 발동 시점 가격으로 추정)가
    양도세 기본공제 250만원의 80%(200만원) 이상이면 "근접", 250만원 이상이면
    "초과 주의" 경고를 별도로 낸다. 연도가 바뀌면 누계는 0으로 리셋된다.

주의: remaining_qty와 실현손익은 "알림이 발동된 시점의 가격으로 그 비율만큼
실제로 팔았다"는 가정 하의 추정치다. 실제 토스앱 체결 수량/단가와 다를 수 있으므로
사용자가 holdings.json을 주기적으로 실제 잔고에 맞춰 보정해야 한다.
"""
import json
import sys
from datetime import datetime, timezone

TIERS = [30, 60, 90, 120]
TRAILING_STOP_DROP_PP = 15
SELL_FRACTION = 0.25
ANNUAL_TARGET_KRW = 2_500_000
ANNUAL_WARN_RATIO = 0.8


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    if len(sys.argv) != 4:
        print("usage: compute_alerts.py <holdings.json> <state.json> <prices.json>", file=sys.stderr)
        sys.exit(2)

    holdings_path, state_path, prices_path = sys.argv[1:4]
    holdings = load(holdings_path)
    state = load(state_path)
    prices = load(prices_path)

    now = datetime.now(timezone.utc)
    current_year = now.year
    if state.get("realized_year") != current_year:
        state["realized_year"] = current_year
        state["realized_profit_krw_ytd"] = 0

    fx = prices.get("fx_usdkrw")
    price_errors = prices.get("errors", {})

    out_positions = []
    newly_realized_krw = 0.0

    for pos in holdings["positions"]:
        ticker = pos["ticker"]
        st = state["positions"].setdefault(
            ticker, {"peak_return_pct": None, "tiers_completed": [], "trailing_stop_last_peak": None}
        )

        price_usd = prices.get("prices", {}).get(ticker)
        entry = {
            "ticker": ticker,
            "name": pos["name"],
            "remaining_qty": pos["remaining_qty"],
            "triggers": [],
        }

        if fx is None or price_usd is None:
            entry["error"] = price_errors.get(ticker) or price_errors.get("_fx") or "가격 조회 실패"
            out_positions.append(entry)
            continue

        price_krw = price_usd * fx
        return_pct = (price_krw / pos["avg_cost_krw"] - 1) * 100

        peak = st["peak_return_pct"]
        peak = return_pct if peak is None else max(peak, return_pct)
        st["peak_return_pct"] = peak

        entry["price_usd"] = round(price_usd, 2)
        entry["price_krw"] = round(price_krw, 0)
        entry["return_pct"] = round(return_pct, 2)
        entry["peak_return_pct"] = round(peak, 2)

        def remaining_sellable_fraction():
            sold = len(st["tiers_completed"]) * SELL_FRACTION + st.get("trailing_stop_count", 0) * SELL_FRACTION
            return max(0.0, 1.0 - sold)

        # 1) 수익률 구간 트리거 (오름차순, 그날 여러 단계를 동시에 넘었으면 모두 발동)
        for tier in TIERS:
            if tier in st["tiers_completed"]:
                continue
            if return_pct >= tier:
                frac = min(SELL_FRACTION, remaining_sellable_fraction())
                if frac <= 0:
                    st["tiers_completed"].append(tier)
                    continue
                sell_qty = round(pos["original_qty"] * frac, 4)
                realized = sell_qty * (price_krw - pos["avg_cost_krw"])
                newly_realized_krw += realized
                pos["remaining_qty"] = round(max(0.0, pos["remaining_qty"] - sell_qty), 4)
                st["tiers_completed"].append(tier)
                entry["triggers"].append(
                    {
                        "type": "profit_tier",
                        "threshold_pct": tier,
                        "sell_qty": sell_qty,
                        "sell_fraction_of_original": frac,
                        "cumulative_fraction_sold": round(len(st["tiers_completed"]) * SELL_FRACTION, 2),
                        "estimated_realized_krw": round(realized, 0),
                    }
                )

        # 2) 트레일링스탑 트리거
        last_peak = st.get("trailing_stop_last_peak")
        if peak - return_pct >= TRAILING_STOP_DROP_PP and (last_peak is None or peak > last_peak):
            frac = min(SELL_FRACTION, remaining_sellable_fraction())
            if frac > 0:
                sell_qty = round(pos["original_qty"] * frac, 4)
                realized = sell_qty * (price_krw - pos["avg_cost_krw"])
                newly_realized_krw += realized
                pos["remaining_qty"] = round(max(0.0, pos["remaining_qty"] - sell_qty), 4)
                st["trailing_stop_count"] = st.get("trailing_stop_count", 0) + 1
                entry["triggers"].append(
                    {
                        "type": "trailing_stop",
                        "peak_return_pct": round(peak, 2),
                        "drop_pp": round(peak - return_pct, 2),
                        "sell_qty": sell_qty,
                        "estimated_realized_krw": round(realized, 0),
                    }
                )
            st["trailing_stop_last_peak"] = peak

        entry["remaining_qty"] = pos["remaining_qty"]
        out_positions.append(entry)

    state["realized_profit_krw_ytd"] = round(state.get("realized_profit_krw_ytd", 0) + newly_realized_krw, 0)
    state["updated_at"] = now.isoformat()

    annual_warning = None
    ytd = state["realized_profit_krw_ytd"]
    if ytd >= ANNUAL_TARGET_KRW:
        annual_warning = "exceeded"
    elif ytd >= ANNUAL_TARGET_KRW * ANNUAL_WARN_RATIO:
        annual_warning = "near"

    result = {
        "fetched_at": prices.get("fetched_at"),
        "fx_usdkrw": fx,
        "positions": out_positions,
        "realized_profit_krw_ytd": ytd,
        "annual_target_krw": ANNUAL_TARGET_KRW,
        "annual_target_warning": annual_warning,
    }

    save(holdings_path, holdings)
    save(state_path, state)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
