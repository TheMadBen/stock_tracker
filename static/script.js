var tickers = JSON.parse(localStorage.getItem('tickers')) || [];    // this makes it so that the users local device is used, it won't be server side if there was one

if (!Array.isArray(tickers)) {
    // If tickers is not an array, initialize it as an empty array
    tickers = [];
}

var lastPrices = {};
var counter = 15;

// function that calls updataPrices every counter interval
function startUpdateCycle() {
    updatePrices();
    setInterval(function() {
        counter--;
        $('#counter').text(counter)   //jquery $('#html id')
        if(counter <= 0) {
            updatePrices();
            counter = 15;
        }
    }, 1000)   // this is in milliseconds, so delay is every one second
}
// Code included inside $( document ).ready() will only run once the page Document Object Model (DOM) is ready for JavaScript code to execute.
$(document).ready(function() {
    tickers.forEach(function(ticker) {
        addTickerToGrid(ticker);
    });

    updatePrices();

    $('#add-ticker').submit(function(e) {   // now handle when form is submitted to add ticker
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();  // target where user entered the ticker
        
        if(!tickers.includes(newTicker)) {  // check if ticker already exists in ticker list
            tickers.push(newTicker);    // add new ticker if it doesn't exist
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
        }
        // we want to clear the input now
        $('#new-ticker').val('');
        updatePrices();
    });

    // this part we are handling the ability to remove tickers from the ticker grid with a remove button
    // the . in front of remove specifies a class
    $('#ticker-grid').on('click', '.remove-button', function() {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);   // update tickers list to remove the target ticker
        localStorage.setItem('tickers', JSON.stringify(tickers));
        $(`#${tickerToRemove}`).remove();   // use backtick instead of single quote here
        // backticks are called template literals where they can represent multi line strings
    });
    startUpdateCycle();
});

function addTickerToGrid(ticker) {
    // target the ticker grid div and add divs with ticker information
    $('#ticker-grid').append(
        `<div id='${ticker}' class='ticker-box'>
            <h2>${ticker}</h2>
            <p id='${ticker}-price'></p>
            <p id='${ticker}-percent'></p>
            <button class='remove-button' data-ticker='${ticker}'>Remove</button>
        </div>`);
}

function updatePrices() {
    tickers.forEach(function(ticker) {
        // Perform an asynchronous HTTP (Ajax) request.
        $.ajax({
            url: '/get_stock',
            type: 'POST',
            data: JSON.stringify({'ticker':ticker}),    // pass data in as a dictionary with key value pair
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(data) {
                var changePercent = ((data.current_price - data.open_price) / data.open_price) * 100;
                var colorClass; 
                // depending on size of gain or loss will determine color
                if(changePercent <= -2) {
                    colorClass = 'dark-red'
                }
                else if(changePercent < 0) {
                    colorClass = 'red'
                }
                else if(changePercent == 0) {
                    colorClass = 'gray'
                }
                else if(changePercent <= 2) {
                    colorClass = 'green'
                }
                else {
                    colorClass = 'dark-green'
                }

                $(`#${ticker}-price`).text(`$${data.current_price.toFixed(2)}`);    // select price and show '$price'
                $(`#${ticker}-percent`).text(`${changePercent.toFixed(2)}%`);   // select percent and show 'percent%'
                $(`#${ticker}-price`).removeClass('dark-red red gray green dark-green').addClass(colorClass);   // remove the color class it may already have and then add the new one
                $(`#${ticker}-percent`).removeClass('dark-red red gray green dark-green').addClass(colorClass);

                var animationClass;

                if(lastPrices[ticker] > data.current_price) {
                    animationClass = 'red-flash';
                }
                else if(lastPrices[ticker] < data.current_price) {
                    animationClass = 'green-flash';
                }
                else {
                    animationClass = 'gray-flash';
                }
                lastPrices[ticker] = data.current_price;

                $(`#${ticker}`).addClass(animationClass);
                setTimeout(function() {
                    $(`#${ticker}`).removeClass(animationClass);
                }, 1000);   // once the animation has happened, remove it after one second
            }
        });
    });
}