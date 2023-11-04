import yfinance as yf
from datetime import datetime

if __name__ == "__main__":
    amzn = yf.Ticker("AMZN")

    # GET TODAYS DATE AND CONVERT IT TO A STRING WITH YYYY-MM-DD FORMAT (YFINANCE EXPECTS THAT FORMAT)
    end_date = datetime.now().strftime('%Y-%m-%d')
    amzn_hist = amzn.history(start='2022-01-01',end=end_date)
    amzn_close = amzn_hist.iloc[-1].Close
    print(amzn_close)
    # print(amzn_hist)