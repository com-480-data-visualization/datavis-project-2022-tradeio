// Slider
const slider = document.querySelector('.slider');
// Play button
const playButton = document.querySelector('.play-button');
// Slider
var output = document.getElementById("demo");
// Slider date
const sliderDate = document.querySelector('.slider-date');
playButton.disabled = false;

slider.oninput = function() {
  output.innerHTML = slider.value;
  onYearChange(slider.value);
  slider.click();
}

function yearLabel(){
  output.innerHTML = slider.value;
  onYearChange(slider.value);
}

/*const
  range = document.getElementById('years'),
  rangeV = document.getElementById('rangeV'),
  setValue = ()=>{
    const
      newValue = Number( (range.value - range.min) * 94 / (range.max - range.min) ),
      newPosition = 55 - (newValue * 0.2);
      newPositionTop = -34.5;
    rangeV.innerHTML = `<span>${range.value}</span>`;
    rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
    rangeV.style.top = `${newPositionTop}px`;
  };*/
// document.addEventListener("DOMContentLoaded", setValue);
// range.addEventListener('input', setValue);

// when play button is clicked on 
playButton.addEventListener('click', () => {
    if (playButton.innerText == 'Play') {
      if (slider.value == 2019) {
        slider.value = 1962;
      }
      playButton.innerText = 'Pause';
    } else {
      playButton.innerText = 'Play';
      clearInterval(interval);
      slider.click();
      return;
    }
  // Check if slider position is max
  if (+slider.value === 2019) {
    slider.value = 2019;
  }
  output.innerHTML = slider.value;
  slider.click();
  onYearChange(slider.value);

  interval = setInterval(() => {
    slider.value++;
    output.innerHTML = slider.value;
    slider.click();
    onYearChange(slider.value);
    // setValue();
    // rangeV.innerHTML = `<span>${range.value}</span>`;
    slider.click();
    if (+slider.value === 2019) {
      playButton.innerHTML = 'Play';
      slider.value = 2019;
      onYearChange(slider.value);
      slider.click();
      clearInterval(interval);
    }
  }, 200);
});
if ('oninput' in slider) {
    slider.addEventListener(
    'input',
    function () {
        onYearChange(slider.value);
        // setValue();
        // rangeV.innerHTML = `<span>${range.value}</span>`;
        slider.click();
    },
    false
  );
  document.getElementById('years').click();
}

output.innerHTML = slider.value;
slider.click();
onYearChange(slider.value);