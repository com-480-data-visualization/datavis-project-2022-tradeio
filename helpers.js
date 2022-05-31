const nbrCountriesTable = 10;

var changeCountryCard = function(card_container, country) {
    card_container.innerHTML = (country === null) ? '' : countryCard(country)
}


var countryCard = function(country) {
    return  `<div class="card">
            <img class="card-img" src="${flagEndpoint}/${country.properties.ISO_A2.toLowerCase()}.png" alt="flag" />
            <div class="card_container">
                <span class="card-title"><b>${country.properties.ADMIN}</b></span> <br />
                <div class="card-spacer"></div>
                <hr />
                <div class="card-spacer"></div>
                <span><b>Total Trades:</b> ${country.properties.total_trades[selected_year] === -1  ? 'No Data available' : money_amount_fixer(country.properties.total_trades[selected_year]) } - ${d3.format(".2f")(country.properties.percentage_total[selected_year])}%</span><br />
                <span><b>Total Export:</b> ${country.properties.export_value[selected_year] === -1  ? 'No Data available' : money_amount_fixer(country.properties.export_value[selected_year]) } - ${d3.format(",.2f")(country.properties.percentage_exports[selected_year])}%</span> <br />
                <span><b>Total Import:</b> ${country.properties.import_value[selected_year] === -1  ? 'No Data available' : money_amount_fixer(country.properties.import_value[selected_year]) } - ${d3.format(",.2f")(country.properties.percentage_imports[selected_year])}%</span>
    
                <div class="card-spacer"></div>
                <hr />
                <div class="card-spacer"></div>
                <span><b>Largest exports:</b> ${country.properties.trade_value_exported[selected_year] === -1  ? 'No Data available' : money_amount_fixer(country.properties.trade_value_exported[selected_year])} to ${country.properties.highest_export_to[selected_year]} </span><br />
                <span><b>Largest Imports:</b> ${country.properties.trade_value_imported[selected_year] === -1  ? 'No Data available' : money_amount_fixer(country.properties.trade_value_imported[selected_year])} from ${country.properties.highest_import_from[selected_year]} </span><br />
    
                <!-- <div class="card-spacer"></div>
                <hr />
                <div class="card-spacer"></div>
                <span><b>Largest Export:</b> ${country.properties.Export_trade_value_usd  === -1 ? 'No Data available' : country.properties.Export_commodity}</span><br />
                <span><b>Value largest Export: </b>${country.properties.Export_trade_value_usd  === -1 ? 'No Data available' : money_amount_fixer(country.properties.Export_trade_value_usd)} </span><br /><br />             
                <span><b>Largest Import:</b> ${country.properties.Import_trade_value_usd  === -1  ? 'No Data available' : country.properties.Import_commodity}</span><br />
                <span><b>Value largest Import: </b>${country.properties.Import_trade_value_usd  === -1  ? 'No Data available' : money_amount_fixer(country.properties.Import_trade_value_usd)} </span>             
                </div> -->
            </div>
            </div>`;
}

var changeCountryTable = function(table, tableBody, countries, tradeType) {
    tradeType = tradeType=="import_value" ? "Imports from (USD)" : "Exports to (USD)";
    table.tHead.innerHTML = `<tr><th colspan = "2">${tradeType}</th></tr>`;
    countries = countries.slice(0, nbrCountriesTable);

    var idx = 0;
    const rowNumber = tableBody.rows.length;
    countries.forEach(country => {
        rowNumber == 0 ? addRowTable(tableBody, country, idx) : updateRowTable(tableBody, idx, country);
        idx++;
    })
    table.style.visibility='visible'
}

function addRowTable(tableBody, country, rowNumber){
    var newRow = tableBody.insertRow(rowNumber);
    var nameCell = newRow.insertCell(0);
    var valueCell = newRow.insertCell(1);
    var playerText = document.createTextNode(`${rowNumber+1}. ${country[0]}`);
    var scoreText = document.createTextNode(country[1]);
    nameCell.appendChild(playerText);
    valueCell.appendChild(scoreText);
}

function updateRowTable(tableBody, rowNumber, country){
    tableBody.rows[rowNumber].cells[0].innerText = `${rowNumber+1}. ${country[0]}`;
    tableBody.rows[rowNumber].cells[1].innerText = country[1];
}

var money_amount_fixer = function(amount){
    return d3.format('.4s')(amount).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")
}  

var PolygonColorChanger = function(d,polygon,arcArray){
    var targets_A2 = arcArray.map(x => x[3]);
    var target_Name = arcArray.map(x => x[4]);
    if (d === polygon){
        return 'steelblue'
    }else if(targets_A2.includes(d.properties.ISO_A2) || target_Name.includes(d.properties.ADMIN)){
        return 'lightsalmon'
    }                    
    else{
        return 'grey'
    }
}


var load_trade_data = function(prods){
    prods.forEach(prod => {
        fetch('./dataset/trade_data_' + prod + '.json')
            .then(x => x.json()).then(trades => {products_dict[prod] = trades})
            .then(_ => {if (prod==='all'){current_trades = products_dict[prod];}});
    });
    onProductChange('all')
}
