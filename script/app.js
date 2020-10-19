const key = "f11f58e6d3425f2d2bdacc83a576979d";
const body = document.getElementsByTagName("body");
const html = document.getElementsByTagName("html")[0];

// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

const updateSun = (sunElement, left, bottom, now) => {
	sunElement.style.left = `${left}%`;
	sunElement.style.bottom = `${bottom}%`;

	const currentTimeStamp = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
	sunElement.setAttribute("data-time", currentTimeStamp);
}

const isNight = () => {
	html.classList.remove("is-day");
	html.classList.add("is-night");
}

const isDay = () => {
	html.classList.remove("is-night");
	html.classList.add("is-day");
}

const placeSunAndStartMoving = (totalMinutes, sunrise) => {
	const sun = document.querySelector(".js-sun"),
		minutesLeft = document.querySelector(".js-time-left");

	const now = new Date(),
		sunriseDate = new Date(sunrise * 1000);
	let minutesSunUp = (now.getHours() * 60 + now.getMinutes()) - (sunriseDate.getHours() * 60 + sunriseDate.getMinutes());
	const percentage = (100/totalMinutes) * minutesSunUp,
						sunLeft = percentage,
						sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;

	if ((minutesSunUp > totalMinutes) || (minutesSunUp < 0)){
		isNight();
	} else {
		isDay();
	}

	updateSun(sun, sunLeft, sunBottom, now);

	body[0].classList.add("is-loaded");

	minutesLeft.innerText = Math.floor(totalMinutes - minutesSunUp);

	const t = setInterval(() => {
		if (minutesSunUp > totalMinutes){
			isNight();
			clearInterval(t);
		} else if (minutesSunUp < 0){
			isNight();
		} else {
			isDay();

			const now = new Date(),
				left = (100 / totalMinutes) * minutesSunUp,
				bottom = left < 50 ? left * 2 : (100 - left) * 2;
			
			updateSun(sun, left, bottom, now);
			minutesLeft.innerText = Math.floor(totalMinutes - minutesSunUp);
			minutesSunUp++;
		}
	}, 60000);
}

const showResult = queryResponse => {
	// console.log({queryResponse});

	document.querySelector(".js-location").innerText = `${queryResponse.city.name}, ${queryResponse.city.country}`

	document.querySelector(".js-sunrise").innerText = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
	document.querySelector(".js-sunset").innerText = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);

	const timeDifference = (queryResponse.city.sunset - queryResponse.city.sunrise) / 60;
	placeSunAndStartMoving(timeDifference, queryResponse.city.sunrise);
}

const getAPI = async (lat, lon) => {
	const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=nl&cnt=1`;

	const data = await fetch(url)
					.then((r) => r.json())
					.catch((err) => console.error(`An error occured: ${err}`));

	showResult(data);
}

document.addEventListener("DOMContentLoaded", function(){
	getAPI(50.8027841, 3.2097454);
});