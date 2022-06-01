const COUNTRY = 'United States';
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';
const base_card = document.getElementById('card_placeholder');
const countryTable = document.getElementById('countriesTable');
countryTable.style.visibility='hidden';
const tableBody = document.getElementById('countriesTableBody');

const products = ['all', 'food', 'beverage', 'crude_materials', 'fuels', 'vegetable_oil', 'chemicals', 'material_manufacturers', 'machinery', 'other_manufacturers', 'unspecified']
var trgts_table = []
var products_dict = {}
let interval;
var polygon_country = {lat:0, lng:0, altitude:2};

var selected_year = "2019";
var selected_prod = "all";
const getVal = feat => feat.properties.percentage_total[selected_year] / (8)

var myGlobe;
//States: False is nothing is selected startup state, 1 a country is selected
var GlobaState = false
//Store the last click event so that we can simulate it when time/trade is changed
var lastClickEvent;
var current_trades;
var polygon_dict = {};
var country_locs;
var oldProd = '';
var globeClick = false;

fetch('./dataset/country_coords.json').then(res => res.json()).then(coords =>{country_locs = coords; });
fetch('./dataset/countries.geojson').then(res => res.json()).then(countries =>{init_globe(countries) });
load_trade_data(products);


function reset({ lat: endLat, lng: endLng }) {
    base_card.innerHTML = ''
    countryTable.style.visibility='hidden'
    myGlobe.arcsData([]);
    myGlobe.polygonCapColor(feat => color_countries_gray(colorScale(getVal(feat))))
    GlobaState = false 
    document.getElementById("coun") .value = ""    
    myGlobe.labelsData([])

    myGlobe.onPolygonHover(hoverD => {
        myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01);
    })  
}


function radiate_arcs(polygon, event, { lat: clicklat, lng:clicklng, altitude }){

    if(!Object.keys(current_trades[selected_year]).includes(polygon.properties.ISO_A2)){
        reset();
        return;
    }
    polygon_arc = polygon
    //Reset polygonLabel
    myGlobe.controls().domElement.previousElementSibling.innerHTML = ''
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
    
    var tradeType =  document.getElementById("trade").value ;   
    
    var arcArray = current_trades[selected_year][polygon.properties.ISO_A2][tradeType];
    var allArcs = []
    var startLat = 0;
    var startLngx = 0;
    var endLat = 0;
    var endLng = 0;
    countriesTable = []    

    for (var i = 0; i < arcArray.length; i++) {
        var src = country_locs[arcArray[i][1]];
        var trgt = country_locs[arcArray[i][3]];

        countriesTable.push([trgt[2], money_amount_fixer(arcArray[i][0]).replace(' USD', ''), {lat:trgt[0], lng:trgt[1], altitude:2.5}]) //Add name and value to the list of countries for the table
        
        if(tradeType == "import_value"){
            src = country_locs[arcArray[i][3]];
            trgt = country_locs[arcArray[i][1]];
        }


        startLat = src[0];
        startLng_ = src[1];
        endLat = trgt[0];
        endLng = trgt[1];

        var color = arc_color_product(selected_prod)

        var newArc = {
            startLat: startLat,
            startLng: startLng_,
            endLat: endLat,
            endLng: endLng,
            color: `rgba(${color[0]}, ${color[1]}, ${color[2]} , ${Math.min(Math.max(arcArray[i][5] * 15, 0.3) , 0.8)})`,
            original_color: `rgba(${color[0]}, ${color[1]}, ${color[2]} , ${Math.min(Math.max(arcArray[i][5] * 15, 0.3) , 0.8)})`,
            stroke: Math.min(Math.max(arcArray[i][5] * 8, 0.5) , 2) ,
            name: `${arcArray[i][1]} &#8594; ${arcArray[i][3]} : ${money_amount_fixer(arcArray[i][0])}`
        }
        allArcs =   [...allArcs, newArc]
        
    }

    polygon_country.lat = tradeType == "import_value" ? trgt[0] : src[0]
    polygon_country.lng = tradeType == "import_value" ? trgt[1] : src[1]
     
    myGlobe.pointOfView(polygon_country, 1000)

    
    changeCountryTable(countryTable, tableBody, countriesTable, tradeType)

    myGlobe.arcsData(allArcs);    
    myGlobe.polygonCapColor(d => PolygonColorChanger(d,polygon,arcArray))     

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
}       


function init_globe(countries){
    myGlobe = Globe()
    (document.getElementById('globeViz'))  
    .globeImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-night.jpg')
    .backgroundImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/night-sky.png')
    .pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 }) // aim at continental US centroid

    //// Arcs
    .arcDashLength(0.1)
    .arcDashGap(0.1)
    .arcDashAnimateTime(2000)
    .onArcHover(hoverArc => {
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
    .onArcClick(arc => {
        midCoords = geographicMiddle(arc.startLat, arc.startLng, arc.endLat, arc.endLng)
        // myGlobe.pointOfView({ lat: midCoords.lat, lng: midCoords.lon, altitude: 2.5}, 1000)
        myGlobe.pointOfView({ lat: arc.endLat, lng: arc.endLng, altitude: 2.5}, 1000)
    })
    .arcColor('color')
    .arcsTransitionDuration(0)
    .arcStroke("stroke")
    .lineHoverPrecision(0)


    //// Polygon
    .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
    .polygonAltitude(0.01)
    .polygonCapColor(feat => colorScale(getVal(feat)))
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonsTransitionDuration(300)
    .polygonLabel(d => GlobaState ? '' : countryCard(d))       
    .onPolygonHover(hoverD => {
        myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01);
    })
    .onPolygonClick(radiate_arcs)  
    
    for (const poly of myGlobe.polygonsData()) {
        polygon_dict[poly.properties.ISO_A2] = poly;
    } 
}