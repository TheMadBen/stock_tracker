from flask import Flask, request, render_template, jsonify
import yfinance as yf

app = Flask(__name__, template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock', methods=['POST'])
def get_stock():
    ticker = request.get_json()['ticker']   # get ticker as a json object and get the ticker field from it
    data = yf.Ticker(ticker).history(period='1y') # get historical data of ticker from past year, will be returned as a dataframe
    return jsonify({'current_price': data.iloc[-1].Close,   # we want to get the very last value (most recent) within the Close column
                    'open_price': data.iloc[-1].Open})      # same thing with the open price
    
    
if __name__ == "__main__":
    app.run(debug=True)