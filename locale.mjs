import { getSetting } from "./settings.mjs";

console.log(getSetting);

export const locale = await (await fetch(`./locales/${localStorage.getItem("language") ?? "en"}.json`)).json();