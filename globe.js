
const COUNTRY = 'United States';
//const OPACITY = 0.22;
const OPACITY = 0.99;
const OPACITY_POLYGONE = 1
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';
const base_card = document.getElementById('card_placeholder');


// GDP per capita (avoiding countries with small pop)
//const getVal = feat => feat.properties.GDP_MD / (5 * 1e6); //  / Math.max(1e5, feat.properties.POP_EST);
const getVal = feat => feat.properties.total_trades_2019 / (5*1e12); //  / Math.max(1e5, feat.properties.POP_EST);

//fetch('./dataset/classifications_data/ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries =>{
fetch('./dataset/countries.geojson').then(res => res.json()).then(countries =>{
    fetch('./dataset/geo_export.json').then(x => x.json()).then(exports =>{
        const myGlobe = Globe()
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
            console.log("here")
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
        .onPolygonClick(radiate_arcs)
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


        var neutral = false

        function reset({ lat: endLat, lng: endLng }) {
            base_card.innerHTML = ``
            myGlobe.arcsData([]);
            myGlobe.polygonCapColor(feat => convertRGBToRGBA(colorScale(getVal(feat)), OPACITY_POLYGONE))
            //myGlobe.polygonCapColor(feat => colorScale(getVal(feat)), OPACITY_POLYGONE)
            //myGlobe.hexPolygonsData(countries.features)
            myGlobe.labelsData([])
            myGlobe.onPolygonHover(hoverD => {
                myGlobe.polygonAltitude(d => d === hoverD ? 0.1 : 0.01);
                changeCountryCard(base_card, hoverD);
            })        
        }

        function radiate_arcs(polygon, event, { lat: clicklat, lng:clicklng, altitude }){
            reset(10,10)
            //After reset display the country card again
            changeCountryCard(base_card, polygon)

            //Remove changing altitude of country and card changes after a country has been selected 
            myGlobe.onPolygonHover(_ => {
                myGlobe.polygonAltitude(0.01);
                changeCountryCard(base_card, polygon);
            })
            

            //const arc = { startLat: startlat, startLng: startlng, endLat:39.6, endLng:-98.5 };
            //myGlobe.arcsData([...myGlobe.arcsData(), arc]);
            
            //Data has already been cleaned, no need to change the ADMIN property for france, norway and Kosovo
            var arcArray = exports[polygon.properties.ISO_A3];
            var allArcs = []
            for (var i = 0; i < arcArray.length; i++) {
                var newArc = {
                    startLat: arcArray[i][3],
                    startLng: arcArray[i][4],
                    endLat: arcArray[i][7],
                    endLng: arcArray[i][8],
                    //color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
                    color: `rgba(255, 0, 0 , ${Math.min(Math.max(arcArray[i][9] * 15, 0.3) , 0.8)})`,
                    original_color: `rgba(255, 0, 0 , ${Math.min(Math.max(arcArray[i][9] * 15, 0.3) , 0.8)})`,
                    //color: [`rgba(0, 255, 0, 1.50)`, `rgba(255, 0, 0, 1.50)`],
                    //color: "gainsboro",
                    stroke: Math.min(Math.max(arcArray[i][9] * 8, 0.5) , 2) ,
                    name: `${arcArray[i][1]} &#8594; ${arcArray[i][5]} : ${money_amount_fixer(arcArray[i][0])}`
                }
                console.log(arcArray[i][9] *255 * 5)
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
            var targets_A3 = arcArray.map(x => x[5]);
            var target_Name = arcArray.map(x => x[6]);
            if (d === polygon){
                console.log(d)
                //steelblue
                return `rgba(70, 130, 180, ${OPACITY_POLYGONE})`
            }else if(targets_A3.includes(d.properties.ISO_A3) || target_Name.includes(d.properties.ADMIN)){
                //lightsalmon
                return `rgba(255, 160, 122, ${OPACITY_POLYGONE})`
            }                    
            else{
                //grey
                return `rgba(128, 128, 128, ${OPACITY_POLYGONE})`
            }
        }

        function money_amount_fixer(amount){
            return d3.format('.4s')(amount).replace(/G/,"B USD").replace(/M/,"M USD").replace(/k/,"k USD")
        }
    })
});
