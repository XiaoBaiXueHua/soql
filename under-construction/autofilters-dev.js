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
// @version	2.0.1
// @grant	none
// @run-at	document-end
// ==/UserScript==

/* various important global vars */
const header = document.querySelector("h2:has(a.tag)");
//console.log(header);
const currentTag = header.querySelector("a.tag"); //the current tag being searched 
const errorFlash = document.querySelector("div.flash.error");
const noResults = function () {
	//const no = header.innerHTML.match(/\n0\s/);
	//console.log(`noResults: ${no && !errorFlash}`);
	//return (no && !errorFlash);
	//return no ? true : false;
	return header.innerHTML.match(/\n0\s/) ? true : false;
}(); //will allow for the fandom box to be made
//console.log("is error page?");
//console.log(errorFlash);
//here's the local storage array

/* keeping the fandoms w/saved filters in an array: */
var listKey = "saved fandoms";
var savedFandoms = localStorage[listKey]; //need to keep an array of available fandoms to be able to make a dropdown of options when 
if(!savedFandoms) {
	//localStorage.setItem(listKey, []);
	savedFandoms = [];
} else {savedFandoms = savedFandoms.split(/,/g);}
//localStorage saves the list as a string, so to turn it into an array, must use split
//console.log(savedFandoms);

function filterArray(){return Object.entries(localStorage)};

/* removes local storage on blank tags  */
const search_submit = window.location.search;
//console.log(`search_submit: ${search_submit}\n!search_submit: ${!search_submit}`);
const currentPath = window.location.pathname.toString();
const shouldClear = currentPath.match(/tags/);
//console.log(`supposed to clear the advanced search: ${shouldClear}`);
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
	//console.log("item w/ fandom numbers:");
	//console.log(raw);
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
		localStorage[listKey] = savedFandoms;
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
	//var tag = document.querySelector("h2.heading a.tag").innerText;
	var tag = currentTag.innerText.replace(remAmbig, "").trim();
	//console.log("tagName function querySelector of querySelector testing: ")
	//console.log(tag);
	//tag = tag.replace(remAmbig, "").trim();
	return tag;
}();
if (!localStorage[`ids-global`]) {localStorage.setItem("ids-global", "")}; //if there's nothing in the global ids key storage, make it blank
function emptyStorage(key) {
	if (!localStorage[key]) {
		localStorage.setItem(key, "");
	}
	console.log(localStorage[key]);
	return localStorage[key];
}

var fanIdKey;// = localStorage[`ids-${cssFanName}`];
function isFandom() { //function for setting all the various vars that only show up if it's a fandom-specific tag. will have to clean up the thing later but for now i'll just leave it as is
	if (!fandomName) {
		return; //just exit if there's no fandom
	}
	fanIdKey = emptyStorage(`ids-${cssFanName}`);
}
isFandom();
const globIdKey = emptyStorage(`ids-global`);

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
	//console.log(name);
	var is = name == "fandom" ? true : false;
	if (is && !fandomName) { return null; } //exit from trying to make a fandom box in a global tag
	var key = `filter-${is ? fandomName : name}`;
	if (!localStorage[key]) {localStorage.setItem(key, "")}; //if there doesn't already exist a filter for this fandom, set it now
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
	//const l = makeStrEl(prefix, "label");
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
	//console.log("box being made:");
	//console.log(obj);
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
	//const label = makeStrEl(htm, "label");
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

/* now to deal w/the currently-existing form */
const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete");
const advSearch = document.querySelector("#work_search_query");

//if there's one there will obvs be the other, but just so that they don't feel left out, using "or"
if (searchdt !== null || searchdd !== null) {
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
	//console.log(`box(fan) || noResults: ${(box(fan) || noResults)}`);
	const fanEl = box(fan) ? fan[4] : null;
	if (fanEl) {
		for (el of fanEl) {
			saveDiv.appendChild(el);
		};
	}
	/* when a search returns nothing */
	else if (noResults) {
		//console.log("noResults is true");
		var html = `Your search returned no results. Would you like to review your filters?`;
		//p.innerHTML = html;
		debuggy(html);
	};
	details.append(summary, saveDiv);
	searchdt.insertAdjacentElement("beforebegin", details);
} else if (errorFlash) {
	//const p = document.createElement("p");
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
	//console.log(currentTag);
	var href = `${currentTag.href}/works`;
	//console.log(href);
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
		//showFilters.setAttribute("onclick", showAllFilters(debugDiv));
		reSearch.appendChild(showFilters);
	} else if (errorFlash) {
		showAllFilters(debugDiv); //will automatically do the debug div on the error flash page
	}
	const research = document.createElement("a");
	research.href = href;
	research.innerHTML = "Search Again";
	reSearch.appendChild(research);
	//errorFlash.insertAdjacentElement("afterend", debugDiv);
	//errorFlash.insertAdjacentElement("afterend", p);
	//header.insertAdjacentHTML("afterend", "<hr>");
	//header.insertAdjacentElement("afterend", reSearch);
	par.insertAdjacentElement("afterend", debugDiv);
	debugDiv.insertAdjacentElement("afterend", reSearch);
	header.insertAdjacentElement("afterend", p);
}

/* function for showing all the filters */
function showAllFilters(parent) {
	for (const [key, value] of filterArray()) {
		if (key.toString().startsWith("filter-")) {
			cssId = toCss(key);
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

/* now for the tag id fetcher */

/* the function to add the tag ids n stuff */
//gotta make these first for nya
const navList = document.querySelector("#main ul.user.navigation");
const filtButt = document.createElement("li");
filtButt.id = "get_id_butt";
filtButt.innerHTML = `<a id="id_butt">Tag ID</a>`;

/* id fetcher function */
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
		//if (!errorFlash) {alert("can't find tag id :C");};
		return null;
	};
}();
var filter_ids = `filter_ids:${id}`;

function idKey() {
	var add = `[${tagName}, ${id}]`;
	if (fandomName) {
		fanIdKey += `${fanIdKey?",":""}${add}`;
		autosave(`ids-${cssFanName}`, fanIdKey);
	} else {
		globIdKey += `, ${add}`;
	}
	//return [tagName, id];
}

/* display the filter_ids and actions */
function nya() {
	if (!document.querySelector("#filter_opt")) {
		const select = document.createElement("select");
		const filterOpt = document.createElement("fieldset");
		filterOpt.id = "filter_opt";
		/* display ID # & choose where to append the tag */
		const fil = document.createElement("div");
		const output = document.createElement("input");
		output.id = "id_output";
		output.value = id;
		const label = document.createElement("label");
		label.innerHTML = "filter_ids:";
		label.setAttribute("for", "id_output");
		/* selection dropdown */
		const globalOpt = `<option value="filter-global">Global</option>`;
		if (!fandomName) { //if in a global tag, give the option to pick a fandom for this particular tag
			select.innerHTML = globalOpt;
			for (var fandom of savedFandoms) {
				const option = document.createElement("option");
				option.innerHTML = fandom;
				option.setAttribute("value", `filter-${fandom}`);
				select.appendChild(option);
			}
		} else {
			const option = document.createElement("option");
			option.innerHTML = fandomName;
			option.setAttribute("value", `filter-${fandomName}`);
			select.appendChild(option);
			select.innerHTML += globalOpt;
		}
		var targetFilter = select.options[0].value;
		function selectorType() {
			return (targetFilter=="filter-global") ? "global" : "fandom";
		};
		select.onchange = function() {
			//console.log(select.value);
			targetFilter = select.value;
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
			//console.log(`${selectorType()}Filters`);
			var filtArr = [selectorType(), targetFilter, localStorage[targetFilter], select.selectedIndex];
			var textarea = document.getElementById(`${filtArr[0]}Filters`);
			var curr = select.options[filtArr[3]].text;
			//let doubleck = new RegExp(`\\D${id}\\s`, "g");
			//if fandom-specific, goes into the fandom filter box
			//var filtArr = fandomName ? fan : global;
			//console.log(filtArr);
			//console.log(targetFilter);
			//var filtArr = targetFilter;
			var filt = ` ${filtArr[2]} `; //need the spaces in order to correctly match the values later lol. it'll be trimmed in the end
			//var type = ` ${obj.pre}${filter_ids} `;
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
					if(type=="Remov") {
						p.innerHTML = `${obj.ing}ed <strong>${tagName}</strong> from <em>${curr}</em>.`
					} else {
						p.innerHTML = `Changed <strong>${tagName}</strong> to ${obj.ing}e in <em>${curr}</em>.`;
					}
				}
			} else if(type=="Remov") { //if you're supposed to be removing smth that isn't there, tell them
				p.innerHTML = `<strong>${tagName}</strong> isn't in your <em>${curr}</em> filters!`;
			} else {
				filt += newFilt;
				p.innerHTML = `Now ${obj.ing}ing <strong>${tagName}</strong> in <em>${curr}</em>.`;
			}
			filt = filt.replace(/\s{2,}/g, " ").trim(); //remove extra whitespaces
			//filtArr[4][1].value = filt;
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
		fil.append(label, output, select);
		filterOpt.append(fil, buttonAct, appp);
		navList.parentElement.insertAdjacentElement("afterend", filterOpt);
	}
}
//only add the tag id fetcher button if there's a form
if (form) {
	navList.insertAdjacentElement("afterbegin", filtButt);
	filtButt.addEventListener("mouseup", nya);
}

/* banish a particular work from your search results */
const workList = document.querySelectorAll("li[id^='work']");
//var nyeh = (!global[3] && !search_submit); //if both the global n the fandom checkmarks are off AND we're not on a search page
var nyeh = fan ? (!global[3] && !fan[3]) : !global[3]; //have to check if the fandom box exists first before declaring it -_-
console.log(`!global[3] (&& optional !fan[3]): ${nyeh}`);
if (nyeh || search_submit) {
	//if the autofilters are currently disabled or we're already on a search page, do the thing
	for (const work of workList) {
		//console.log(work);
		const work_id = work.id.replace("work_", ""); //get its id num from. well. its id.
		const klass = work.classList.toString();
		//const user_id = klass.match(/user-\d+/).toString();
		const user_id = function () {
			let id = null;
			try {
				id = klass.match(/user-\d+/).toString().replace(/user-/, "");
			} catch (e) {
				console.info("oh hey an anon work")
			}
			return id;
		}();
		const isAnon = id ? false : true;
		//console.log(`work_id: ${work_id}; user_id: ${user_id}`);
		const banSel = document.createElement("select");
		const opts = [work_id, isAnon, user_id];
	}
}


/* add filters + temp search to search w/in results box */
function submission() {
	//console.log("real box value:")
	//console.log(advSearch.value);
	//console.log("global array:");
	//console.log(global);
	//console.log("fandom array:");
	//console.log(fan);
	var globeSub = document.querySelector("#enable-global").checked ? global[2] : "";
	var fanSub = "";
	if (fandomName) {
		if (document.querySelector(`#enable-${cssFanName}`).checked) {
			fanSub = fan[2] ? fan[2] : ""; //if you don't do this, then it'll submit "undefined" when there's nothing
		}
	};
	var tempSub = tempp[2] ? tempp[2] : ""; 
	//console.log("globalSub:");
	//console.log(globeSub);
	//console.log("fanSub:");
	//console.log(fanSub);
	//console.log("tempp:");
	//console.log(tempp);
	advSearch.value = `${globeSub} ${fanSub} ${tempSub}`;
	advSearch.value = advSearch.value.replace(/\s{2,}/g, " ").trim();
}
if (form) { form.addEventListener("submit", submission) };

/* autosubmit + previous filters drop */
//const search_submit = window.location;
//var debug_error = window.location.toString().match("error");
//console.log(debug_error);
if (search_submit == "") {
	//localStorage.setItem("filter-advanced-search", "");
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
	//tempp[2] = fakeSearch.value ? fakeSearch.value : ""; //if there's a value in the fake search (like when going through Pages of search w/in results things), then make sure that the temp search remains in local storage
	//console.log(`!noResults: ${!noResults}`);
	const details = document.createElement("details");
	details.className = "prev-search";
	const summary = document.createElement("summary");
	summary.innerHTML = "<strong>FILTERS:</strong>";
	details.appendChild(summary);

	function filterloop(key) {
		if (localStorage[`filter-${key}`]) {
			const p = document.createElement("p");
			p.className = `prev-${key.replaceAll(/\W+/g, "-")}`;
			p.innerHTML = `<strong>${key.replaceAll(/-/g, " ").trim()} Filters:</strong></br><span>${localStorage[`filter-${key}`]}</span>`;
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
	//console.log("we are now erasing the local storage for the advanced search");
	//localStorage.setItem("filter-advanced-search", fakeSearch.value ? fakeSearch.value : "");

}

//from https://attacomsian.com/blog/javascript-download-file
const download = (path, filename) => {
	const anchor = document.createElement("a");
	anchor.href = path;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.removeChild(anchor);
}

/* export saved filters as a json */
function expy(obj) {
	console.info("now executing expy on", obj);
	//console.log(filterArray());
	var arr = obj;
	var jason = "{"; //opening bracket;
	for (const [key, value] of arr) {
		if (key.startsWith("filter-") || key.startsWith("enable-")) {
			jason += `"${key}": "${value.replaceAll(`"`, `\\"`)}", `; //make sure to sanitize the values w/escape chars
			if(obj.indexOf(arr)==obj.length) {
				console.log("uhh this is the last one");
			}
			//console.log(value);

		}
		//expy(value);
	}
	jason = jason.substring(0, jason.length-2) + "}"; //remove last trailing comma + space + closing bracket
	//downloading as json from https://attacomsian.com/blog/javascript-download-file
	const blob = new Blob([jason], {type: 'application/json'}); //create blob object
	const DL_jason = URL.createObjectURL(blob);
	download(DL_jason, `autofilters_${new Date}.json`); //download the file
	URL.revokeObjectURL(DL_jason); //release object url
	//return jason;
};
//expy(filterArray());
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
	const optWidth = window.getComputedStyle(document.querySelector("#main ul.user.navigation.actions")).width;
	const hoverShad = window.getComputedStyle(document.querySelector("form#work-filters fieldset")).boxShadow;
	const hoverLine = window.getComputedStyle(document.querySelector(".actions input")).borderColor;
	const optMWidth = window.getComputedStyle(form).width;
	const borderBottom = window.getComputedStyle(document.querySelector("form#work-filters dt")).borderBottom;
	css += `
	#main *:not(a, #id_output, button, .current) {box-sizing: border-box;}
	#get_id_butt:hover {cursor: pointer;}
	#id_output {width: max-content;min-width: 0; position: static;}
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
	#stickyFilters textarea {
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
		max-width: 100%;
		width: ${parseInt(optWidth)}px;
		min-width: ${parseInt(optMWidth)}px;
		margin-top: 5px;
		margin-right: 5px;
		text-align: left;
	}
	#filter_opt input {
		max-width: 33%;
		border-radius: 0.3em;
	}
	#filter_opt label:hover+input {
	  border-top:1px solid ${hoverLine};
	  border-left:1px solid ${hoverLine};
	  box-shadow: ${hoverShad};
	}
	#filter_opt select{
		margin-top: 5px;
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
	}
	`;
}
const style = document.createElement("style");
style.innerHTML = css;
document.querySelector("head").appendChild(style);