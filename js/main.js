const WEATHER_API_KEY = '';
const GOOGLE_API_KEY = '';
const WEATHER_API = 'http://api.openweathermap.org/data/2.5/weather';
const GOOGLE_API = 'https://www.google.com/maps/embed/v1/place';

const $input = document.getElementById("input-ciudad");
const $invalidAlert = document.querySelector(".invalid-feedback");
const $buscarBtn = document.getElementById("btn-buscar");
const $divWeatherResult = document.querySelector(".weather-descripcion-result");
const $imgInfo = $divWeatherResult.querySelector(".img-info");

window.addEventListener('load', () => {
  getDataFromLocalStorage();
});

$buscarBtn.addEventListener('click', () => {
  getWeatherFromApi($input.value);
});

function getDataFromLocalStorage() {
  const weatherData = JSON.parse(localStorage.getItem('weatherData'));
  const city = JSON.parse(localStorage.getItem('city'));
  
  if (weatherData && city) {
    const { main, wind, coord, weather, sys } = weatherData;
    
    fillTempBox(main, sys);
    fillHumBox(main);
    fillPressureBox(main);
    fillWindBox(wind);
    fillSearchedCity(city);
    fillWeatherDescription(weather, main, sys);

    createVideo(weather);
    createMap(coord, city);
  }
}

function saveDataToLocalStorage(weatherData, city) {
  localStorage.setItem('weatherData', JSON.stringify(weatherData));
  localStorage.setItem('city', JSON.stringify(city));
}

function getWeatherFromApi(ciudadABuscar) {
  const weatherPromise = fetch(`${WEATHER_API}?q=${ciudadABuscar}&appid=${WEATHER_API_KEY}&units=metric&lang=es`);
  weatherPromise
  .then(response => response.json())
  .then(data => {
    if (data.cod >= 200 && data.cod < 300) {
      const { main, wind, coord, weather, sys } = data;
      $invalidAlert.classList.remove("show");
      $input.classList.remove("error");
    
      fillTempBox(main, sys);
      fillHumBox(main);
      fillPressureBox(main);
      fillWindBox(wind);
      fillWeatherDescription(weather, main, sys);
      
      createVideo(weather);
      createMap(coord, ciudadABuscar);

      saveDataToLocalStorage(data, ciudadABuscar);
    } else {
      $invalidAlert.classList.add("show");
      $input.classList.add("error");
    }
  })
  .catch(error => {
    console.log('Hubo un error al procesar la llamada', error)
  });
}

function fillTempBox(main, sys) {
  const { country } = sys;
  const { feels_like, temp_min, temp_max } = country === 'US' ? convertCelsiusToFahrenheit(main) : main;
  
  const $listGroup = document.querySelector('.box-temp .list-group');
  $listGroup.classList.add("show");

  const $strongEls = document.querySelectorAll('.box-temp strong');
  $strongEls[0].innerHTML = `${feels_like}${country === 'US' ? '°F' : '°C'}`;
  $strongEls[1].innerHTML = `${temp_min}${country === 'US' ? '°F' : '°C'}`;
  $strongEls[2].innerHTML = `${temp_max}${country === 'US' ? '°F' : '°C'}`;
}

function convertCelsiusToFahrenheit(main) {
  const { feels_like, temp_min, temp_max, temp } = main;
  return {
    feels_like: Math.round(((feels_like * 9/5) + 32) * 100) / 100,
    temp_min: Math.round(((temp_min * 9/5) + 32) * 100) / 100,
    temp_max: Math.round(((temp_max * 9/5) + 32) * 100) / 100,
    temp: Math.round(((temp * 9/5) + 32) * 100) / 100,
  }
}

function fillHumBox(main) {
  const { humidity } = main;
  const $p = document.querySelector('.box-humidity .lead');
  $p.innerHTML = `${humidity}%`;
}

function fillPressureBox(main) {
  const { pressure } = main;
  const $p = document.querySelector('.box-pressure .lead');
  $p.innerHTML = `${pressure} hPa`;
}

function fillWindBox(wind) {
  const { speed } = wind;
  const $p = document.querySelector('.box-wind .lead');
  $p.innerHTML = `${speed} meter/sec`;
}

function fillSearchedCity(city) {
  $input.value = city;
}

function fillWeatherDescription(weather, main, sys) {
  const { description, icon } = weather[0];
  const { country } = sys;
  const { temp } = country === 'US' ? convertCelsiusToFahrenheit(main) : main;

  const imgTag = document.createElement("img");
  imgTag.src = `http://openweathermap.org/img/wn/${icon}@4x.png`;
  imgTag.alt = `El clima actualmente es ${description}`;

  while($imgInfo.firstChild) {
    $imgInfo.removeChild($imgInfo.firstChild);
  }

  $divWeatherResult.classList.add("show");

  $imgInfo.appendChild(imgTag);

  const $p = $divWeatherResult.querySelector("p");
  $p.innerHTML = description;

  const $span = $divWeatherResult.querySelector("span");
  $span.innerHTML = `${temp}${country === 'US' ? '°F' : '°C'}`;
}

function createVideo(weather) {
  const { main } = weather[0];

  const id = pickVideoId(main);
  
  const newYoutubeDiv = document.createElement("div");
  newYoutubeDiv.id = "youtube-player";

  const $boxYoutube = document.querySelector(".box-youtube");
  while ($boxYoutube.firstChild) {
    $boxYoutube.removeChild($boxYoutube.firstChild);
  }
  $boxYoutube.appendChild(newYoutubeDiv);

  new YT.Player('youtube-player', {
    height: '390',
    width: '100%',
    videoId: id,
    playerVars: { 'controls': 1 }
  });
}

function pickVideoId(main) {
  switch(main) {
    case 'Thunderstorm':
      return '7Vc4-FDGBxo';
    case 'Drizzle':
      return '1suYOp7Dcjs';
    case 'Rain':
      return 'kyUQOrIiPfM';
    case 'Snow':
      return '1GRYc9vG7rk';
    case 'Clear':
      return 'n0QMu5SCWa4';
    case 'Clouds':
      return 'WpnbgEyeaCA';
    default:
      return '5sEyjKMLVJs';
  }
}

function createMap(coord, city) {
  const { lon, lat } = coord;
  const citySpacesEscaped = city.trim().replace(/ /g, "+");

  const googleMapIframe = document.createElement("iframe");
  googleMapIframe.src = `${GOOGLE_API}?key=${GOOGLE_API_KEY}&q=${citySpacesEscaped}&center=${lat},${lon}&zoom=11`;
  googleMapIframe.setAttribute("frameborder", "0");
  googleMapIframe.setAttribute("allowfullscreen", "");
  googleMapIframe.classList.add("google-map");

  const $divGoogleMap = document.querySelector(".box-google-map");
  while ($divGoogleMap.firstChild) {
    $divGoogleMap.removeChild($divGoogleMap.firstChild);
  }
  $divGoogleMap.appendChild(googleMapIframe);
}