
const COUNTRY = 'United States';
//const OPACITY = 0.22;
const OPACITY = 0.99;
const OPACITY_POLYGONE = 1;
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';
const base_card = document.getElementById('card_placeholder');
const country_table = document.getElementById('table_placeholder');

var selected_year = "2019"
// GDP per capita (avoiding countries with small pop)
//const getVal = feat => feat.properties.GDP_MD / (5 * 1e6); //  / Math.max(1e5, feat.properties.POP_EST);
//const getVal = feat => feat.properties.total_trades[selected_year]  / (5*1e12) ; //  / Math.max(1e5, feat.properties.POP_EST);
const getVal = feat => feat.properties.percentage_total[selected_year] / (8)

var myGlobe;
//States: False is nothing is selected startup state, 1 a country is selected
var GlobaState = false
//Store the last click event so that we can simulate it when time/trade is changed
var lastClickEvent;
var current_trades;
var polygon_dict = {}
var country_locs;
fetch('./dataset/country_coords.json').then(res => res.json()).then(coords =>{country_locs = coords; })


//fetch('./dataset/classifications_data/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries =>{
fetch('./dataset/countries.geojson').then(res => res.json()).then(countries =>{
    fetch('./dataset/trade_data_0.json').then(x => x.json()).then(trades =>{
        current_trades = trades
        //console.log(trades);
        myGlobe = Globe()
        (document.getElementById('globeViz'))  
        .globeImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-night.jpg')
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
        .arcDashAnimateTime(2000)
        .onArcHover(hoverArc => {
            //console.log("here")
            if(hoverArc== null){
                myGlobe.arcColor(d => {
                    return d.original_color;
            });
            }else{
                myGlobe.arcColor(d => {                     
                var split_color = hoverArc.color.substring(5, hoverArc.color.length-1).split(",");
                //const op = !hoverArc ? split_color[3] : d === hoverArc ? 0.9 : split_color[3] / 4;
                const op = hoverArc == d? 1:0.15
                return `rgba(${split_color[0]}, ${split_color[1]}, ${split_color[2]}, ${op})`;
            });

            }                               
            
        })
        //.arcColor(d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`])
        .arcColor('color')
        .arcsTransitionDuration(0)
        .onGlobeClick(reset)        
        .arcStroke("stroke")
        //airport
        .lineHoverPrecision(0)


        //// Polygon
        .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
        .polygonAltitude(0.01)
        .polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
        .polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .polygonsTransitionDuration(300)        
        .onPolygonHover(hoverD => {
            myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01);
            changeCountryCard(base_card, hoverD);
        })
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
        
        
        for (const poly of myGlobe.polygonsData()) {
            polygon_dict[poly.properties.ISO_A2] = poly;
        } 
              
        
    })
});

function onTradeChange(selectObject){    
    //console.log(lastClickEvent)
    if(GlobaState){
        radiate_arcs(lastClickEvent["polygon"], lastClickEvent["event"],0,0)   
    }else{
        reset(10,10)  
    }
}

function onCounChange(selectObject){    
    const poly =   polygon_dict[selectObject.value]
    radiate_arcs(poly , 0,0,0)
    var coord = country_locs[poly.properties.ISO_A2]
    myGlobe.pointOfView({ lat: coord[0], lng: coord[1], altitude: 2 },1000)  
}

function onYearChange(year){    
    selected_year = year.toString();
    if(GlobaState){
        radiate_arcs(lastClickEvent["polygon"], lastClickEvent["event"],0,0)   
    }else{
        reset(10,10)  
    }
}


function reset({ lat: endLat, lng: endLng }) {
    base_card.innerHTML = ``
    myGlobe.arcsData([]);
    myGlobe.polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
    GlobaState = false 
    document.getElementById("coun") .value = ""    
    myGlobe.labelsData([])

    myGlobe.onPolygonHover(hoverD => {
        myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01);
        changeCountryCard(base_card, hoverD);
    })  
}

function money_amount_fixer(amount){
    return d3.format('.4s')(amount).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")
}  

function PolygonColorChanger(d,polygon,arcArray){
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

function radiate_arcs(polygon, event, { lat: clicklat, lng:clicklng, altitude }){

    reset(10,10)
    //After reset display the country card again
    changeCountryCard(base_card, polygon)
    document.getElementById("coun").value = polygon.properties.ISO_A2;    
    GlobaState = true
    lastClickEvent = {polygon: polygon, event: event}
    
    //Remove changing altitude of country and card changes after a country has been selected 
    myGlobe.polygonAltitude(0.01);
    myGlobe.onPolygonHover(_ => {
        myGlobe.polygonAltitude(0.01);
        changeCountryCard(base_card, polygon);
    })
    
    //const arc = { startLat: startlat, startLng: startlng, endLat:39.6, endLng:-98.5 };
    //myGlobe.arcsData([...myGlobe.arcsData(), arc]);
    
    //Data has already been cleaned, no need to change the ADMIN property for france, norway and Kosovo   
    var tradeType =  document.getElementById("trade").value ;   
    
    var arcArray = current_trades[selected_year][polygon.properties.ISO_A2][tradeType];
    var allArcs = []
    var startLat = 0;
    var startLngx = 0;
    var endLat = 0;
    var endLng = 0;
    for (var i = 0; i < arcArray.length; i++) {
        
        
        var src = country_locs[arcArray[i][1]];
        var trgt = country_locs[arcArray[i][3]];
        if(tradeType == "import_value"){
            src = country_locs[arcArray[i][3]];
            trgt = country_locs[arcArray[i][1]];
        }
        startLat = src[0];
        startLng_ = src[1];
        endLat = trgt[0];
        endLng = trgt[1];


        var newArc = {
            startLat: startLat,
            startLng: startLng_,
            endLat: endLat,
            endLng: endLng,
            //color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
            color: `rgba(255, 0, 0 , ${Math.min(Math.max(arcArray[i][5] * 15, 0.3) , 0.8)})`,
            original_color: `rgba(255, 0, 0 , ${Math.min(Math.max(arcArray[i][5] * 15, 0.3) , 0.8)})`,
            //color: [`rgba(0, 255, 0, 1.50)`, `rgba(255, 0, 0, 1.50)`],
            //color: "gainsboro",
            stroke: Math.min(Math.max(arcArray[i][5] * 8, 0.5) , 2) ,
            name: `${arcArray[i][1]} &#8594; ${arcArray[i][3]} : ${money_amount_fixer(arcArray[i][0])}`
        }
        //console.log(arcArray[i][9] *255 * 5)
        allArcs =   [...allArcs, newArc]             
    }
    myGlobe.arcsData(allArcs);    
    //myGlobe.polygonCapColor(d => d === polygon ? 'steelblue' : "lightsalmon")
    myGlobe.polygonCapColor(d => PolygonColorChanger(d,polygon,arcArray))     
    //console.log(exports[polygon.properties.ISO_A3]);
    var clickLabel = ["a", "a", "a", arcArray[0][1]];

    //console.log(country_locs)
    myGlobe.labelsData([...arcArray, clickLabel]);
    myGlobe.labelLat(d => country_locs[d[3]][0])
    myGlobe.labelLng(d => country_locs[d[3]][1])
    myGlobe.labelText(d => country_locs[d[3]][2])
    myGlobe.labelSize(d => 0.9)
    myGlobe.labelDotRadius(d => 0.3)
    myGlobe.labelColor(() => 'darkturquoise')                
    myGlobe.labelResolution(8)
    myGlobe.labelAltitude(0.025)

    //myGlobe.hexPolygonsData(exports[polygon.properties.ISO_A3])
}       

