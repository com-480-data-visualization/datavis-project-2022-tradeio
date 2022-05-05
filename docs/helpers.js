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
