
// Slider
const slider = document.querySelector('.slider');
// Play button
const playButton = document.querySelector('.play-button');
// Slider
var output = document.getElementById("demo");
// Slider date
const sliderDate = document.querySelector('.slider-date');
// playButton.disabled = false;

// slider.oninput = function() {
//   output.innerHTML = slider.value;
//   slider.click();
// }
// onYearChange(slider.value);
output.innerHTML = slider.value;



// when play button is clicked on 
playButton.addEventListener('click', () => {
    if (playButton.innerText == 'Play') {
      playButton.innerText = 'Pause';
    } else {
      playButton.innerText = 'Play';
      clearInterval(interval);
      // slider.click();
      return;
    }
  // Check if slider position is max
  if (+slider.value === 2019) {
    slider.value = 2019;
  }
  // sliderDate.innerHTML = slider.value;
  output.innerHTML = slider.value;

  interval = setInterval(() => {
    slider.value++;
    // sliderDate.innerHTML = slider.value;
    output.innerHTML = slider.value;
    selected_year = selected_year + 1;
    onYearChange(slider.value);
    slider.click();
    // onYearChange(selected_year);
    if (+slider.value === 2019) {
      playButton.innerHTML = 'Play';
      slider.value = 2019;
      clearInterval(interval);
    }
  }, 200);
});
if ('oninput' in slider) {
    slider.addEventListener(
    'input',
    function () {
        selected_year = selected_year + 1;
        onYearChange(slider.value);
        slider.click();
    },
    false
  );
  document.getElementById('years').click();
}

output.innerHTML = slider.value;