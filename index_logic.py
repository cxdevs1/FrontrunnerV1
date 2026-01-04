INDEX_AUM = {
    "SP500": 12_500_000_000_000,
    "SP400": 1_600_000_000_000,
    "SP600": 1_100_000_000_000,
}

INDEX_TOTAL_CAP = {
    "SP500": 58_000_000_000_000,
    "SP400": 3_200_000_000_000,
    "SP600": 1_500_000_000_000,
}


def calculate_multi_index_pressure(ticker, mkt_cap, price, avg_vol_30d, index_target):
    """
    Calculate mechanical buying pressure for index additions.
    Returns pressure score, required shares, and alert levels.
    """
    aum = INDEX_AUM.get(index_target, INDEX_AUM["SP500"])
    total_cap = INDEX_TOTAL_CAP.get(index_target, INDEX_TOTAL_CAP["SP500"])
    
    index_weight = mkt_cap / total_cap
    dollars_to_buy = aum * index_weight
    shares_to_buy = int(dollars_to_buy / price)
    days_of_volume = dollars_to_buy / (avg_vol_30d * price)
    pressure_score = round(days_of_volume, 2)
    
    if pressure_score >= 3.0:
        intensity = "EXTREME"
        ui_label = "EXTREME PRESSURE"
        alert_level = "BUY ALERT"
    elif pressure_score >= 1.5:
        intensity = "HIGH"
        ui_label = "HIGH PRESSURE"
        alert_level = "WATCH"
    else:
        intensity = "NORMAL"
        ui_label = "NORMAL PRESSURE"
        alert_level = "MONITOR"
    
    return {
        "ticker": ticker,
        "index_target": index_target,
        "pressure_score": pressure_score,
        "shares_to_buy": shares_to_buy,
        "dollars_to_buy": dollars_to_buy,
        "intensity": intensity,
        "ui_label": ui_label,
        "alert_level": alert_level,
    }
