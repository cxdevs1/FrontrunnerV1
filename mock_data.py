import datetime


def get_mock_index_news():
    """
    Simulates a 'Spot Vacancy' announcement from S&P Global.
    This replaces the expensive API call during development.
    """
    return [
        {
            "ticker": "PATH",
            "company_name": "UiPath Inc.",
            "event_type": "Migration",
            "from_index": "SP600",
            "to_index": "SP400",
            "announcement_date": str(datetime.date.today()),
            "effective_date": "2026-01-16",
            "current_price": 24.50,
            "mkt_cap": 14_200_000_000,
            "avg_vol_30d": 6_500_000,
            "morning_vol": 12_000_000,
            "typical_morning_vol": 1_500_000
        },
        {
            "ticker": "HOOD",
            "company_name": "Robinhood Markets",
            "event_type": "Addition",
            "from_index": None,
            "to_index": "SP500",
            "announcement_date": str(datetime.date.today()),
            "effective_date": "2026-01-23",
            "current_price": 32.10,
            "mkt_cap": 28_500_000_000,
            "avg_vol_30d": 15_000_000,
            "morning_vol": 18_000_000,
            "typical_morning_vol": 4_000_000
        }
    ]
