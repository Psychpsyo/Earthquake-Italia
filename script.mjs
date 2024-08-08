// variables
const italyCenter = [41.6384261, 12.674297];
const sounds = {
	newQuake: new Audio("./audio/newQuake.wav")
};
const layer = L.tileLayer(
	"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	{attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"}
);
const map = L.map(
	"map",
	{
		zoom: 6.4,
		layers: [layer],
		zoomSnap: 0.1,
		zoomDelta: 0.1,
		center: italyCenter
	}
);
map.setActiveArea("activeArea", true);
const quakes = [];

// utility functions

// from https://gist.github.com/mjackson/5311256
function hsvToRgb(h, s, v) {
	var r, g, b;

	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}

	return [ r * 255, g * 255, b * 255 ];
}
function quakeColor(magnitude) {
	return "#" + hsvToRgb(.66 - (magnitude / 10 * .66), 1, 1).map(v => Math.floor(v).toString(16).padStart(2, "0")).join("");
}
function dateFormat(date) {
	return date.getFullYear() + "-" +
	       (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
		   date.getDate().toString().padStart(2, "0") + " " +
		   date.getHours().toString().padStart(2, "0") + ":" +
		   date.getMinutes().toString().padStart(2, "0") + ":" +
		   date.getSeconds().toString().padStart(2, "0");
}

// set up page
magnitudeGradient.style.setProperty("background", `linear-gradient(90deg,${
	[0,1,2,3,4,5,6,7,8,9,10].map(m => quakeColor(m)).join()
})`);
centerButton.addEventListener("click", function() {
	map.setView(italyCenter, 6.4, {animate: true});
});

// actually fetching earthquakes
class Earthquake {
	constructor(id, lat, lon, magnitude, name, time) {
		this.id = id;
		this.lat = lat;
		this.lon = lon;
		this.magnitude = magnitude;
		this.name = name;
		this.time = time;
		this.circle = L.circle(
			[lat, lon],
			{
				radius: 10000 * magnitude,
				color: quakeColor(this.magnitude)
			}
		);
		this.circle.addTo(map);
		this.circle.bindPopup(this.name, {autoPan: false});
		const template = quakeListEntry.content.cloneNode(true);
		this.listEntry = template.querySelector("li");
		this.listEntry.style.setProperty("--color", quakeColor(this.magnitude));
		this.listEntry.querySelector(".quakeName").textContent = name;
		this.listEntry.querySelector(".quakeTime").textContent = dateFormat(time);
		this.listEntry.querySelector(".quakeMagnitude").textContent = magnitude;
		this.listEntry.addEventListener("click", () => {
			map.setView([this.lat, this.lon], 8, {animate: true});
			this.circle.openPopup();
		});
		if (quakeList.childElementCount > 0) {
			quakeList.insertBefore(this.listEntry, quakeList.firstChild);
		} else {
			quakeList.appendChild(this.listEntry);
		}

		quakes.push(this);
	}
}

function showQuake(quake, indicateNew) {
	if(quake.querySelector("type").textContent !== "earthquake") return;
	const id = quake.getAttribute("publicID").match(/(?<=eventId=)\d*/)[0];
	if (quakes.find(q => q.id === id)) return;
	const origin = quake.querySelector("origin");
	const lat = origin.querySelector("latitude").querySelector("value").textContent;
	const lon = origin.querySelector("longitude").querySelector("value").textContent;
	const magnitude = quake.querySelector("magnitude").querySelector("mag").querySelector("value").textContent;
	const name = quake.querySelector("description").querySelector("text").textContent;
	const time = new Date(origin.querySelector("time").querySelector("value").textContent + "Z");

	const earthquake = new Earthquake(id, lat, lon, magnitude, name, time);
	if (indicateNew) {
		earthquake.listEntry.classList.add("newQuake");
		sounds.newQuake.play();
	}
}

async function fetchQuakes(indicateNew = true) {
	const response = await fetch("https://webservices.ingv.it/fdsnws/event/1/query?minlat=30&maxlat=50&minlon=3&maxlon=18");
	const text = await response.text();
	const data = new window.DOMParser().parseFromString(text, "text/xml")
	for (const quake of Array.from(data.querySelectorAll("event")).sort((a, b) => {
		const aTime = a.querySelector("origin").querySelector("time").querySelector("value");
		const bTime = b.querySelector("origin").querySelector("time").querySelector("value");
		return aTime > bTime? -1 : 1;
	})) {
		showQuake(quake, indicateNew);
	}
	const now = new Date();
	time.textContent = dateFormat(now);
	const offset = now.getTimezoneOffset() / -60;
	timezone.textContent = "UTC" + (offset > 0? "+" + offset :
	                                offset < 0? offset : "");
	setTimeout(fetchQuakes, 1000);
}

fetchQuakes(false);
