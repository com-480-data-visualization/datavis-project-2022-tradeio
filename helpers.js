const nbrCountriesTable = 10;


var convertRGBToRGBA = function(rgb, opacity=1) {     
    /* Backward compatibility for whole number based opacity values. */
    if (opacity > 1 && opacity <= 100) {
        opacity = opacity / 100;   
    }

    // Check that color is not rgba already
    var rgba = rgb
    if(rgb != null){
        if(rgb.indexOf('a') == -1){
            //rgb colors are written in the from of: rgb(xxx, yyy, zzz)
            rgba = rgb.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        }
    }
    return rgba;
};

var changeCountryCard = function(card_container, country) {
    if (country === null){
        card_container.innerHTML = ``;
    }
    else{
        card_container.innerHTML = 
        `<div class="card">
            <img class="card-img" src="${flagEndpoint}/${country.properties.ISO_A2.toLowerCase()}.png" alt="flag" />
            <div class="card_container">
                <span class="card-title"><b>${country.properties.ADMIN}</b></span> <br />
                <div class="card-spacer"></div>
                <hr />
                <div class="card-spacer"></div>
                <span><b>Total Trades:</b> ${country.properties.total_trades[selected_year] === -1  ? 'No Data available' : d3.format('.4s')(country.properties.total_trades[selected_year]).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(".2f")(country.properties.percentage_total[selected_year])}%</span><br />
                <span><b>Total Export:</b> ${country.properties.export_value[selected_year] === -1  ? 'No Data available' : d3.format('.4s')(country.properties.export_value[selected_year]).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2f")(country.properties.percentage_exports[selected_year])}%</span> <br />
                <span><b>Total Import:</b> ${country.properties.import_value[selected_year] === -1  ? 'No Data available' : d3.format('.4s')(country.properties.import_value[selected_year]).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2f")(country.properties.percentage_imports[selected_year])}%</span>
    
                <div class="card-spacer"></div>
                <hr />
                <div class="card-spacer"></div>
                <span><b>Largest exports:</b> ${country.properties.trade_value_exported[selected_year] === -1  ? 'No Data available' : d3.format('.4s')(country.properties.trade_value_exported[selected_year]).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")} to ${country.properties.highest_export_to[selected_year]} </span><br />
                <span><b>Largest Imports:</b> ${country.properties.trade_value_imported[selected_year] === -1  ? 'No Data available' : d3.format('.4s')(country.properties.trade_value_imported[selected_year]).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")} from ${country.properties.highest_import_from[selected_year]} </span><br />
    
                <!-- <div class="card-spacer"></div>
                <hr />
                <div class="card-spacer"></div>
                <span><b>Largest Export:</b> ${country.properties.Export_trade_value_usd  === -1 ? 'No Data available' : country.properties.Export_commodity}</span><br />
                <span><b>Value largest Export: </b>${country.properties.Export_trade_value_usd  === -1 ? 'No Data available' : d3.format('.4s')(country.properties.Export_trade_value_usd).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } </span><br /><br />             
                <span><b>Largest Import:</b> ${country.properties.Import_trade_value_usd  === -1  ? 'No Data available' : country.properties.Import_commodity}</span><br />
                <span><b>Value largest Import: </b>${country.properties.Import_trade_value_usd  === -1  ? 'No Data available' : d3.format('.4s')(country.properties.Import_trade_value_usd).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } </span>             
                </div> -->
            </div>
        </div>`;
    }
}

var changeCountryTable = function(table, tableBody, countries, tradeType) {
    tradeType = tradeType=="import_value" ? "Imports from" : "Exports to";
    table.tHead.innerHTML = `<tr><th colspan = "2">${tradeType}</th></tr>`;
    countries = countries.slice(0, nbrCountriesTable);
    console.log(countries)

    var idx = 0;
    const rowNumber = tableBody.rows.length;
    countries.forEach(country => {
        rowNumber == 0 ? addRowTable(tableBody, country) : updateRowTable(tableBody, idx, country);
        idx++;
    })

    // table_container.innerHTML = 
    //     `<table border = "1" cellpadding = "5" cellspacing = "5">
    //         <tr>
    //             <th colspan = "2">${tradeType}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[0][0]}</th>
    //             <th>${countries[0][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[1][0]}</th>
    //             <th>${countries[1][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[2][0]}</th>
    //             <th>${countries[2][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[1][0]}</th>
    //             <th>${countries[1][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[2][0]}</th>
    //             <th>${countries[3][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[1][0]}</th>
    //             <th>${countries[1][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[2][0]}</th>
    //             <th>${countries[3][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[1][0]}</th>
    //             <th>${countries[1][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[2][0]}</th>
    //             <th>${countries[3][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[1][0]}</th>
    //             <th>${countries[1][1]}</th>
    //         </tr>
    //         <tr>
    //             <th>${countries[2][0]}</th>
    //             <th>${countries[3][1]}</th>
    //         </tr>
    //     </table>`;
    table.style.visibility='visible'

}

function addRowTable(tableBody, country){
    var newRow = tableBody.insertRow(tableBody.rows.length);
    var nameCell = newRow.insertCell(0);
    var valueCell = newRow.insertCell(1);
    var playerText = document.createTextNode(country[0]);
    var scoreText = document.createTextNode(country[1]);
    nameCell.appendChild(playerText);
    valueCell.appendChild(scoreText);
}

function updateRowTable(tableBody, rowNumber, country){
    tableBody.rows[rowNumber].cells[0].innerText = country[0];
    tableBody.rows[rowNumber].cells[1].innerText = country[1];
}

var money_amount_fixer = function(amount){
    return d3.format('.4s')(amount).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")
}  

var PolygonColorChanger = function(d,polygon,arcArray){
    var targets_A2 = arcArray.map(x => x[3]);
    var target_Name = arcArray.map(x => x[4]);
    if (d === polygon){
        //console.log(d)
        //steelblue
        return `rgba(70, 130, 180, ${OPACITY_POLYGONE})`
    }else if(targets_A2.includes(d.properties.ISO_A2) || target_Name.includes(d.properties.ADMIN)){
        //lightsalmon
        return `rgba(255, 160, 122, ${OPACITY_POLYGONE})`
    }                    
    else{
        //grey
        return `rgba(128, 128, 128, ${OPACITY_POLYGONE})`
    }
}

