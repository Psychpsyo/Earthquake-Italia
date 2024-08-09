import { locale } from "./locale.mjs";

const settings = [
	{
		type: "dropdown",
		id: "language",
		options: [
			"it",
			"en",
			"de",
		],
		default: "en"
	},
	{
		type: "toggle",
		id: "playQuakeSound",
		default: true
	}
];

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

for (const setting of settings) {
	const settingDiv = document.createElement("div");
	const label = document.createElement("label");
	label.textContent = locale.settings.general[setting.id];
	label.htmlFor = setting.id + "SettingInput";
	settingDiv.appendChild(label);
	switch(setting.type) {
		case "toggle": {
			const checkbox = document.createElement("input");
			checkbox.id = setting.id + "SettingInput";
			checkbox.type = "checkbox";
			checkbox.checked = getSetting(setting);
			checkbox.addEventListener("change", function() {
				localStorage.setItem(setting.id, this.checked);
			});
			settingDiv.appendChild(checkbox);
			break;
		}
		case "dropdown": {
			const select = document.createElement("select");
			select.addEventListener("change", function() {
				localStorage.setItem(setting.id, this.value);
				// should probably be handled differently but for now it's here
				if (setting.id === "language") {
					window.location.reload();
				}
			});
			select.id = setting.id + "SettingInput";
			for (const option of setting.options) {
				const optionElem = document.createElement("option");
				optionElem.value = option;
				optionElem.textContent = locale.settings.general[setting.id + "_" + option];
				let insertBeforeElem = null;
				for (const elem of select.children) {
					if (elem.textContent > optionElem.textContent) {
						insertBeforeElem = elem;
						break;
					}
				}
				if (insertBeforeElem) {
					select.insertBefore(optionElem, insertBeforeElem);
				} else {
					select.appendChild(optionElem);
				}
			}
			select.value = getSetting(setting);
			settingDiv.appendChild(select);
			break;
		}
	}
	settingsList.appendChild(settingDiv);
}