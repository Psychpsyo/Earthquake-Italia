const layer = L.tileLayer(
	'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	{attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
);

const map = L.map(
	'map',
	{
		center: [42.6384261, 12.674297],
		zoom: 7,
		layers: [layer]
	}
);

const quakes = [];

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
function dateFormat(date) {
	return date.getFullYear() + "-" +
	       (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
		   date.getDate().toString().padStart(2, "0") + " " +
		   date.getHours().toString().padStart(2, "0") + ":" +
		   date.getMinutes().toString().padStart(2, "0") + ":" +
		   date.getSeconds().toString().padStart(2, "0");
}

class Earthquake {
	constructor(id, lat, lon, magnitude, name) {
		this.id = id;
		this.lat = lat;
		this.lon = lon;
		this.magnitude = magnitude;
		this.name = name;
		this.circle = L.circle(
			[lat, lon],
			{
				radius: 10000 * magnitude,
				color: this.color
			}
		);
		this.circle.addTo(map);
		this.listEntry = quakeListEntry.content.cloneNode(true);
		this.listEntry.querySelector("li").style.setProperty("--color", this.color);
		this.listEntry.querySelector(".quakeName").textContent = name;
		this.listEntry.querySelector(".quakeMagnitude").textContent = magnitude;
		quakeList.appendChild(this.listEntry);

		quakes.push(this);
	}

	get color() {
		return "#" + hsvToRgb(.66 - (this.magnitude / 10 * .66), 1, 1).map(v => Math.floor(v).toString(16).padStart(2, "0")).join("");
	}
}

function showQuake(quake) {
	if(quake.querySelector("type").textContent !== "earthquake") return;
	const id = quake.getAttribute("publicID").match(/(?<=eventId=)\d*/)[0];
	if (quakes.find(q => q.id === id)) return;
	const origin = quake.querySelector("origin");
	const lat = origin.querySelector("latitude").querySelector("value").textContent;
	const lon = origin.querySelector("longitude").querySelector("value").textContent;
	const magnitude = quake.querySelector("magnitude").querySelector("mag").querySelector("value").textContent;
	const name = quake.querySelector("description").querySelector("text").textContent;
	new Earthquake(id, lat, lon, magnitude, name);
}

async function fetchQuakes() {
	const response = await fetch("https://webservices.ingv.it/fdsnws/event/1/query?minlat=30&maxlat=50&minlon=3&maxlon=18");
	const text = await response.text();
	const data = new window.DOMParser().parseFromString(text, "text/xml")
	for (const quake of data.querySelectorAll("event")) {
		showQuake(quake);
	}
	const now = new Date();
	time.textContent = dateFormat(now);
	const offset = now.getTimezoneOffset() / -60;
	timezone.textContent = "UTC" + (offset > 0? "+" + offset :
	                                offset < 0? offset : "");
	setTimeout(fetchQuakes, 1000);
}

fetchQuakes();