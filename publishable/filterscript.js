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
// @version 2.2.1
// @history 2.2.1 - fixed a bug abt the tag ui not showing up on global tag types
// @history 2.2 - added ability to optimize filters to ui. idiot-proofed the ui a bit more (it's me i'm idiots)
// @history 2.1 - added ability to import/export saved filters
// @grant	none
// @run-at	document-end
// ==/UserScript==

/* various important global vars */
const header = document.querySelector("h2:has(a.tag)");
//console.log(header);
const currentTag = header.querySelector("a.tag"); //the current tag being searched
const errorFlash = document.querySelector("div.flash.error");
const noResults = function () {
	return header.innerHTML.match(/\n0\s/) ? true : false;
}(); //will allow for the fandom box to be made
//here's the local storage array

/* keeping the fandoms w/saved filters in an array: */
var listKey = "saved fandoms";
var savedFandoms = localStorage[listKey]; //need to keep an array of available fandoms to be able to make a dropdown of options when
if (!savedFandoms) {
	savedFandoms = [];
} else {
	try {
		savedFandoms = JSON.parse(savedFandoms);
	} catch (e) {
		savedFandoms = savedFandoms.split(/,/g);
	}
}
//localStorage saves the list as a string, so to turn it into an array, must use split

function filterArray() { return Object.entries(localStorage) };

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

var remAmbig = /\s\((\w+(\s|&)*|\d+\s?)+\)/g; //removes disambiguators
const fandomName = function () {
	var fandom_cutoff = 70;
	var raw = document.querySelector("#include_fandom_tags label"); //gets the fandom count from the dropdown on the side
	if (!raw) { return null; };
	raw = raw.innerText;
	var fandom = raw.replace(remAmbig, "").trim();
	//later, maybe have it look at the other top fandoms n see if they're related, either by like an author name, or if there's an "all media types" attached to redeclare the cutoff

	var fandomCount = raw.match(/\(\d+\)/).toString();
	fandomCount = fandomCount.substring(1, fandomCount.length - 1); //chops off parentheses
	fandomCount = parseInt(fandomCount);

	var tagCount = header.innerText;
	tagCount = tagCount.match(/\d+,?\d*\sW/).toString().replace(",", ""); //get the number, remove the comma
	tagCount = tagCount.substring(0, tagCount.length - 2); //cut off the " W" bit that was used to make sure was Finding the actual fandom count (in case there's a fandom w/numbers in its name)
	tagCount = parseInt(tagCount); //now turn it into an integer

	if (!fandom || !fandomCount || !tagCount) { return; }
	var meetsCutoff = (fandomCount / tagCount * 100 >= fandom_cutoff);
	if (meetsCutoff && savedFandoms.indexOf(fandom) < 0) { //if it qualifies as being part of a fandom & is not yet in the array, add it and then save it to local storage
		savedFandoms.push(fandom);
		autosave(listKey, JSON.stringify(savedFandoms));
	}
	return meetsCutoff ? fandom : null;
}();
console.info(`fandomName: ${fandomName}`);
console.log(savedFandoms);
/* function to make css-friendly versions of a name */
function toCss(str) {
	return str.replaceAll(/\W+/g, "-");
}
const cssFanName = fandomName ? toCss(fandomName) : null;
const tagName = function () {
	return currentTag.innerText.replace(remAmbig, "").trim();
}();
//if there's nothing
function emptyStorage(key) { //function to give you that particular localStorage (n set it to nothing if dne)
	if (!localStorage[key]) {
		localStorage.setItem(key, "");
	}
	return localStorage[key];
}
function storJson(item) { //turns local storage item into a json
	let a;
	try {
		a = JSON.parse(item);
	} catch (e) {
		console.error(`obj that was supposed to become a json: `, item, e);
		a = [];
	}
	return a;
}

var fanIdStorage; // = localStorage[`ids-${cssFanName}`];
function isFandom() { //function for setting all the various vars that only show up if it's a fandom-specific tag. will have to clean up the thing later but for now i'll just leave it as is
	if (!fandomName) {
		return; //just exit if there's no fandom
	}
	fanIdStorage = emptyStorage(`ids-${cssFanName}`);
}
isFandom();
var globIdStorage = emptyStorage(`ids-global`);

/* local storage keys */
function enable(key) {
	if (key == "advanced-search") { return null };
	let enabled = true;
	try {
		enabled = JSON.parse(localStorage[`enable-${key}`]);
	} catch (e) {
		console.error(`[${key}] has no set filters yet, so`, e);
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
const id = function () {
	if (document.querySelector("#favorite_tag_tag_id")) {
		console.log("favorite tag id method")
		return document.querySelector("#favorite_tag_tag_id").value;
	} else if (document.querySelector("a.rss")) {
		console.log("rss feed method");
		var href = document.querySelector("a.rss");
		href = href.getAttribute("href");
		href = href.match(/\d+/);
		return href;
	} else if (document.querySelector("#include_freeform_tags input:first-of-type")) {
		console.log("first freeform tag method");
		return document.querySelector("#include_freeform_tags input:first-of-type").value;
	} else if (document.querySelector("#subscription_subscribable_id")) {
		console.log("subscribable id method");
		return document.querySelector("#subscription_subscribable_id").value;
	} else {
		return null;
	};
}();
var filter_ids = `filter_ids:${id}`;

function idKey(n = tagName, i = id, k = fandomName ? `ids-${cssFanName}` : "ids-global", s = fandomName ? fanIdStorage : globIdStorage) { //by default, do this w/the current tag's name, id, and fandom. the import process will need to loop through this later, hence the params
	var add = [n, i];
	let str = new RegExp(`\\["${n}","${i}"\\]`);
	var idsObj = storJson(s);
	if (s.match(str) <= 0) { //js can't match objects w/in arrays to my knowledge, so this was the best i could do lol
		idsObj.push(add); //add it to the object
		s = JSON.stringify(idsObj);
		autosave(k, JSON.stringify(idsObj)); //and then save it
	}
}

/* now to deal w/the currently-existing form */
const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete");
const advSearch = document.querySelector("#work_search_query");

//if there's one there will obvs be the other, but just so that they don't feel left out, using "or"
if (searchdt !== null || searchdd !== null) {
	idKey(); //first, just save the tag id in local storage. save me the time
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
	for (el of globEl) {
		saveDiv.appendChild(el);
	};
	const fanEl = box(fan) ? fan[4] : null;
	if (fanEl) {
		for (el of fanEl) {
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
	for (const [key, value] of filterArray()) {
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
	if (!document.querySelector("#filter_opt")) {
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
			expy(filterArray());
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
			for (var fandom of savedFandoms) {
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
		for (a of ugh) {
			tagButtons(a);
		}
		id_exp.append(impButt, expButt, optimizeButt, impDiv);
		// fil.append(id_exp, select);
		fil.append(label, id_exp, nowEditP);
		filterOpt.append(h4, p, fil, buttonAct, appp);
		navList.parentElement.insertAdjacentElement("afterend", filterOpt);
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
			var fills = filterStore.split(/\s(?=(-|l|f|r|c|t|w|b|!)\w+)(?<!&)/).filter(function (item) { return item.length > 3 && item }); // can't seem to use parentheses in the negative lookback to group multiple ones, so i'll just leave it as just "not preceded by '&'"
			console.log(`splitting the ${key} filter on spaces: `, fills); // (?<!(&)) (?<!(&|\)|!|\})) (?=(-|l|f|r|c|t|w|b|!)\w+)
			const p = document.createElement("p");
			p.className = `prev-${key.replaceAll(/\W+/g, "-")}`;
			const l = document.createElement("strong");
			l.innerHTML = `${key.replaceAll(/-/g, " ").trim()} Filters:`;
			p.append(l, document.createElement("br")); // append these first ofc
			for (var i = 0; i < fills.length; i++) {
				var html = fills[i];
				const sp = document.createElement("span");
				sp.innerHTML = html;
				p.appendChild(sp);
				if (i !== fills.length - 1) { p.innerHTML += ", "; } // add the comma and stuff if we're not at the end
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
	details.innerHTML = function () {
		var html = details.innerHTML; //start off as is
		function yikes(obj) {
			try {
				for (const storedId of storJson(obj)) {
					const rep = new RegExp(`\\b${storedId[1]}\\b`, "g"); //for now, hard code it like this. can make it more sensitive later
					html = html.replaceAll(rep, `${storedId[0]}`);
				}
			} catch (e) {
				console.error("i bet it's not iterable: ", e);
			}
		}
		yikes(globIdStorage);//global
		if (fandomName) {
			yikes(fanIdStorage);
		}
		return html.trim(); //then return it replaced
	}();
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
	var arr = obj;
	var jason = "{"; //opening bracket;
	for (const [key, value] of arr) {
		if (key.startsWith("filter-") || key.startsWith("enable-")) {
			jason += `"${key}": "${value.replaceAll(`"`, `\\"`)}", `; //make sure to sanitize the values w/escape chars
			if (obj.indexOf(arr) == obj.length) {
				console.log("uhh this is the last one");
			}
		}
		//expy(value);
	}
	jason = jason.substring(0, jason.length - 2) + "}"; //remove last trailing comma + space + closing bracket
	//downloading as json from https://attacomsian.com/blog/javascript-download-file
	const blob = new Blob([jason], { type: 'application/json' }); //create blob object
	const DL_jason = URL.createObjectURL(blob);
	var saveDate = new Date();
	download(DL_jason, `autofilters_${saveDate.getFullYear()}_${saveDate.getMonth()}_${saveDate.getDay()}.json`); //download the file
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


class filterObj {
	constructor(fandom) {
		this.fullName = fandom;
		this.name = fandom.replace(filterObj.disambiguator, "");
		this.cssName = this.name.replace(/\W+/g, "-");
		this.filters = function () { // has sub-objects "include", "exclude", and "complex"
			let filterObj;
			try {
				filterObj = JSON.parse(localStorage[this.name].filters);
			} catch (e) {
				console.error("it seems you haven't used the updated version of the script yet. now turning filters into a js object.");
				var filterStr = localStorage[`filter-${this.name}`].replace(/s{2,}/g, " ") + " ";
				const query = new Array();
				const rules = new Array();
				var lastColon = 0;
				var numParentheses = 0; // track how many parentheses deep we are currently
				for (var j = 0; j < filterStr.length; j++) {
					const char = filterStr[j];
					// if we're done with our parentheses and we're at a space...
					if ((numParentheses == 0 && char == " ") || j == filterStr.length - 1) { // if there are no parentheses && we're currently on a space, OR we've finished the string...
						rules.push(filterStr.substring(lastColon + 1, j).trim()); // push the substring to the rules
						lastColon = j;
					}
					if (char == ":" && numParentheses == 0) {
						query.push(filterStr.substring(lastColon, j).trim()); // if we're at a colon & have no parentheses, then pass the current subscring onto the queries
						lastColon = j;
					} else if (char == "(") {
						numParentheses++;
					} else if (char == ")") {
						numParentheses--;
					}
				}
				// console.log(`query array: `, query, `\nrules array: `, rules);
				const incl = new Array(), excl = new Array(), otherQueries = new Array();
				if (query.length == rules.length) {
					for (var i = 0; i < query.length; i++) {
						query[i].startsWith("-") ? excl.push([query[i], rules[i]]) : incl.push([query[i], rules[i]]);
					}
				} else {
					// make arrays of the three types of queries: include, exclude, and complex
					for (var i = 0; i < query.length || i < rules.length; i++) { // because the rules would be longer than the queries in this case
						try {
							if (rules[currRule].search(":") >= 0) {
								// if it's a complex query
								otherQueries.push(rules[currRule]);
								currRule++;
							}
						} catch (e) {
							console.log("we have gone past the number of rules.");
						}
						if (i < query.length) {
							query[i].startsWith("-") ? excl.push([query[i], rules[currRule]]) : incl.push([query[i], rules[currRule]]);
						}
						currRule++;
					}
				}
				// console.log(`include array: `, incl, `\nexcl array: `, excl, `\nand other queries array: `, otherQueries);
				filterObj = {
					include: incl,
					exclude: excl,
					complex: otherQueries
				}
			}
			return filterObj;
		}(); // this is the array of filters that actually gets used
		this.ids = storJson(emptyStorage(`ids-${this.cssName}`)); // this is just the array of ids and their names specific to this particular fandom
		this.enabled = localStorage[`enable-${this.cssName}`] ? storJson(localStorage[`enable-${this.cssName}`]) : true; // bc local storage stores things as strings, we can just check to make sure the local storage obj exists w/o worrying abt stuff. anyway if it doesn't exist default is true
		this.type = (fandom !== "global") ? fandom : "fandom";
	}
	static disambiguator = /\s\((\w+(\s|&)*|\d+\s?)+\)/g; //removes disambiguators

	textbox() {
		const box = dom.pp("", "textarea", false, { id: `${this.type}Filters` });
	}

	filterText(decode = false) {
		// turns the filters object into the text that the ao3 advanced search can parse
		const ids = this.ids;
		const inc = this.filters.include, ex = this.filters.exclude, comp = this.filters.complex;
		let str = ""; // initialize the string
		for (var [key, value] of inc) {
			if (decode) {
				switch (key) {
					case "filter_ids": {
						for (const [name, number] of ids) {
							value = value.replaceAll(new RegExp(`\\b${number}\\b`, "g"), name);
						}
						break;
					}
				}
			}
			str += `${key}:${value} `;
		}
		for (var [key, value] of ex) {
			str += `${key}:${value} `;
		}
		for (const query of comp) {
			str += `${query} `;
		}
		return str.trim();
	}
}


function optimizeFilters() {
	const filterArray = Object.entries(localStorage);
	for (const [key, value] of filterArray) {
		if (key.search(/^filter-/) >= 0 && value) {
			const filts = value.split(/\s(?=(-\(?|l|f|r|c|t|w|b|s)\w+)(?<!&)/).filter(function (item) { return item.length > 3 && item }); // split along spaces followed by -, f, c, or r. previously \s(?=[-fcrul])
			const keepSame = new Array();
			const excls = new Array();
			let newFilter = "";
			for (const filter of filts) {
				if (filter.search(/^-filter_ids:/) >= 0) {
					excls.push(filter.replace("-filter_ids:", ""));
				} else {
					keepSame.push(filter);
				}
			}
			for (const f of keepSame) { newFilter += `${f} `; }
			if (excls.length > 0) {
				newFilter += "-filter_ids:("; // open the parentheses
				for (var i = 0; i < excls.length; i++) {
					newFilter += excls[i]; // add the thing
					if (i < excls.length - 1) { newFilter += " || "; }
				}
				newFilter += ")"; // now close the parentheses
				if (newFilter.search(/$-filter_ids:\({2,}/)) {
					// if the filter_ids has more than one set of parentheses being unnecessary
					console.log(`optimizing THIS is a job for another day lolol`)
				}
			}
			localStorage.setItem(key, newFilter.trim());
			const announceP = document.createElement("p");
			announceP.innerHTML = `Optimized <strong>${key.replace("filter-", "")}</strong> filters.`;
			announceP.className = "appended-tag";
			document.querySelector(`#append-p`).prepend(announceP);
		}
	}
	// now do some stuff to basically consolidate some of the filter stuff into one object per fandom
	for (const fand of JSON.parse(localStorage[listKey])) {
		let regex = new RegExp(`$\\(${fand}|${toCss(fand)}\\)`);
		if (key.search(regex) >= 0) {
			console.log(fand);
		}
	}
}

let today = new Date();
console.log(`today's date: ${today.getDate()}`);
if (today.getDate() == 1) {
	for (const [key, value] of Object.entries(localStorage)) {
		if (value == "") {
			localStorage.removeItem(key);
			console.log(`item removed: ${key}.`)
		}
	}
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
	#filter_opt h4 {
		text-align: center;
		margin-top: 0;
		padding-bottom: 0.25em;
		border-bottom: 1px solid;
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
	.prev-advanced-search span {
		background-color:#d3fdac;
	}
	.prev-global span {
		background-color: #bfebfd;
	}
	.prev-${cssFanName} span {
		background-color: #d8cefb;
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