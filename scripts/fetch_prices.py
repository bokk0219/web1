#!/usr/bin/env python3
"""
보유 종목의 현재가(USD)와 USD/KRW 환율을 yfinance로 조회해 JSON으로 출력한다.

사용법:
    python3 scripts/fetch_prices.py portfolio/holdings.json > /tmp/prices.json

이 스크립트는 이 레포지토리가 실행되는 환경의 아웃바운드 네트워크 정책이
Yahoo Finance(finance.yahoo.com / fc.yahoo.com) 접속을 허용해야 동작한다.
차단되어 있으면 curl_cffi.requests.exceptions.ConnectionError 등으로 실패하며,
이 경우 stderr에 원인을 남기고 exit code 1로 종료한다. 호출한 쪽(러너)은
이 실패를 감지해서 "가격 조회 실패" 알림만 카카오톡으로 보내고 나머지 단계는
건너뛰어야 한다.
"""
import json
import sys
from datetime import datetime, timezone

FX_TICKER = "KRW=X"  # 1 USD = X KRW


def main():
    if len(sys.argv) != 2:
        print("usage: fetch_prices.py <holdings.json>", file=sys.stderr)
        sys.exit(2)

    import yfinance as yf

    with open(sys.argv[1], encoding="utf-8") as f:
        holdings = json.load(f)

    tickers = [p["ticker"] for p in holdings["positions"]]

    errors = {}
    prices = {}
    for ticker in tickers:
        try:
            info = yf.Ticker(ticker).fast_info
            prices[ticker] = float(info["last_price"])
        except Exception as e:  # noqa: BLE001 - 개별 종목 실패는 나머지에 영향 주지 않음
            errors[ticker] = str(e)

    fx_rate = None
    try:
        fx_rate = float(yf.Ticker(FX_TICKER).fast_info["last_price"])
    except Exception as e:  # noqa: BLE001
        errors["_fx"] = str(e)

    result = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "fx_usdkrw": fx_rate,
        "prices": prices,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if fx_rate is None or len(errors) >= len(tickers):
        # 환율을 못 가져왔거나 전 종목이 실패하면 이후 단계가 무의미하므로 실패로 종료
        sys.exit(1)


if __name__ == "__main__":
    main()
