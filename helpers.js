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
    card_container.innerHTML = 
    `<div class="card">
        <img class="card-img" src="${flagEndpoint}/${country.properties.ISO_A2.toLowerCase()}.png" alt="flag" />
        <div class="card_container">
            <span class="card-title"><b>${country.properties.ADMIN}</b></span> <br />
            <div class="card-spacer"></div>
            <hr />
            <div class="card-spacer"></div>
            <span><b>Total Trades:</b> ${country.properties.total_trades_2019 === -1  ? 'No Data available' : d3.format('.4s')(country.properties.total_trades_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(".2f")(country.properties.percentage_total_2019)}%</span><br />
            <span><b>Total Export:</b> ${country.properties.export_value_2019 === -1  ? 'No Data available' : d3.format('.4s')(country.properties.export_value_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2f")(country.properties.percentage_exports_2019)}%</span> <br />
            <span><b>Total Import:</b> ${country.properties.import_value_2019 === -1  ? 'No Data available' : d3.format('.4s')(country.properties.import_value_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2f")(country.properties.percentage_imports_2019)}%</span>

            <div class="card-spacer"></div>
            <hr />
            <div class="card-spacer"></div>
            <span><b>Largest exports:</b> ${country.properties.trade_value_exported_2019 === -1  ? 'No Data available' : d3.format('.4s')(country.properties.trade_value_exported_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")} to ${country.properties.highest_export_to_2019} </span><br />
            <span><b>Largest Imports:</b> ${country.properties.trade_value_imported_2019 === -1  ? 'No Data available' : d3.format('.4s')(country.properties.trade_value_imported_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")} from ${country.properties.highest_import_from_2019} </span><br />

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
    return ``;
}