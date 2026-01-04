from mock_data import get_mock_index_news
from index_logic import calculate_multi_index_pressure


def run_app_demo():
    print("--- Index Inclusion Sniper: Live Dashboard ---")
    news_events = get_mock_index_news()
    
    for event in news_events:
        analysis = calculate_multi_index_pressure(
            event['ticker'], 
            event['mkt_cap'], 
            event['current_price'], 
            event['avg_vol_30d'], 
            event['to_index']
        )
        
        print(f"\nALERT: {event['ticker']} joining {event['to_index']}")
        print(f"Intensity: {analysis['ui_label']}")
        print(f"Pressure Score: {analysis['pressure_score']}x")
        print(f"Status: {analysis['alert_level']}")


if __name__ == "__main__":
    run_app_demo()
