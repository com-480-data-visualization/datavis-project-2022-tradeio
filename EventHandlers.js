let drag = false;
var globeContainer = document.getElementById('globeViz')

globeContainer.addEventListener(
    'mousedown', () => drag = false);
globeContainer.addEventListener(
    'mousemove', () => drag = true);
globeContainer.addEventListener(
    'mouseup', () => {
        // Check if click was made on a clickable object (polygon or arc)
        globeClick = myGlobe.controls().domElement.classList.contains('clickable');        
        return (drag || globeClick) ? '' : reset(10,10)
});


function onTradeChange(){    
    if(GlobaState){
        radiate_arcs(lastClickEvent["polygon"], lastClickEvent["event"],0,0)   
    }else{
        reset(10,10)  
    }
}


function onCounChange(selectObject){   
    console.log("countryChanged") 
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


function onReturnToCountry(){
    myGlobe.pointOfView(polygon_country, 1000)
}


function onProductChange(product){
    if (product === oldProd) 
        return

    if (oldProd !== ''){
        categoryBtnOld = document.getElementById(oldProd)
        categoryBtnOld.style.color = 'white'
    }
    
    categoryBtnNew = document.getElementById(product)
    categoryBtnNew.style.color = 'lime'

    current_trades = products_dict[product]; 
    if(GlobaState){
        radiate_arcs(lastClickEvent["polygon"], lastClickEvent["event"],0,0)   
    }else if(oldProd !== ''){
        reset(10,10)
    }
    oldProd = product
}
