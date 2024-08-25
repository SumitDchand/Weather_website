
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer= document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const videos = document.querySelector("video");

// initial requirements

///// -> this signify I have added additional creativity
const musicButton = document.getElementById('toggle-music');
let isMusicPlaying = false;
let currentMusic = null;
let currentVideo = null;
const API_key = "738456cfdffc24a47d0c03fe81de5b7f";
////

let currentTab = userTab;

currentTab.classList.add("current-tab");
getfromSessionStorage();


function switchTab(clickedTab) {

    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active") ) {
            //checking if search form is invesible if it yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // it is on your weather tab so it has to show weather display, so it will check first for coordinates
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});



//Creative Section

function activateVideo(videoId, musicId) {
    // Reset and pause the current video
    if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0; // Reset to the start
        currentVideo.classList.add('video-hidden');
    }

    // Reset and pause the current music
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0; // Reset to the start
    }

    // Load and play the new video
    const video = document.getElementById(videoId);
    if (video) {
        currentVideo = video;
        video.classList.remove('video-hidden');
        video.play();
    }

    // Load and play the new music
    const music = document.getElementById(musicId);
    if (music) {
        currentMusic = music;
        if (isMusicPlaying) {
            music.play();
        } else {
            music.pause();
        }
    }
}


 

musicButton.addEventListener('click', () => {
    if (currentMusic) {
        if (isMusicPlaying) {
            currentMusic.pause();
            musicButton.innerText = 'Play';
        } else {
            currentMusic.play();
            musicButton.innerText = 'Pause';
        }
        isMusicPlaying = !isMusicPlaying;
    }
});

function handleWeatherData(weatherInfo) {
    const temp = (weatherInfo?.main?.temp - 273.15).toFixed(2);
    const weather = weatherInfo?.weather?.[0]?.description.toLowerCase(); 
    // data.weather[0].main.toLowerCase();


    let videoId = '';
    let musicId = '';

    if (temp >= 28 && temp <= 40 && weather.includes('clear')) {
        videoId = 'sunny_video';
        musicId = 'sunny_music';
    } else if (temp >= 20 && temp < 28 && weather.includes('clouds')) {
        videoId = 'windy_video';
        musicId = 'windy_music';
    } else if (temp >= 10 && temp < 19 && (weather.includes('rain') || weather.includes('drizzle'))) {
        videoId = 'rain_video';
        musicId = 'rainy_music';
    } else if (weather.includes('haze') || weather.includes('fog') || weather.includes('mist')) {
        videoId = 'sunny_video'; // Use sunny as fallback for hazy conditions
        musicId = 'sunny_music';
    } else {
        videoId = 'windy_video'; // Use windy as fallback for other conditions
        musicId = 'windy_music';
    }

    // Update video and music sources
    // document.getElementsByClassName('background-video').src = videoId;
    // document.getElementsByClassName('background-music').src = musicId;
    activateVideo(videoId, musicId);
}

// fetchWeatherData();


//Creative Section ends here



//check if coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates is not present
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates= JSON.parse (localCoordinates);
        fetchUserWeatherInfo(coordinates);
        
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const{lat, lon} = coordinates;
    //make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

//API call

    try{
        const response = await fetch (
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`
          //`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=738456cfdffc24a47d0c03fe81de5b7f`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        

    }

    catch(error){
        console.error("Error fetching user weather info:", error);
        loadingScreen.classList.remove("active");
        notFound.classList.add("active");
        // console.log("Found an Error");
    }
}

function renderWeatherInfo(weatherInfo){
    // fetching element
    const cityName= document.querySelector("[data-cityName]");
    const countryIcon= document.querySelector("[data-countryIcon]");
    const desc= document.querySelector("[data-weatherDesc]");
    const weatherIcon= document.querySelector("[data-weatherIcon]");
    const temp= document.querySelector("[data-temp]");
    const windspeed= document.querySelector("[data-windspeed]");
    const humidity= document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it on UI elemets

   cityName.innerText = weatherInfo?.name;
   countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
   desc.innerText = weatherInfo?.weather?.[0]?.description;
   weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
   const tempInCelsius = (weatherInfo?.main?.temp - 273.15).toFixed(2);
    // by default weather app gives value in Fahrenheit so we have convert in into celsius
    // toFixed(2): Ensures the number is rounded and displayed to two decimal places.
   temp.innerText = `${tempInCelsius} °C`;
   windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
   humidity.innerText = `${weatherInfo?.main?.humidity}%`;
   cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
   handleWeatherData(weatherInfo);


}

function getLocation() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
         // Show alert for no geolocation support avialaible
         alert("Search City Name only");

    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

    const grantAccessButton = document.querySelector("[data-grantAccess]");
    grantAccessButton.addEventListener("click", getLocation);

    const searchInput = document.querySelector("[data-searchInput]");

    searchForm.addEventListener("submit" , (e) => {
        e.preventDefault();
        let cityName = searchInput.value;

        if (cityName === "")
            return;
        else
        fetchSearchWeatherInfo(cityName);
    })

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`
        );
        
        const data= await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        handleWeatherData(data);
    }
    catch(error) {
        // console.log("Catched an Error");
        // Not_Found= document.querySelector("not-found");
        // loadingScreen.classList.remove("active");
        // userInfoContainer.classList.remove("active");
        
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        const Not_Found = document.querySelector(".not-found");
        Not_Found.classList.add("active");

        Not_Found.addEventListener("click", (event) => {
                const Not_Found = document.querySelector(".not-found");
                Not_Found.classList.remove("active");

            });

        alert("No data for searched city");


    }
}
