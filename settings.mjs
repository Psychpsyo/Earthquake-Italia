export function getSetting(setting) {
	const value = localStorage.getItem(setting.id);
	if (value === null) return setting.default;
	switch (setting.type) {
		case "toggle": {
			return value === "true";
		}
	}
	return value;
}

const settings = [
	{
		type: "toggle",
		id: "playQuakeSound",
		default: true
	}
];

for (const setting of settings) {
	const settingDiv = document.createElement("div");
	settingDiv.appendChild(document.createTextNode(setting.id));
	switch(setting.type) {
		case "toggle": {
			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.checked = getSetting(setting);
			checkbox.addEventListener("change", function() {
				localStorage.setItem(setting.id, this.checked);
			});
			settingDiv.appendChild(checkbox);
		}
	}
	settingsList.appendChild(settingDiv);
}