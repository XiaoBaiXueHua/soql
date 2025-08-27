// ==UserScript==
// @name	ao3 sticky filters
// @namespace	https://sincerelyandyourstruly.neocities.org
// @author	白雪花
// @description	rewriting thE saved filters script from https://greasyfork.org/en/scripts/3578-ao3-saved-filters, as well as adding in features made possible by flamebyrd's tag id bookmarklet (https://random.fangirling.net/scripts/ao3_tag_id)
// @match	http*://archiveofourown.org/tags/*/works*
// @match	http*://archiveofourown.org/works?work_search*
// @match	http*://archiveofourown.org/works?commit=*&tag_id=*
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/filterscript.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/filterscript.js
// @version 2.3
// @history 2.3 - optimized how the filter optimizer works + fixed the monthly storage cleanup thing + also just began preparing to optimize shit in general
// @history 2.2.2 - script can now self-correct when it stores a filter id's name wrong (like in a botched import)
// @history 2.2.1 - fixed a bug abt the tag ui not showing up on global tag types
// @history 2.2 - added ability to optimize filters to ui. idiot-proofed the ui a bit more (it's me i'm idiots)
// @history 2.1 - added ability to import/export saved filters
// @grant	none
// @run-at	document-end
// ==/UserScript==

if (!window.soql) {
	window.soql = {
		autofilters: {
			enabled: true
		}
	}
} else {
	window.soql[`autofilters`] = {
		enabled: true
	};
}
window.soql[`toCss`] = function (str) { return str.replaceAll(/\W+/g, "-"); }
// window.soql.autofilters.

// fuck it, making this a class so we can always get this shit fresh
window.soql.autofilters[`relevant`] = class { // let's see if we can attach a class to it
	static get fandoms() {
		return JSON.parse(localStorage[listKey]); // we'll see if we can replace this w/the window obj version later
	}

	static get all() {
		// const lesigh = new Object(localStorage);
		return Object.entries(localStorage).filter((entry) => { return (entry[0].search(/^(filter|enable|ids)/) >= 0) }); // only returns the local storage entries relevant to this script, like the filters, enables, and ids
	}
	static get keys() {
		return Object.keys(localStorage).filter((entry) => entry.search(/^(filter|enable|ids)/) >= 0); // just the keys
	}
	static get values() {
		return Object.values(localStorage).filter((entry) => entry.search(/^(filter|enable|ids)/) >= 0); // just the values
	}

	static get finable() {
		return rel.all.filter((entry) => (entry[0].search(/^ids/) < 0)); // returned as entries
	}
	static get finableKeys() {
		return rel.keys.filter((entry) => entry.search(/^ids/) < 0);
	}
	static get finableValues() {
		return rel.values.filter((entry) => entry.search(/^ids/) < 0);
	}

	static get filters() {
		return rel.finable.filter((entry) => entry[0].search(/filter/) >= 0);
	}

	static get ids() {
		return rel.all.filter((entry) => (entry[0].search(/^ids/) >= 0)); // returned as entries
	}
	static get idKeys() {
		return rel.keys.filter((entry) => entry.search(/^ids/) >= 0);
	}
	static get idValues() {
		return rel.values.filter((entry) => entry.search(/^ids/) >= 0);
	}

	static push(key, val, addition) {
		console.log(`key: ${key}, val: `, val, ` addition: `, addition);
		try {
			const tmp = val;
			(tmp.length < 1) ? tmp[0] = addition : tmp.push(addition);

			localStorage.setItem(key, JSON.stringify(tmp)); // save the new ver to local storage
			console.log(`localStorage after pushing: `, localStorage[key]);
			// console.log(window.soql.autofilters.idKeyVals.global)
		} catch (e) {
			console.error(`you're only supposed to use the static rel.push to get around the way the getters work on the local storage :/`, e);
		}
	}
}

const rel = window.soql.autofilters.relevant; // this is just shorthanding for the purposes of in this script

/* various important global vars */
window.soql.remAmbig = /(?<=\s)\((\w+(\s|&)*?|\d+\s?)+\)/g; //removes disambiguators

const header = document.querySelector("h2:has(a.tag)");
//console.log(header);
const currentTag = header.querySelector("a.tag"); //the current tag being searched
const tagName = currentTag.innerText.replace(window.soql.remAmbig, "").trim();

const errorFlash = document.querySelector("div.flash.error");
const noResults = function () {
	return header.innerHTML.match(/\n0\s/) ? true : false;
}(); //will allow for the fandom box to be made
//here's the local storage array

/* keeping the fandoms w/saved filters in an array: */
var listKey = "saved fandoms";
if (!localStorage[listKey]) { localStorage.setItem(listKey, JSON.stringify(new Array())); } // set it to a new array if it doesn't exist
window.soql.autofilters.fandoms = function () { return JSON.parse(localStorage[listKey]); } // save this to the window thing

// monthly cleanup stuff
let today = dateFloor(), lastCleanup = dateFloor(); // default is today
try {
	// lastCleanup = JSON.parse(localStorage[`lastCleanup`]);
	lastCleanup = localStorage[`lastCleanup`];
} catch (e) {
	// localStorage.setItem(`lastCleanup`, JSON.stringify(lastCleanup));
	localStorage.setItem(`lastCleanup`, lastCleanup);
}
// const todayDate = new Date(today); // there should only ever 
console.log(`today's date: ${today}\nlast cleanup date: ${lastCleanup}`);

function dateFloor(date = new Date()) { // function for getting the floor value of the date as a string
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
// function for cleaning up storage: done automatically each month on the 1st and probably whenever you hit "optimize filters"
function storageCleanup() {
	// console.log(`saved fandoms: `, JSON.parse(localStorage[listKey]));
	console.log(`cleaning...`);
	var localFilters = 0, localEnables = 0; // local storage entry for the saved filters n whether that fandom's been enabled/disabled

	const filteredFandoms = new Array();
	const orphans = rel.all; // bind this
	console.log(`rel.all: `, orphans);

	function allowable(str) {
		var i = 0, allowed = false;
		const r = rel.fandoms;
		// then we loop through all the currently included fandoms to see if this enable is Safe
		while (!allowed && i < r.length) {
			// ...also protect the enable global lol
			// if (key == `enable-${toCss(rel.fandoms[i])}` || key == `enable-global`) {
			let reg = new RegExp(`(${r[i]}|${toCss(r[i])}|global)`); // regex which checks if the thing is allowed in either its standard or css form
			if (str.search(reg) > 0) {
				allowed = true;
				break;
			}
			i++;
		}
		return allowed;
	}

	for (const [key, value] of rel.all) {
		const srch = key.match(/^(filter|enable)/);
		// if (key.search(/^(filter|enable)-/) >= 0) {
		const globalvance = !(key.search(/-(global|advanced-search)$/) < 0);
		// console.log(`key: ${key}; value:\n${value}`)

		if (srch && !globalvance) { // also make sure you're not doing this to the global/advanced searches. just leave those alone
			// console.log(`key: ${key}; value:\n${value}`)
			if (srch[0] == "filter" && key !== `filter-advanced-search`) { // simply Do Not Do This on the advanced search
				const f = key.replace(/^filter-/, "");
				if (value !== "") { // if that filter Has Values, then we keep its fandom name. and also we have to keep the global
					localFilters++;
					filteredFandoms.push(f);
				} else { // otherwise remove those entries
					console.log(`uhhh empty value for a filter (${key})`)
					// localEnables++;
					localStorage.removeItem(key);
					localStorage.removeItem(`enable-${toCss(f)}`);
				}
			} else {
				localEnables++;
			}

		}
	}

	localStorage.setItem(listKey, JSON.stringify(filteredFandoms)); // lalala save this

	if (localFilters !== localEnables) {
		// then we have to run it through again to clean up orphaned enables lol
		// the only reason there Would be orphans is bc the script
		console.log(`ah. ${localFilters} filters & ${localEnables} enables. orphaned enables must die now.`)
		for (const key of rel.finableKeys) {
			console.log(`key: ${key}`);
			// console.info(`key: ${key}`, rel.finable);
			if (key.search(/^enable-/) >= 0) {
				var safeEnable = allowable(key);

				if (!safeEnable) {
					// if the enable item is not found in the list of saved fandoms, it is purged
					localStorage.removeItem(key);
				}
			}
		}
	}

	// now clean up the ids
	for (const [key, value] of rel.ids) {
		// console.debug(`key: ${key}\nvalue: ${value}`);
		if (value == "") { // i genuinely have no idea how a blank id array could have happened, but since it's smth i'm encountering during debugging, i guess we're working with it now
			localStorage.removeItem(key);
		} else {
			const e = JSON.parse(value);
			// console.debug(`${key} allowed? `, allowable(key));
			if (!allowable(key)) {
				// console.log(e, e.length);
				// if it's not allowed (not in the saved fandoms --> had no saved filters last time cleaning was run)
				if (e.length == 1) {
					console.debug(`sole e entry: `, e[0]);
					if (e[0].length < 1) {
						// this line will have to exist forever now to atone for my sins of "bugged out the saving id keys" for so long
						console.debug(`for some reason this entry is empty.`);
						localStorage.removeItem(key);
					} else if (key.search(toCss(e[0][0])) >= 0) {
						console.debug(`the Sole entry is just the fandom's id number`);
						localStorage.removeItem(key); // tbh just get rid of it at that point
					}
				}
			} else {
				autosave(key, JSON.stringify(e.sort((a, b) => {
					return parseInt(a[1]) - parseInt(b[1]);
				}))); // sorts the existing ones by ascending id #
			}
		}


	}
	console.log(`localStorage before cleanup: `, orphans, `\nlocalStorage after cleanup: `, rel.all);

	localStorage.setItem(`lastCleanup`, today); // sets it like this so that it's nice and Clean
	// console.log(`last cleaned: `, localStorage[`lastCleanup`]);
}

// storageCleanup();

if (((new Date(today)).getDate() == 1) && (today !== lastCleanup)) { // basically try to only do it once on the day of
	// if ((new Date(today)).getDate() == 1) { // basically try to only do it once on the day of
	console.log(`ahhh yes... monthly cleanup time`);
	storageCleanup();
}

/* removes local storage on blank tags  */
const search_submit = window.location.search;
const currentPath = window.location.pathname.toString();
const shouldClear = currentPath.match(/tags/);
if (shouldClear && !search_submit) {
	localStorage.setItem("filter-advanced-search", "");
}

/* current fandom checker */
const works = document.querySelector("#main.works-index");
const form = document.querySelector("form#work-filters");

// function for sniping the fandom name name of a tag from a page
window.soql.autofilters[`getFandom`] = function (el = document, t = `[tagName]`) {
	var fandom_cutoff = 70;
	var raws = el.querySelectorAll("#include_fandom_tags label"); //gets the fandom count from the dropdown on the side
	if (!raws[0]) { return null; };
	var raw = raws[0].innerText;
	var fandom = raw.replace(window.soql.remAmbig, "").trim();
	//later, maybe have it look at the other top fandoms n see if they're related, either by like an author name, or if there's an "all media types" attached to redeclare the cutoff

	var fandomCount = raw.match(/\(\d+\)/).toString();
	fandomCount = fandomCount.substring(1, fandomCount.length - 1); //chops off parentheses
	fandomCount = parseInt(fandomCount);

	var tagCount = el.querySelector(`h2:has(a.tag)`).innerText;
	tagCount = tagCount.match(/(\d+,?\d*)+(?=\sW)/)[0].replace(",", ""); // get the number, remove the comma
	// tagCount = tagCount.substring(0, tagCount.length - 2); //cut off the " W" bit that was used to make sure was Finding the actual fandom count (in case there's a fandom w/numbers in its name)
	tagCount = parseInt(tagCount); //now turn it into an integer
	console.log(`there are ${tagCount.toLocaleString()} works in the ${t} tag.`);
	if (tagCount < 10) {
		// if there are fewer than 10 works in a tag, then we should Probably have a bit more careful thought going on
		console.log(`there are ${raws.length} fandoms listed for this minor tag o.o`);
		const ms = raw.match(window.soql.remAmbig);
		var lowPercent = (parseInt(ms[ms.length - 1].replaceAll(/(\(|,|\))/g, "")) / tagCount) * 100; // uhhh takes the number in parentheses off the fandoms drop-down list, parses it as an integer, n divides it by number of fics in the tag
		if (lowPercent >= fandom_cutoff) {
			console.log(`${lowPercent}% of fics in ${t} tag belong in the ${fandom} tag.`)
		} else {
			console.log(`not enough fics to make a determination.`);
			return;
		}

	}
	if (!fandom || !fandomCount || !tagCount) { return; } // you know maybe in the rewrite, maybe instead of having it return nothing/null for these things, have it return "global" instead. might do something good.
	var meetsCutoff = (fandomCount / tagCount * 100 >= fandom_cutoff);
	// console.log(`% of fics in ${t} belonging to ${fandom}: ${fandomCount / tagCount * 100}`)
	if (meetsCutoff && rel.fandoms.indexOf(fandom) < 0) { //if it qualifies as being part of a fandom & is not yet in the array, add it and then save it to local storage
		const tmp = rel.fandoms; // have to do it this way, since the static thing automatically always fetches it from the localStorage ehe
		tmp.push(fandom);
		autosave(listKey, JSON.stringify(tmp));
	}
	return meetsCutoff ? fandom : null;
}

const fandomName = window.soql.autofilters.getFandom(document, tagName);
console.info(`fandomName: ${fandomName}`);
window.soql.autofilters[`fandomName`] = fandomName; // bind this
window.soql.autofilters[`cssName`] = window.soql.autofilters.fandomName ? window.soql.toCss(fandomName) : null;
console.log(rel.fandoms);
/* function to make css-friendly versions of a name */
function toCss(str) {
	return str.replaceAll(/\W+/g, "-");
}
const cssFanName = fandomName ? toCss(fandomName) : null;

// attach the idKeyVals class
window.soql.autofilters[`idKeyVals`] = class {
	static get global() {
		// returns a json
		let jason = [ // default freebies
			["Not Rated", 9], ["General Audiences", 10], ["Teen And Up", 11], ["Mature", 12], ["Explicit", 13], // ratings
			["Author Chose Not to Use Archive Warnings", 14], ["No Archive Warnings Apply", 16], ["Graphic Depictions of Violence", 17], ["Major Character Death", 18], ["Rape/Non-Con", 19], ["Underage Sex", 20], // warnings
			["General", 21], ["F/M", 22], ["M/M", 23], ["Other", 24], ["F/F", 116], ["Multi", 2246], // categories
			["Chatting & Messaging", 106225] // general nuisances
		];
		try {
			jason = JSON.parse(localStorage.getItem(`ids-global`));
		} catch (e) {
			console.warn(`error in getting global ids: `, e);
			localStorage.setItem(`ids-global`, JSON.stringify(jason));
		}
		return jason;
	}

	static specific(fanName) {
		let jason = [[]];
		if (fanName) { // basically if it's not null
			try {
				jason = JSON.parse(localStorage.getItem(`ids-${window.soql.toCss(fanName)}`));
			} catch (e) {
				localStorage.setItem(`ids-${window.soql.toCss(fanName)}`, JSON.stringify(jason)); // make a new thing for legitimate new fandoms not in our storage
			}
		} else if (fanName == null) {
			// just proceed to assume it's global at that point
			return window.soql.autofilters.idKeyVals.global;
		}
		// return cssFanName ? JSON.parse(localStorage[`ids-${cssFanName}`]) : [[]];
		return jason; // i really don't know why i didn't just do this
	}

	static get fandom() { // defaults to the current fandom tag you're in
		return window.soql.autofilters.idKeyVals.specific(window.soql.autofilters.fandomName);
	}

	static includes(idNumber) {
		const opts = window.soql.autofilters.idKeyVals.global.concat(window.soql.autofilters.idKeyVals.fandom).filter(
			(entry) => {
				if (!entry) { return false; } // in case there's holes i guess
				// console.log(`entry being filtered: `, entry);
				return (entry[1] == parseInt(idNumber));
			}
		); // look in both the global and the current fandom
		if (opts.length > 0) { console.info(`found id #${idNumber} as "${opts[0][0]}".`) }
		return (opts.length > 0) ? opts[0] : false;
	}
	static replace([filterName, idNumber]) {
		const whichever = window.soql.autofilters.fandomName ? window.soql.autofilters.idKeyVals.fandom : window.soql.autofilters.idKeyVals.global;
		const rem = whichever.filter((entry) => (entry[1] !== idNumber)); // produces an array with everything still intact Except for the id number in question
		rem.push([filterName, idNumber]);
		autosave(`ids-${window.soql.autofilters.fandomName ? cssFanName : "global"}`, JSON.stringify(rem)); // and then also save it
	}

	static push(n, i, fn) { //by default, do this w/the current tag's name, id, and fandom. the import process will need to loop through this later, hence the params
		var add = [n, i];
		const incl = window.soql.autofilters.idKeyVals.includes(i);

		if (incl) {
			if ((incl[0] !== n)) {
				window.soql.autofilters.idKeyVals.replace(add); // replace it with its proper name if it doesn't match AND if we've specified it should be renamed
			}
		} else {
			console.log(`hmm. we don't have ${JSON.stringify(add)} in here.`);
			const tmp = fn ? window.soql.autofilters.idKeyVals.specific(fn) : window.soql.autofilters.idKeyVals.global; // pick which json we're pushing to
			rel.push(`ids-${fn ? window.soql.toCss(fn) : "global"}`, tmp, add);
		}
	}
}

function emptyStorage(key) { //function to give you that particular localStorage (n set it to nothing if dne)
	if (!localStorage[key]) {
		localStorage.setItem(key, "");
	}
	return localStorage[key];
}

function searchType(str) {
	return (str == "global" || str == "advanced-search") ? str : "fandom"; // function for flattening fandom names down to just "fandom". will probably be more useful when doing a proper rewrite tbh
}

/* local storage keys */
function enable(key) {
	if (key == "advanced-search") { return null; }
	let enabled = true;
	try {
		enabled = JSON.parse(localStorage[`enable-${key}`]);
	} catch (e) {
		console.warn(`[${key}] has no set filters yet`);
		//if it's not "null" (aka no fandom), then default is true
		if (key) {
			localStorage.setItem(`enable-${key}`, true);
		}
	}
	return enabled;
}
function filterTypes(name) {
	var is = name == "fandom" ? true : false;
	if (is && !fandomName) { return null; } //exit from trying to make a fandom box in a global tag
	var key = `filter-${is ? fandomName : name}`;
	if (!localStorage[key]) { localStorage.setItem(key, "") }; //if there doesn't already exist a filter for this fandom, set it now
	var filter = localStorage[key];
	var en = enable(is ? cssFanName : name);
	var obj = [name, key, filter, en];
	return obj;
}
var global = filterTypes("global");
var fan = filterTypes("fandom");
var tempp = filterTypes("advanced-search");

/* declaring functions */
function autosave(key, value) {
	localStorage.setItem(key, value);
};
window.soql.autofilters[`autosave`] = autosave; // i wonder if we can do it this way

function checkbox(name, bool, prefix) {
	prefix = prefix ? prefix : "enable"; //if not specified, then the prefix will be "enable";
	const cbox = document.createElement("input");
	cbox.setAttribute("type", "checkbox");
	cbox.id = `${prefix}-${name}`;
	cbox.checked = bool;
	const l = document.createElement("label");
	l.setAttribute("for", `${prefix}-${name}`);
	l.innerHTML = prefix;
	const span = document.createElement("span");
	span.append(cbox, l);
	span.addEventListener("click", function () {
		bool = cbox.checked; //bool should be stored in a var, like g_enable or smth, so now we're updating it to the latest checked status
		autosave(`${prefix}-${name}`, bool);
	});
	return span;
};
//function to transform an array. not sure why i had the return at the end since i obviously never set any vars to it
function box(obj) {
	if (!obj) { return null; }; //exit if no fandom
	var is = (obj[0] == "fandom"); //thing for checking if this box is a fandom type or not
	var name = obj[0];
	const box = document.createElement("textarea");
	box.id = `${name}Filters`;
	box.value = obj[2] ? obj[2] : "";
	box.addEventListener("keyup", async () => {
		obj[2] = box.value;
		await autosave(obj[1], obj[2]);
	});
	const label = document.createElement("label");
	label.className = "filter-box-label";
	var htm = name;
	htm += is ? ` <small>(${fandomName})</small>` : "";
	label.innerHTML = `${htm}:`;
	label.setAttribute("for", `${name}Filters`);
	const chk = checkbox(is ? cssFanName : name, obj[3]);
	const els = [label, box, chk];
	obj.push(els);
	return obj;
};

box(global);
const globEl = global[4];

/* now for the tag id fetcher */

/* the function to add the tag ids n stuff */
//gotta make these first for tagUI
const navList = document.querySelector("#main ul.user.navigation");
const filtButt = document.createElement("li");
filtButt.id = "get_id_butt";
filtButt.innerHTML = `<a id="id_butt">Tag ID</a>`;

/* id fetcher function, by flamebyrd */
window.soql.autofilters[`getID`] = function (el = document) {
	let i = null;
	if (el.querySelector("#favorite_tag_tag_id")) {
		console.log("favorite tag id method")
		i = el.querySelector("#favorite_tag_tag_id").value;
	} else if (el.querySelector("a.rss")) {
		console.log("rss feed method");
		var href = el.querySelector("a.rss");
		href = href.getAttribute("href");
		href = href.match(/\d+/);
		i = href;
	} else if (el.querySelector("#include_freeform_tags input:first-of-type")) {
		console.log("first freeform tag method");
		i = el.querySelector("#include_freeform_tags input:first-of-type").value;
	} else if (el.querySelector("#subscription_subscribable_id")) {
		console.log("subscribable id method");
		i = el.querySelector("#subscription_subscribable_id").value;
	};
	// console.log(`we have here a ${typeof(i)} for our id#`);
	if (typeof (i) !== "number") {
		try {
			i = parseInt(i); // try turning it into a number
		} catch (e) {
			console.warn(`wah smth weird happened to our id#`);
		}
	}
	return i;
}
const id = window.soql.autofilters.getID();
var filter_ids = `filter_ids:${id}`;

// const idKey = window.soql.autofilters.idKeyVals.push(tagName, id);
/* now to deal w/the currently-existing form */
const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete");
const advSearch = document.querySelector("#work_search_query");

//if there's one there will obvs be the other, but just so that they don't feel left out, using "or"
if (searchdt !== null || searchdd !== null) { 
	window.soql.autofilters.idKeyVals.push(tagName, id, fandomName); //first, just save the tag id in local storage. save me the time
	advSearch.hidden = true;
	const fakeSearch = document.createElement("input");
	fakeSearch.id = "fakeSearch";
	fakeSearch.setAttribute("autocomplete", "off");
	fakeSearch.value = tempp[2] ? tempp[2] : "";
	fakeSearch.addEventListener("keyup", async () => {
		tempp[2] = fakeSearch.value; //have to do this bc unlike the other boxes, it didn't go through a function for its autosaving thing
		await autosave(tempp[1], tempp[2]);
	});
	searchdd.appendChild(fakeSearch);

	const details = document.createElement("details");
	details.id = "stickyFilters";
	const summary = document.createElement("summary");
	summary.innerHTML = "Saved Filters";
	const saveDiv = document.createElement("div");
	/* make the global box */
	for (const el of globEl) {
		saveDiv.appendChild(el);
	};
	const fanEl = box(fan) ? fan[4] : null;
	if (fanEl) {
		for (const el of fanEl) {
			saveDiv.appendChild(el);
		};
	}
	/* when a search returns nothing */
	else if (noResults) {
		var html = `Your search returned no results. Would you like to review your filters?`;
		debuggy(html);
	};
	details.append(summary, saveDiv);
	searchdt.insertAdjacentElement("beforebegin", details);
} else if (errorFlash) {
	var html = "Double-check your filters for mistakes.";
	debuggy(html);
} else {
	console.error("lol idk you dun goof'd i guess")
}

/* the debugger textboxes */
function debuggy(t = "", par = header) {
	if (form) { form.hidden = true; } //hide the search form on the 0 results page
	const debugDiv = document.createElement("div");
	debugDiv.id = "error_debug";
	const p = document.createElement("p");
	p.innerHTML = t;
	var href = `${currentTag.href}/works`;
	const reSearch = document.createElement("ul");
	reSearch.className = "actions";
	reSearch.id = "debugged-search";
	if (noResults && !errorFlash) {
		const showFilters = document.createElement("a");
		showFilters.innerHTML = "Show All Filters";
		showFilters.href = "#";
		showFilters.addEventListener("click", function () {
			showAllFilters(debugDiv);
			showFilters.remove(); //remove self after showing all the filters
		})
		reSearch.appendChild(showFilters);
	} else if (errorFlash) {
		showAllFilters(debugDiv); //will automatically do the debug div on the error flash page
	}
	const research = document.createElement("a");
	research.href = href;
	research.innerHTML = "Search Again";
	reSearch.appendChild(research);
	par.insertAdjacentElement("afterend", debugDiv);
	debugDiv.insertAdjacentElement("afterend", reSearch);
	header.insertAdjacentElement("afterend", p);
}

/* function for showing all the filters */
function showAllFilters(parent) {
	for (const [key, value] of rel.finable) {
		if (key.toString().startsWith("filter-") && value) {
			const cssId = toCss(key);
			const div = document.createElement("div");
			div.id = `${cssId}-div`;
			const label = document.createElement("label");
			label.innerHTML = key.replace(/(filter|-)/g, " ").trim();
			label.setAttribute("for", cssId);
			const textarea = document.createElement("textarea");
			textarea.id = cssId;
			textarea.value = value;
			textarea.addEventListener("keyup", async () => {
				await autosave(key, textarea.value);
			});
			div.append(label, textarea);
			parent.prepend(div);
		}
	}
}

const fandomEl = fandomName ? fan[4] : null;


//the id filter selector should be made into a class tbh, but since idk how to execute that correctly rn, it'll just be global vars
const select = document.createElement("select");
select.className = "filterSelector"; //should make it a class since it'll probably be used again when working on banishment
function currentSel() {
	return select.value;
}
function selectorType() {
	return (currentSel() == "global") ? "global" : "fandom";
};

/* display the filter_ids and actions */
function tagUI() {
	const frm = document.querySelector(`#filter_opt`)
	if (!frm) {
		const filterOpt = document.createElement("fieldset");
		filterOpt.id = "filter_opt";

		/* heading & current tag info */
		const h4 = document.createElement("h4");
		h4.id = "filter-heading";
		h4.innerHTML = "Autofilter Options";

		const p = document.createElement("p");
		p.innerHTML = `<strong>Current tag</strong>: ${tagName}`;
		let txtarea = document.querySelector(`textarea#${selectorType()}Filters`);
		try {
			if (txtarea.value.match(id)) {
				p.innerHTML += ` <small>(already included in the ${selectorType()} filters.)</small>`
			}
		} catch (e) {
			console.info(`not in a fandom tag, probably`, e);
		}

		/* display ID # & choose where to append the tag */
		const fil = document.createElement("div");
		const id_exp = document.createElement("ul"); //make the div w/the id output and the buttons for importing/exporting opts
		id_exp.className = "actions";
		const output = document.createElement("input");
		output.id = "id_output";
		output.value = id;
		const label = document.createElement("label");
		label.innerHTML = "filter_ids:";
		label.setAttribute("for", "id_output");
		label.appendChild(output);
		// p.appendChild(label);

		/* import/export buttons */
		const impDiv = document.createElement("div"); //div for the import process
		const impButt = document.createElement("li");
		impButt.innerHTML = `<a>Import Filters</a>`;
		impButt.addEventListener("click", () => {
			impsy(impDiv);
		})
		const expButt = document.createElement("li");
		expButt.innerHTML = `<a>Export Filters</a>`;
		expButt.addEventListener("click", () => {
			expy(rel.all);
		});

		const optimizeButt = document.createElement("li");
		optimizeButt.innerHTML = `<a>Optimize Filters</a>`;
		optimizeButt.addEventListener("click", optimizeFilters);

		const nowEditP = document.createElement("p"); // makes a paragraph to clarify what the selection does (changes which filter this tag is being edited to);
		nowEditP.innerHTML = `Currently editing filter: `;
		nowEditP.append(select);
		/* selection dropdown */
		const globalOpt = `<option value="global">Global</option>`;
		if (!fandomName) { //if in a global tag, give the option to pick a fandom for this particular tag
			select.innerHTML = globalOpt;
			for (var fandom of rel.fandoms) {
				const option = document.createElement("option");
				option.innerHTML = fandom;
				option.setAttribute("value", fandom);
				select.appendChild(option);
			}
		} else {
			const option = document.createElement("option");
			option.innerHTML = fandomName;
			option.setAttribute("value", fandomName);
			select.appendChild(option);
			select.innerHTML += globalOpt;
		}

		/* exclude, include, or remove a tag */
		const buttonAct = document.createElement("div");
		buttonAct.id = "tag_actions";
		const appp = document.createElement("div");
		appp.id = "append-p";

		const ex = {
			pre: `-${filter_ids}`,
			ing: "exclud",
		}
		const inc = {
			pre: filter_ids,
			ing: "includ",
		}
		const rem = {
			pre: "",
			ing: "Remov"
		}

		//function for adding the filter to the search values + saved local storage
		function addFilt(obj) {
			var filtArr = [selectorType(), `filter-${currentSel()}`, localStorage[`filter-${currentSel()}`], select.selectedIndex];
			var textarea = document.getElementById(`${filtArr[0]}Filters`);
			var curr = select.options[filtArr[3]].text;
			var filt = ` ${filtArr[2]} `; //need the spaces in order to correctly match the values later lol. it'll be trimmed in the end
			var type = obj.ing;
			var old_ids = new RegExp(` -?${filter_ids} `);
			var newFilt = ` ${obj.pre} `;
			const p = document.createElement("p");
			p.className = "appended-tag";

			//if this tag is already being filtered in some way...
			if (filt.match(old_ids)) {
				//...first check if it's being filtered in the Same Way (in or out)
				if (filt.match(newFilt)) {
					p.innerHTML = `You are already ${obj.ing}ing <strong>${tagName}</strong> from <em>${curr}</em>!`
				} else {
					filt = filt.replace(old_ids, newFilt); //i forgot. to put in the "filt =". i feel like an idiot
					/* removal */
					if (type == "Remov") {
						p.innerHTML = `${obj.ing}ed <strong>${tagName}</strong> from <em>${curr}</em>.`
					} else {
						p.innerHTML = `Changed <strong>${tagName}</strong> to ${obj.ing}e in <em>${curr}</em>.`;
					}
				}
			} else if (type == "Remov") { //if you're supposed to be removing smth that isn't there, tell them
				p.innerHTML = `<strong>${tagName}</strong> isn't in your <em>${curr}</em> filters!`;
			} else {
				filt += newFilt;
				p.innerHTML = `Now ${obj.ing}ing <strong>${tagName}</strong> in <em>${curr}</em>.`;
			}
			filt = filt.replace(/\s{2,}/g, " ").trim(); //remove extra whitespaces
			if (textarea) {
				textarea.value = filt;
			}
			filtArr[2] = filt;
			appp.prepend(p);
			autosave(filtArr[1], filtArr[2]); //set the key to the filter value
		}
		function tagButtons(obj) {
			const div = document.createElement("div");
			const button = document.createElement("button");
			button.innerHTML = `${obj.ing}e Tag`;
			div.appendChild(button);
			buttonAct.appendChild(div);
			button.addEventListener("click", function () {
				addFilt(obj);
			})
		};
		var ugh = [ex, inc, rem]; //i am lazy and so shall array the various action buttons so that i can loop them instead of doing fucking. tagButtons(thing) every fucking time
		for (const a of ugh) {
			tagButtons(a);
		}
		id_exp.append(impButt, expButt, optimizeButt, impDiv);
		// fil.append(id_exp, select);
		fil.append(label, id_exp, nowEditP);
		filterOpt.append(h4, p, fil, buttonAct, appp);
		navList.parentElement.insertAdjacentElement("afterend", filterOpt);
	} else {
		frm.hidden = !(frm.hidden); // toggle that shit
	}
}
//only add the tag id fetcher button if there's a form
if (form) {
	navList.insertAdjacentElement("afterbegin", filtButt);
	filtButt.addEventListener("mouseup", tagUI);
}

/* add filters + temp search to search w/in results box */
function submission() {
	var globeSub = document.querySelector("#enable-global").checked ? global[2] : "";
	var fanSub = "";
	if (fandomName) {
		if (document.querySelector(`#enable-${cssFanName}`).checked) {
			fanSub = fan[2] ? fan[2] : ""; //if you don't do this, then it'll submit "undefined" when there's nothing
		}
	};
	var tempSub = tempp[2] ? tempp[2] : "";
	advSearch.value = `${globeSub} ${fanSub} ${tempSub}`;
	advSearch.value = advSearch.value.replace(/\s{2,}/g, " ").trim();
}
if (form) { form.addEventListener("submit", submission) };

/* autosubmit + previous filters drop */
if (search_submit == "") {
	let globIsCheck = false; //by default
	try {
		globIsCheck = document.querySelector("#enable-global").checked;
	} catch (e) {
		console.log("this is probably the local debug page for the error search ", e);
	}
	/* ----------------------------- */
	//there needs to be both the thing enabled and a value in the thing
	if (globIsCheck && global[2]) {
		console.log("global checked && filtered");
		submission();
		form.submit();
	} else if (fan && document.querySelector(`#enable-${cssFanName}`).checked && fan[2]) {
		console.log("fandom checked && filtered");
		submission();
		form.submit();
	};
} else if (!noResults) {
	const details = document.createElement("details");
	details.className = "prev-search";
	const summary = document.createElement("summary");
	summary.innerHTML = "<strong>FILTERS:</strong>";
	details.appendChild(summary);

	function filterloop(key) {
		var filterStore = emptyStorage(`filter-${key}`);
		if (filterStore) {
			function pp(str, attr = {}) {
				const el = attr.el ? attr.el : "span";
				const e = document.createElement(el);
				e.innerHTML = str;
				// if (klass) { e.className = klass; }
				if (attr) {
					for (const [k, v] of Object.entries(attr)) {
						e.setAttribute(k, v);
					}
				}
				return e;
			}
			const p = document.createElement("p");
			p.className = `prev-${key.replaceAll(/\W+/g, "-")}`;
			const l = document.createElement("strong");
			l.innerHTML = `${key.replaceAll(/-/g, " ").trim()} Filters:`;
			p.append(l, document.createElement("br")); // append these first ofc
			// console.log(`filterStore: `, filterStore)
			const o = Object.entries(objectify(parseFilter(filterStore.split(/\s+/))));
			console.log(o);
			var i = 0;
			for (const [king, value] of o) {
				const v = value.trim();
				if (king !== "complex") {
					const nums = v.match(/\b\d+\b/g); // this is more relevant for the replacing thing tbh
					const valSplit = v.split(/\s+\|\|\s+/);
					const spanner = pp(`${king}:`);
					if (nums || valSplit) {
						// p.innerHTML += `${key}:`;
						// console.log(`${king} nums: `, nums); 
						if (valSplit.length > 1) {
							// var j = 0;
							spanner.innerHTML += "(";
							for (var j = 0; j < valSplit.length; j++) {
								spanner.appendChild(pp(valSplit[j]));
								if (j < valSplit.length - 1) {
									spanner.innerHTML += ", ";
								}
							}
							spanner.innerHTML += ")";
						} else {
							spanner.appendChild(pp(v));

						}
						if (key.search(/filter_ids/) >= 0) {
							// replace all the filters w/the id names n stuff
							// v = v.replaceAll()
						}
					} else {
						spanner.appendChild(pp(v));
					}
					p.appendChild(spanner);

				} else {
					p.appendChild(pp(v));
				}
				if (i < o.length - 1) {
					p.innerHTML += ", ";
				}
				i++;
			}
			details.appendChild(p);
		};
	};
	if (tempp[2]) {
		//this one's different bc the adv search doesn't Actually have a checkbox for its enabling
		filterloop("advanced-search");
	}
	if (global[3]) {
		filterloop("global");
	}
	if (fan && fan[3]) {
		filterloop(fandomName);
	}
	header.insertAdjacentElement("afterend", details);
}

//from https://attacomsian.com/blog/javascript-download-file
const download = (path, filename) => {
	const anchor = document.createElement("a");
	anchor.href = path;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
}

/* export saved filters as a json */
function expy(obj) {
	console.info("now executing expy on", obj);
	// var arr = obj;
	var jason = {};

	for (const [key, value] of obj) {
		jason[key] = value; // just trust that we're feeding the f'n a clean version of what we want saved already
	}
	jason = JSON.stringify(jason);
	// console.log(`jason before expy: `, jason);
	// jason = jason.substring(0, jason.length - 2) + "}"; //remove last trailing comma + space + closing bracket
	//downloading as json from https://attacomsian.com/blog/javascript-download-file
	const blob = new Blob([jason], { type: 'application/json' }); //create blob object
	const DL_jason = URL.createObjectURL(blob);
	// var saveDate = dateFloor();
	download(DL_jason, `autofilters_${dateFloor()}.json`); //download the file
	URL.revokeObjectURL(DL_jason); //release object url
	//return jason;
};

/* import saved filters from a string */
function impsy(div) { //for now just have it read from a specified div
	div.id = "importDiv";
	const instructions = document.createElement("p");
	//remember to remove the hard-coding of the import csv checkbox and also remove the hacky version of its import process by Finishing It
	instructions.innerHTML = `<small>Please paste your exported options into the textbox below. <strong>This will override your current settings.</strong></small> | <input type="checkbox" id="import_csv" checked> <label for="import_csv">import id names from csv</label>`;
	const tb = document.createElement("textarea");
	const parseButt = document.createElement("button");
	parseButt.innerHTML = "Save Imported Settings";
	parseButt.addEventListener("click", () => {
		var impCsv = document.querySelector("#import_csv").checked;
		const impSet = tb.value;
		if (impCsv) {
			const obj = function () {
				var j = [];
				for (const tag of impSet.split("\n")) {
					j.push(tag.split(/,/g));
				}
				return j;
			}();
			var key = `ids-${toCss(currentSel())}`;
			autosave(key, JSON.stringify(obj));
		} else {
			let parsable = false;
			try {
				JSON.parse(impSet);
				parsable = true;
			} catch (e) {
				alert("sorry, this can't be parsed.");
			}
			if (parsable) {
				const obj = Object.entries(JSON.parse(impSet));
				for (const [key, value] of obj) {
					localStorage.setItem(key, value);
				}
				alert("filters successfully imported.");
				window.location.reload();
			}
		}

	})
	div.append(instructions, tb, parseButt);
}

function optimizeFilters() {
	storageCleanup(); // clean it up first
	console.log(`rel.finable: `, rel.finable);
	for (const [key, value] of rel.filters) {
		var finalStr = value;
		// console.log(`full ${key}:\n`, value);
		const sp = value.trim().split(/\s+/);

		// don't bother if there's fewer than two different things getting filtered
		if (sp.length > 1) {
			// console.log(`sp: `, sp);
			finalStr = ""; // reset this 
			const cleaned = objectify(parseFilter(sp));
			console.log(cleaned);
			for (const [k, v] of Object.entries(cleaned)) {
				let val = v.trim();
				if (k !== "complex") {
					finalStr += ` ${k}:`;
					if (val.split(/\s+/).length > 1) { // put them in parentheses if you need to
						val = `(${val})`;
					}
				}
				finalStr += val;
			}
		}
		// console.log(`final string: ${finalStr}`);
		localStorage.setItem(key, finalStr.trim()); // heh and we also have the groundwork to do this as like an object thing now too... sick as hell >:3
	}

}

function parseFilter(arr) { // takes and returns an array
	// console.log(`parseFilter arr: `, arr);
	const whee = new Array(); // new one each loop,, ehe
	var paren = 0, str = ""; // track how many layers deep into parentheses we are & total string
	for (var i = 0; i < arr.length; i++) {
		const s = arr[i];
		let lookahead = "";
		try {
			lookahead = arr[i + 1];
		} catch (e) {
			// we're at the last of them
		}
		const opens = s.match(/\(/g), closes = s.match(/\)/g);
		if (opens) {
			paren += opens.length;
		}
		if (closes) {
			paren -= closes.length;
		}

		str += `${s} `; // add the space back in

		if (paren == 0 && s !== "TO") {
			// if we're at a 0 layer (& not working with a range), then push it to the groupings and reset
			if (lookahead) { // if there's smth to look forward to
				if (lookahead !== "TO") {
					// and the next one is NOT a "TO", then it's fine to reset

					whee.push(str.trim());
					str = "";
				}
			} else {
				// if there's nothing to look forward to, then we have to push the last one anyway
				whee.push(str.trim());
				str = "";
			}
		}
	}
	// console.log(`whee: `, whee);
	return whee;
}

function objectify(arr) { // turns a filter in the thing into an object
	// console.log(arr);
	const tmp = { complex: "" };
	for (const ex of arr) {
		// console.log(`query`)
		let ind = "complex", v = ex;
		const range = ex.match(/(\[|\{|\}|\]|<|>)/g); // all the stuff associated w/ranges
		const query = ex.match(/^-?(\w|_)+(?=:)/);
		// query ? simple.push(ex) : complex.push(ex);
		// if it's a normal type of filter like filter_ids: or bookmark_count: or crossover:, WITHOUT being a range, then gotta do some processing
		if (query && !range) {
			ind = query[0];
			// if (!cleaned[ind]) { cleaned[ind] = ""; }
			tmp[ind] ? tmp[ind] += ` ||` : tmp[ind] = ""; // we don't need the double bars for complex requests, so if the thing already exists, then add them in for simple types
			v = ex.replaceAll(`${ind}:`, "").replaceAll(/(^\(|\)$)/g, ""); // first just remove the query n its colon, then get rid of its outermost shell of parentheses
		}
		// cleaned[ind] += `${cleaned[ind].length > 0 ? ` ||` : ""} ${v}`;
		tmp[ind] += ` ${v}`;
		// cleaned[ind] += ` ${v}`;
	}
	// console.log(`tmp after all that: `, tmp);
	return tmp;
}


//tagUI(); //automatically open the id thing for debugger purposes

/* CSS STYLING AT THE END BC IT'S A PICKY BITCH */
var css = `
/* error 0 results debug */
#error_debug {
	display: flex;
	flex-wrap: wrap;
}
#error_debug label {
	font-weight: bold;
	text-transform: capitalize;
}
#error_debug textarea {
	resize: none;
	scrollbar-width: thin!important;
	font-family: monospace;
}
#error_debug > div {
	width: 30%;
	margin: 10px 1%;
}
#error_debug textarea {
	font-size: 9pt;
}

#debugged-search {
	float: none;
	margin-bottom: 20px;
	text-align: left;
}
#debugged-search a {
	margin-left: 10px;
}
#debugged-search a:first-of-type {margin: 0;}

@media only screen and (max-width: 48em) {
	#error_debug > div {
		width: 98%;
	}
}
`; //gonna need this for the 0 results page anyway, might as well set it to smth
if (form) {
	//const optMWidth = window.getComputedStyle(form).width;
	const borderBottom = window.getComputedStyle(document.querySelector("form#work-filters dt")).borderBottom;
	css += `
	#main *:not(a, #id_output, button, .current) {box-sizing: border-box;}
	#get_id_butt:hover {cursor: pointer;}
	#id_output {width: max-content;min-width: 0; position: static;}
	#importDiv {display: block;}
	#stickyFilters {
		margin-top: 5px;
	}
	#stickyFilters summary {
		padding: 3px 0;
		padding-left: 3px;
		border-bottom: 1px solid white;
		float: left;
		min-width: 100%;
		margin-bottom: 5px;
	}
	#stickyFilters summary:active, #stickyFilters summary:focus {
		border-bottom: 1px dotted;
	}

	#stickyFilters > div {
		margin-top: 5px;
	}
	#stickyFilters textarea, #importDiv textarea {
		resize: none;
		scrollbar-width: thin!important;
		font-family: monospace;
	}
	#stickyFilters textarea {
		min-height: 8em;
	}
	#stickyFilters label {
		font-weight: bold;
		text-transform: capitalize;
	}
	#stickyFilters label small {font-weight: normal;}
	#stickyFilters input[type="checkbox"] {
		min-width: 1em;
		min-height: 1em;
		margin-right: 0.67em;
		position: static;
	}
	#stickyFilters span {
		padding-bottom: 3px;
		margin-bottom: 3px;
		display: block;
		width: 100%;
		border-bottom: ${borderBottom};
	}
	#filter_opt {
		display: block;
		float: right;
		min-width: 30em;
		max-width: 100%; /* this can't be vw or else it overflows on mobile */
		width: 482px;
		margin-top: 5px;
		margin-right: 5px;
		text-align: left;
	}
	#filter_opt[hidden] {
		display: none;
	}
	#filter_opt h4 {
		text-align: center;
		margin-top: 0;
		padding-bottom: 0.25em;
		border-bottom: 1px solid;
	}
	#filter_opt .filterSelector {
		min-width: clamp(3em, 100%, 10.5em);
		max-width: calc(100% - 0.175em);
	}
	#filter_opt .actions {
		display: block;
		width: 100%;
		margin: 0.25em auto;
	}
	#filter_opt input {
		border-radius: 0.3em;
	}
	#filter_opt label {
		background: none;
		border: none;
		padding: 0;
		font-weight: bold;
	}
	#tag_actions {
		width: 100%;
		margin: 5px 0 0;
		padding-bottom: 5px;
		display: grid;
		grid-template-columns: repeat(3, 3fr);
	}
	#tag_actions button {
		display: block;
		text-transform: capitalize;
		margin: 0 auto;
	}
	#tag_actions {
		width: 100%;
		margin: 5px 0 0;
		padding-bottom: 5px;
		display: grid;
		grid-template-columns: repeat(3, 3fr);
	}
	#tag_actions button {
		display: block;
		text-transform: capitalize;
		margin: 0 auto;
	}
	#append-p {max-height: 4em; overflow-y: auto; scrollbar-width: thin!important; font-size: 0.9em;}
	.appended-tag {
		border-bottom: ${borderBottom};
	}
	.filter-box-label {display: block;}
	.prev-search {margin-top: 5px;}
	.prev-search p {padding-left:45px;}
	.prev-search p strong {text-transform: capitalize;}
	.prev-search summary {font-size: 1.15em;}
	.prev-search span {font-family: monospace; font-size: 8pt; color: black;}
	[class^="prev"] span:has(span) {
		background: none;
		color: revert;
	} 
	.prev-advanced-search span {
		background-color:#d3fdac;
	}
	.prev-global span {
		background-color: #bfebfd;
	}
	.prev-${cssFanName} span {
		background-color: #d8cefb;
	}
	.banish {
		margin: 0;
		max-width: 15ch;
		position: absolute;
		top: 1.15lh;
		right: 0;
		min-width: 0;
	}
	@media only screen and (max-width: 48em) {
		.prev-search {margin: 10px 0;}
		.prev-search p {padding-left: 15px;}
		#filter_opt {
			min-width: 0;
		}
		#filter_opt .actions br {display: block;}
	}
	`;
}
const style = document.createElement("style");
style.innerText = css;
document.querySelector("head").appendChild(style);