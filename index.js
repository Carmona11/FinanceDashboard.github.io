const key = '1d1c1753e2794adb947cfe3b236b3b33';
let queryResult = [];
let dates = [];
let stockReturn = [];
let finSales = [];
let finDates = [];
let finCogs = [];
let finGrossProfit = [];

// Obtenemos las variables del input del usuario y las guardamos.
function Submit() {
    let name = document.getElementById("ticker").value.toString();
    let rawStart_date = document.getElementById("start_date").value.toString();
    let rawEnd_date = document.getElementById("end_date").value.toString();
    let start_date = rawStart_date.replace('/', '-')
    let end_date = rawEnd_date.replace('/', '-')

    let ticker = { name, start_date, end_date };

    document.getElementById("results").innerHTML = ticker.name + ' ' + ticker.start_date + ' ' + ticker.end_date

    searchTicker(ticker.name, ticker.start_date, ticker.end_date)
}

// REALIZAMOS LA PETICIÓN DE LA API PARA IMPORTAR LOS DATOS
function searchTicker(name, startdate, enddate) {
    const urlP = 'https://api.twelvedata.com/time_series?symbol=' + name + '&interval=1day&start_date=' + startdate + '&end_date=' + enddate + '&apikey=' + key.toString();
    fetch(urlP)
        .then((res) => res.json())
        .then((data) => {
            loadTicker(data)
            console.log(data)
        })
        .catch((error) => {
            console.log(error)
        })

    const urlIncome = 'https://api.twelvedata.com/income_statement?symbol=' + name + '&interval=1day&start_date=' + startdate + '&end_date=' + enddate + '&apikey=' + key.toString();
    fetch(urlIncome)
        .then((res) => res.json())
        .then((data) => {
            loadStatements(data)
        })
        .catch((error) => {
            console.log(error)
        })

}



// TRAEMOS LA DATA EXTRAIDA DE LA API Y LA TRANSFORMAMOS
function loadTicker(asset) {
    let loadStock = asset.meta.symbol
    let rawPrice = [];
    let closePrice = [];

    for (let k in asset.values) {
        dates[k] = asset.values[k].datetime;
        rawPrice[k] = asset.values[k].close;
    }

    for (var i = 0; i < rawPrice.length; i++) {
        closePrice[i] = parseFloat(rawPrice[i])
    }

    timeSeries(dates, closePrice, loadStock)

    // CALCULAMOS EL RENDIMIENTO DE LOS PRECIOS
    let returns = [];

    for (var i = 1; i < closePrice.length; i++) {
        returns[i - 1] = Math.log(closePrice[i] / closePrice[i - 1]);
    }

    priceReturns(dates, returns, loadStock)

}


function loadStatements(financials) {
    let finNetIncome = [];
    let finEbitda = [];

    table = document.getElementById("mainTable").hidden = false;

    tableDates = document.getElementById("periods")
    tableContent = document.getElementById("finTable")

    tableContent.innerHTML = `
    <tr id = "r1">
    <th>Sales</th>
    </tr>
    <tr id = "r2">
    <th>Cost of Goods</th>
    </tr>
    <tr id = "r3">
    <th>Gross Profit</th>
    </tr>
    <tr id = "r4">
    <th>Net Income</th>
    </tr>
    <tr id = "r5">
    <th>EBITDA</th>
    </tr>`;

    rSales = document.getElementById("r1");
    rCogs = document.getElementById("r2");
    rGrossProfit = document.getElementById("r3");
    rNetIncome = document.getElementById("r4");
    rEbitda = document.getElementById("r5");


    for (let k in financials.income_statement) {

        finDates[k] = financials.income_statement[k].fiscal_date;
        finSales[k] = financials.income_statement[k].sales;
        finCogs[k] = financials.income_statement[k].cost_of_goods;
        finGrossProfit[k] = financials.income_statement[k].gross_profit;
        // Falta operating_expense 
        // Falta operating_income
        finNetIncome[k] = financials.income_statement[k].net_income;
        finEbitda[k] = financials.income_statement[k].ebitda;


        tableDates.innerHTML += '<th>' + finDates[k] + '</th>';
        rSales.innerHTML += '<td>'+ finSales[k] + '</td>'
        rCogs.innerHTML += '<td>' + finCogs[k] + '</td>'
        rGrossProfit.innerHTML += '<td>' + finGrossProfit[k] + '</td>'
        rNetIncome.innerHTML += '<td>' + finNetIncome[k] + '</td>'
        rEbitda.innerHTML += '<td>' + finEbitda[k] + '</td>'
    }

}


// IMPORTAMOS DATOS DEL ACTIVO Y LOS GRAFICAMOS
function timeSeries(stockDate, stockPrices, stockName) {
    const clines = document.getElementById('timeSeries')
    new Chart(clines, {
        type: 'line',
        data: {
            labels: stockDate,
            datasets: [
                {
                    label: stockName + ' PRICES',
                    data: stockPrices,
                    borderWidth: 1,
                    borderColor: 'rgb(43, 5, 139'
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    })


}

function priceReturns(stockDate, stockReturns, stockName) {
    const clines = document.getElementById('returns')
    new Chart(clines, {
        type: 'line',
        data: {
            labels: stockDate,
            datasets: [
                {
                    label: stockName + ' RETURNS',
                    data: stockReturns,
                    borderWidth: 1,
                    borderColor: 'rgb(43, 5, 139'
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    })


}



