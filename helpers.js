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
    tradeTypeHead = tradeType=="import_value" ? "Imports from (USD)" : "Exports to (USD)";
    table.tHead.innerHTML = `<tr><th colspan = "2" >${tradeTypeHead}</th></tr>`;


    // table.tHead.removeEventListener("click");
    //var el = document.getElementById('el-id'),
    tHeadClone = table.tHead.cloneNode(true);

    table.tHead.parentNode.replaceChild(tHeadClone, table.tHead);
    table.tHead.addEventListener("click", function(){
        //tradeType = document.getElementById("trade").value
        document.getElementById("trade").value = tradeType=="import_value" ? "export_value" : "import_value"
        onTradeChange()
    })
    countries = countries.slice(0, nbrCountriesTable);

    var idx = 0;
    var rowNumber = tableBody.rows.length;
    countries.forEach(country => {
        if (rowNumber == 0){
            // Table is empty or rowNumber got decreased and new cells must be added
            addRowTable(tableBody, country, idx)
        } else{
            // Update cells
            updateRowTable(tableBody, idx, country);
            if (rowNumber != countries.length){
                if (rowNumber > countries.length){
                    // Remove cells if there are more cells than countries
                    removeRowTable(table, rowNumber)
                }
                //Decrease rowNumber until rowNumber == 0 or rowNumber == countries.length
                rowNumber--;
            }
        }   
        idx++;
    })
    table.style.visibility='visible'
}

function addRowTable(tableBody, country, rowNumber){
    var newRow = tableBody.insertRow(rowNumber);
    var nameCell = newRow.insertCell(0);
    nameCell.addEventListener("click",function(){
        myGlobe.pointOfView(country[2], 1000)
    });
    var valueCell = newRow.insertCell(1);
    var countryName = document.createTextNode(`${rowNumber+1}. ${country[0]}`);
    var value = document.createTextNode(country[1]);
    nameCell.appendChild(countryName);
    valueCell.appendChild(value);
}

function updateRowTable(tableBody, rowNumber, country){
    tableBody.rows[rowNumber].cells[0].innerText = `${rowNumber+1}. ${country[0]}`;
    tableBody.rows[rowNumber].cells[0].addEventListener("click",function(){
        myGlobe.pointOfView(country[2], 1000)
    });
    tableBody.rows[rowNumber].cells[1].innerText = country[1];
}

function removeRowTable(table, rowNumber){
    table.deleteRow(rowNumber);
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
            .then(_ => {if (prod===selected_prod){current_trades = products_dict[prod];}})
            .then(onProductChange("all"));
    });
}



var geographicMiddle = function(lat1, lng1, lat2, lng2) {
	
    //-- Longitude difference
    var dLng = degToRad(lng2 - lng1);

    //-- Convert to radians
    lat1 = degToRad(lat1);
    lat2 = degToRad(lat2);
    lng1 = degToRad(lng1);

    var bX = Math.cos(lat2) * Math.cos(dLng);
    var bY = Math.cos(lat2) * Math.sin(dLng);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
    var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

    //-- Return result
    return {'lat':radToDeg(lat3), 'lon':radToDeg(lng3)};
}

var degToRad = function(deg) {
    return deg * (Math.PI / 180.0);
}

var radToDeg = function(rad) {
    return rad * (180.0 / Math.PI);
}

function color_countries_gray(value){
    //console.log(value)
    if(value == "rgb(255, 255, 204)"){
        return "grey"
    }
    return value;
    
}

function arc_color_product(cat){
    switch(cat){
        case 'food': 
            return [28,88,126];
        case 'beverage': 
            return [255,140,0];
        case 'crude_materials': 
            return [139,0,0];
        case 'fuels': 
            return [139,69,19];
        case 'vegetable_oil': 
            return [219,112,147];
        case 'chemicals': 
            return [255,236,139];
        case 'material_manufacturers': 
            return [72,61,139];
        case 'machinery': 
            return [110,139,61];
        case 'other_manufacturers': 
            return [151,255,255];
        case 'unspecified': 
            return [205,197,191];
        case 'all': 
            return [141,82,164];
            
    }
}

var delay = function(time_ms) {
    return new Promise(resolve => setTimeout(resolve, time_ms));
  }