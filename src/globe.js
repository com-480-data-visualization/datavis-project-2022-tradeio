
const COUNTRY = 'United States';
//const OPACITY = 0.22;
const OPACITY = 0.99;
const OPACITY_POLYGONE = 1
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';

// GDP per capita (avoiding countries with small pop)
const getVal = feat => feat.properties.GDP_MD / (5 * 1e6); //  / Math.max(1e5, feat.properties.POP_EST);

//fetch('../dataset/classifications_data/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries =>{
fetch('../dataset/countries.geojson').then(res => res.json()).then(countries =>{
    fetch('../dataset/geo_export.json').then(x => x.json()).then(exports =>{
        const myGlobe = Globe()
        (document.getElementById('globeViz'))  
        .globeImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-night.jpg')
        //.globeImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-dark.jpg')
        // .globeImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg')
        //.globeImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-day.jpg')
        .backgroundImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/night-sky.png')
        .pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 }) // aim at continental US centroid
        .onGlobeClick(reset)


        //// Arcs
        //.arcDashLength(0.5)
        //.arcDashGap(0.5)
        //.arcDashInitialGap(() => Math.random())
        //.arcDashAnimateTime(2000)
        .arcDashLength(0.1)
        .arcDashGap(0.1)
        //.arcDashInitialGap(() => Math.random())
        .arcDashAnimateTime(2000)
        //.arcColor(d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`])
        .arcColor('color')
        .arcsTransitionDuration(0)
        .arcStroke("stroke")


        //// Polygon
        .lineHoverPrecision(0)
        .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
        .polygonAltitude(0.01)
        .polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
        .polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .polygonsTransitionDuration(300)
        .polygonLabel(({ properties: d}) => {
            return `
              <div class="card">
                <img class="card-img" src="${flagEndpoint}/${d.ISO_A2.toLowerCase()}.png" alt="flag" />
                <div class="container">
                    <span class="card-title"><b>${d.ADMIN}</b></span> <br />
                    <div class="card-spacer"></div>
                    <hr />
                    <div class="card-spacer"></div>
                    <span><b>Total Trade:</b> ${d.total_trades_2019 === -1  ? 'No Data available' : d3.format('.4s')(d.total_trades_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2%")(d.percentage_total_2019)}</span><br />
                    <span><b>Total Export:</b> ${d.export_value_2019 === -1  ? 'No Data available' : d3.format('.4s')(d.export_value_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2%")(d.percentage_exports_2019)}</span> <br />
                    <span><b>Total Import:</b> ${d.import_value_2019 === -1  ? 'No Data available' : d3.format('.4s')(d.import_value_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } - ${d3.format(",.2%")(d.percentage_imports_2019)}</span>

                    <div class="card-spacer"></div>
                    <hr />
                    <div class="card-spacer"></div>
                    <span><b>Largest exports:</b> ${d.trade_value_exported_2019 === -1  ? 'No Data available' : d3.format('.4s')(d.trade_value_exported_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")} to ${d.highest_export_to_2019} </span><br />
                    <span><b>Largest Imports:</b> ${d.trade_value_imported_2019 === -1  ? 'No Data available' : d3.format('.4s')(d.trade_value_imported_2019).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")} from ${d.highest_import_from_2019} </span><br />

                    <!--
                    <div class="card-spacer"></div>
                    <hr />
                    <div class="card-spacer"></div>
                    <span><b>Largest Export:</b> ${d.Export_trade_value_usd  === -1 ? 'No Data available' : d.Export_commodity}</span><br />
                    <span><b>Value largest Export: </b>${d.Export_trade_value_usd  === -1 ? 'No Data available' : d3.format('.4s')(d.Export_trade_value_usd).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } </span><br /><br />             
                    <span><b>Largest Import:</b> ${d.Import_trade_value_usd  === -1  ? 'No Data available' : d.Import_commodity}</span><br />
                    <span><b>Value largest Import: </b>${d.Import_trade_value_usd  === -1  ? 'No Data available' : d3.format('.4s')(d.Import_trade_value_usd).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD") } </span>             
                    </div>
                    -->
                </div>
              </div>
            `;
        })
        .onPolygonHover(hoverD => myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01))
        .onPolygonClick(radiate_arcs)


        //// HexPolygon
        // .hexPolygonsData(countries.features)
        // .hexPolygonResolution(3)
        // .hexPolygonMargin(0.6)
        // .hexPolygonColor(() => `#${Math.round(Math.random() * Math.pow(2, 24)).toString(16).padStart(6, '0')}`)
        // .hexPolygonLabel(({ properties: d }) => `
        //   <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
        //   Population: <i>${d.GDP_MD}</i>
        // `)
        // .hexPolygonAltitude(0.011)


        // Gen random data
        const N = 20;
        const arcsData = [...Array(N).keys()].map(() => ({
        startLat: 56.6,
        startLng: -104.5,
        endLat: (Math.random() - 0.5) * 180,
        endLng: (Math.random() - 0.5) * 360,
        //color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
        color: [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`],
        stroke: 0.5
        }));

        //myGlobe.arcsData(arcsData)

        var neutral = false

        function reset({ lat: endLat, lng: endLng }) {
            myGlobe.arcsData([]);
            myGlobe.polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
            //myGlobe.polygonCapColor(feat => colorScale(getVal(feat)), OPACITY_POLYGONE)
            //myGlobe.hexPolygonsData(countries.features)
            myGlobe.labelsData([])
            myGlobe.onPolygonHover(hoverD => myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01))
        }

        function radiate_arcs(polygon, event, { lat: clicklat, lng:clicklng, altitude }){
            reset(10,10)
            //Remove changing altitude of country after a country has been selected
            myGlobe.onPolygonHover(_ => myGlobe.polygonAltitude(0.01))
            //const arc = { startLat: startlat, startLng: startlng, endLat:39.6, endLng:-98.5 };
            //myGlobe.arcsData([...myGlobe.arcsData(), arc]);
            console.log(exports[polygon.properties.ISO_A3]);
            var arcArray = exports[polygon.properties.ISO_A3];
            var allArcs = []
            for (var i = 0; i < arcArray.length; i++) {
                var newArc = {
                    startLat: arcArray[i][3],
                    startLng: arcArray[i][4],
                    endLat: arcArray[i][7],
                    endLng: arcArray[i][8],
                    //color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
                    //color: [`rgba(0, 255, 0, ${arcArray[i][9]})`, `rgba(255, 0, 0, ${arcArray[i][9]})`],
                    //color: [`rgba(0, 255, 0, 1.50)`, `rgba(255, 0, 0, 1.50)`],
                    color: "gainsboro",
                    stroke: Math.min(Math.max(arcArray[i][9] * 8, 0.5) , 2) 
                }
                allArcs =   [...allArcs, newArc]             
            }
            myGlobe.arcsData(allArcs);    
            //myGlobe.polygonCapColor(d => d === polygon ? 'steelblue' : "lightsalmon")
            myGlobe.polygonCapColor(d => PolygonColorChanger(d,polygon,arcArray))     
            //console.log(exports[polygon.properties.ISO_A3]);
            var clickLabel = ["a", "a", "a","a", "a", "a",arcArray[0][2], arcArray[0][3],arcArray[0][4] ];


            myGlobe.labelsData([...arcArray, clickLabel]);
            myGlobe.labelLat(d => d[7])
            myGlobe.labelLng(d => d[8])
            myGlobe.labelText(d => d[6])
            myGlobe.labelSize(d => 1.2)
            myGlobe.labelDotRadius(d => 0.9)
            myGlobe.labelColor(() => 'darkturquoise')                
            myGlobe.labelResolution(8)
            myGlobe.labelAltitude(0.025)

            //myGlobe.hexPolygonsData(exports[polygon.properties.ISO_A3])

        }

        function PolygonColorChanger(d,polygon,arcArray){
            var targets = arcArray.map(d => d[5]);
            if (d === polygon){
                console.log(d)
                //return "steelblue"
                return `rgba(70, 130, 180, ${OPACITY_POLYGONE})`
            }else if(targets.includes(d.properties.ISO_A3)){
                //return "lightsalmon"
                return `rgba(255, 160, 122, ${OPACITY_POLYGONE})`
            }                    
            else{
                //return "grey"
                return `rgba(128, 128, 128, ${OPACITY_POLYGONE})`
            }
        }
    })
});
