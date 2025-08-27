// ==UserScript==
// @name	ao3 sticky filters DEVELOPER
// @namespace	https://sincerelyandyourstruly.neocities.org
// @author	白雪花
// @description	rewriting thE saved filters script from https://greasyfork.org/en/scripts/3578-ao3-saved-filters, as well as adding in features made possible by flamebyrd's tag id bookmarklet (https://random.fangirling.net/scripts/ao3_tag_id)
// @match	http*://archiveofourown.org/tags/*/works*
// @match	http*://archiveofourown.org/works?work_search*
// @match	http*://archiveofourown.org/works?commit=*&tag_id=*
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/filterscript.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/filterscript.js
// @version	2.1
// @history 2.1 - added ability to import/export saved filters
// @grant	none
// @run-at	document-end
// ==/UserScript==
// version of autofilters that doesn't try to make it into overly object-oriented stuff

// version of autofilters that doesn't try to make it into overly object-oriented stuff

// the dom element creation functions i wrote that i can't live without anymore
class dom {
	static pee(stray, parent, childParams) { // 'stray' as in 'string-or-array' though it takes elements too
		switch (typeof (stray)) {
			case "string": {
				parent.innerHTML += stray; // because we sometimes work with arrays of mixed strings and elements, must use +=
				break;
			};
			case "object": {
				try {
					parent.appendChild(stray); // try just appending it first
				} catch (e) {
					try { // otherwise, it's probably an array
						for (var it of stray) {
							try {
								if (typeof (it) == "string") {
									// parent.nodeName
									if (childParams) {
										it = dom.pChildren(it, (childParams.type ? childParams.type : parent.nodeName), childParams.klass, childParams.attr, childParams.childParams); // these should, hypothetically, turn the item into an element so that pee can append them correctly
									}
								}
								dom.pee(it, parent, childParams);
							} catch (e) {
								console.error("haha too much recursion i bet. man\n", e);
							}
						}
					} catch (e2) {
						console.error(`error 1:\n`, e, `error 2: \n`, e2);
					}
				}
				break;
			}
		}
	}

	//turns a string into an element
	static pp(str, type = "p", klass = "", attr = {}) {
		return dom.pChildren(str, type, klass, attr, false);
	}

	static pChildren(str, type = "span", klass = "", attr = {}, childParams = {}) { // the same as pp but this time we can have children of a different type. and also gives us spans by default
		const el = document.createElement(type);
		dom.pee(str, el, childParams);
		if (klass) { el.className = klass; }
		if (attr) {
			for (const [key, value] of Object.entries(attr)) {
				el.setAttribute(key, value);
			}
		}
		return el; //returns an html element
	}

	static parry(stray, type = "p", klass = "", attr = {}) { // turns arrays of strings into arrays of the same element
		const arr = new Array();
		for (const s of stray) {
			try {
				const el = document.createElement(type);
				el.innerHTML = s;
				if (klass) el.className = klass;
				if (attr) {
					for (const [key, value] of Object.entries(attr)) {
						el.setAttribute(key, value);
					}
				}
				arr.push(el);
			} catch (e) {
				console.error("hey man parry's only for turning arrays of strings into arrays of the same element. you can't do... whatever it is you're doing.");
			}
		}
		return arr;
	}
	//appends arrays of ELEMENTS to a parent
	static appendix(array, par) {
		for (const el of array) {
			try {
				par.appendChild(el);
			} catch (e) {
				if (typeof (el) == "object") {
					dom.appendix(el, par);
				} else if (typeof (el) == "string") {
					par.innerHTML += el;
				} else {
					console.error("yeah. something happened with the appendix. idk look at the error:\n", e);
				}
			}
		}
	}
}

var remAmbig = /\s\((\w+(\s|&)*|\d+\s?)+\)/g; //removes disambiguators

function toCss(str) {
	return str.replaceAll(/\W+/g, "-");
}

/* various important global vars */
const header = document.querySelector("h2:has(a.tag)");
//console.log(header);
const currentTag = header.querySelector("a.tag"); //the current tag being searched
const tagName = currentTag.innerText.replace(remAmbig, "").trim();
const errorFlash = document.querySelector("div.flash.error");
const noResults = function () {
	return header.innerHTML.match(/\n0\s/) ? true : false;
}(); //will allow for the fandom box to be made
const form = document.querySelector("form#work-filters");
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

function filterArray() { return Object.entries(localStorage) }; // always gets the freshest version of the filters as an array
function autosave(key, val) { localStorage.setItem(key, val); } // what it says on the tin

/* removes local storage on blank tags  */
const search_submit = window.location.search;
if (window.location.pathname.toString().match(/tags/) && search_submit) {
	localStorage.setItem("filter-advanced-search", ""); // resets it at the proper times
}

function emptyStorage(key) { //function to give you that particular localStorage (or an empty string if there's nothing set)
	return localStorage[key] ? localStorage[key] : ""; // hopefully this will keep it from setting local storage keys for fandoms you poke around in exactly once and then don't actually have filters for
}

class fandom { // okay i lied. there Will be a class in here.
	constructor(name = "") { // the name should either be the full, non-css'd name as a string, or an element to pick from
		this.name = function () {
			// have to do this so that we can then use the exists bit
			let n = "";
			try {
				n = name.innerText.replace(remAmbig, "").trim();
			} catch (e) {
				// console.warn(`must be in a global tag.`);
				if (typeof (name) == "string") {
					n = name;
				} else {
					console.error(e);
				}
			}
			return n;
		}();
		this.cssName = toCss(this.name);
		this.type = fandom.category(name); // flattens all fandoms down to "fandom"
		// this.current = (name == document.querySelector(`#include_fandom_tags label`).innerText.replace(remAmbig, "").trim()) ? true : false; // potentially useful for the debug screen later
	}
	get filters() {
		return emptyStorage(`filter-${this.name}`); // make it mutable instead of a const like before, so that ideally
	}

	enabled = () => {
		return document.querySelector(`#enable-${this.cssName}`).checked; // anonymous function to always fetch whether the thing is currently checked
		// might change it to JSON.parse(localStorage[`enable-${this.name}`]), since the checkbox event listener should be autosaving that each time
	}

	static category(str) {
		return ((str == "global") || (str == "advanced-search")) ? str : "fandom"; // flattens all fandoms down to "fandom";
	}

	static exists = function () {
		var cutoff = 70;
		var raw = document.querySelector("#include_fandom_tags label"); //gets the fandom count from the dropdown on the side
		if (!raw) { return false; }; // do this one up here so that we don't get errors going smth like 'you can't do that with raw' or whatever

		var fandomCount = raw.innerText.match(/\(\d+\)/).toString();
		fandomCount = parseInt(fandomCount.substring(1, fandomCount.length - 1)); //chops off parentheses, then parses it as an integer

		var tagCount = header.innerText;
		tagCount = tagCount.match(/\d+,?\d*\sW/).toString().replace(",", ""); //get the number, remove the comma
		tagCount = parseInt(tagCount.substring(0, tagCount.length - 2)); //cut off the " W" bit that was used to make sure was Finding the actual fandom count (in case there's a fandom w/numbers in its name)
		// console.log(fandomCount, tagCount, (fandomCount / tagCount * 100 >= cutoff));
		return ((!fandomCount || !tagCount) ? false : (fandomCount / tagCount * 100 >= cutoff)); // return false always if there's no fandom or tag count; otherwise it depends on whether it meets the cutoff
	}();
	static box(key, val, debug = false) { // static function to make le box
		const type = fandom.category(key);
		const box = dom.pp("", "textarea", null, { id: debug ? `debug-${toCss(key)}` : `${type}Filters` });
		box.value = val; // have to do it this way, or else we're just setting the attribute and it won't actually show up in the box lol
		box.addEventListener("keyup", async () => {
			await autosave(key, val); // i'm pretty sure the async and await don't actually do anything but i'm leaving it. As A Superstition.
		})
		return box;
	}

	static checkbox(key, val, prefix = "enable") {
		const cbox = dom.pp("", "input", null, { type: "checkbox", id: `${prefix}-${toCss(key)}`, checked: val })
		const l = dom.pp(prefix, "label", null, { for: `${prefix}-${toCss(key)}` });
		const span = dom.pp([cbox, l], "span");
		span.addEventListener("click", function () {
			autosave(`${prefix}-${key}`, cbox.checked);
		})
		return span;
	}

}
// make the objects for the global n fandom n stuff
var glob = new fandom("global"), fan = new fandom(document.querySelector(`#include_fandom_tags label`));
console.log(`fan: \n`, fan, `\nglob.cssName: ${glob.cssName}; fan.exists: ${fan.exists}`);
const isFandom = fandom.exists;
console.log(`isFandom: ${isFandom}`);


/* now for the tag id fetcher */
const navList = document.querySelector(`#main ul.user.navigation`);
const filtButt = dom.pp(dom.pp("Tag ID", "a"), "li"); // neither of them need the ids i'd given them before bc they're neither called on by their css selectors, nor are they necessary for exceptional styling

/* tag id fetcher function by flamebyrd */
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

/* add filters n stuff to currently-existing form */
const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete");
const advSearch = document.querySelector("#work_search_query");

//if there's one there will obvs be the other, but just so that they don't feel left out, using "or"
if (searchdt !== null || searchdd !== null) {
	// save the current tag id to local storage
	var add = [tagName, id];
	let str = new RegExp(`\\["${tagName}", "${id}"\\]`); // don't forget. those escape codes.
	var idStor = localStorage[`ids-${isFandom ? fan.cssName : glob.cssName}`];
	var idsObj = JSON.parse(idStor);
	console.log(`idsObj: `, idsObj);
	if (idStor.match(str) <= 0) { // if the current tag isn't part of the saved ids
		idsObj.push(add); // then add it to the array
		autosave(`ids-${isFandom ? fan.cssName : glob.cssName}`, JSON.stringify(idsObj)); // and save it to the local storage
	}
	// END of saving current tag id to local storage

	advSearch.hidden = true;
	const fakeSearch = dom.pp("", "input", null, { id: "fakeSearch", autocomplete: "off", value: localStorage["filter-advanced-search"] });
	fakeSearch.addEventListener("keyup", async () => {
		await autosave("filter-advanced-search", fakeSearch.value);
	})
	searchdd.appendChild(fakeSearch); // stick it after the search details n whatever

	// make the details drop-down with the sticky filters n stuff
	const details = dom.pp(dom.pp("Saved Filters", "summary"), "details", null, { id: "stickyFilters" }); // comes with the "Saved Filters" summary element already
	function makeFilter(obj) {
		return [dom.pp(`${obj.type} filters${obj.type == "fandom" ? ` <small>(${obj.name})</small>` : ""}:`, "label", null, { for: `${obj.type}Filters` }), fandom.box(obj.name, obj.filters), fandom.checkbox(obj.name, localStorage[`enable-${obj.cssName}`])]; // yes i crammed everything into one line. it makes the label, the textarea, and the checkmark and returns them in an array
	}
	const saveDiv = dom.pp(makeFilter(glob), "div");
	if (isFandom) {
		dom.appendix(makeFilter(fan), saveDiv);
	}
	details.appendChild(saveDiv);

	searchdt.insertAdjacentElement("beforebegin", details); // stick it in there
} else if (errorFlash) {
	debuggy("Double-check your filters for mistakes.");
} else {
	console.error(`lol idk you dun goof'd i guess`);
}

/* debugger textbozes */
function debuggy(t = "", par = header) {
	if (form) { form.hidden = true; } // hide the search form on the 0 results page

	const debugDiv = dom.pp("", "div", null, { id: "error_debug" }); // debugger 
	const p = dom.pp(t); // can't just put it straight in the debug div bc of ordering reasons
	const searchActions = dom.pp("", "ul", "actions", { id: "debugged-search" });
	if (noResults && !errorFlash) {
		const showFilters = dom.pp("Show All Filters", "a", null, { href: "#" });
		showFilters.addEventListener("click", function () {
			showAllFilters(debugDiv);
			showFilters.remove(); // remove this button after showing all the filters.
		});
		searchActions.appendChild(showFilters);
	} else if (errorFlash) {
		showAllFilters(debugDiv); // automatically show debug div on the error flash page
	}
	const reSearch = dom.pp("Search Again", "a", null, { href: `${currentTag.href}/works`});
	searchActions.appendChild(reSearch);
	
	par.insertAdjacentElement("afterend", debugDiv);
	debugDiv.insertAdjacentElement("afterend", searchActions);
	header.insertAdjacentElement("afterend", p);
}

/* function for showing all the filters */
function showAllFilters(parent) {
	for (const fnd of JSON.parse(localStorage[`saved fandoms`])) { 
		const f = new fandom(fnd);
		if (f.filters) {
			console.log(f);
			const contain = dom.pp([dom.pp(f.name, "label", null, { for: `debug-${f.cssName}` }),fandom.box(f.name, f.filters)], "div"); // makes a container per fandom
			parent.prepend(contain);  
		}
	}
}

/* make the tag ui */
function tagUI() {
	if (!document.querySelector(`#filter_opt`)) {

		// header
		const h4 = dom.pp("Autofilter Options", "h4", null, { id: "filter-heading" });
		const p = dom.pp(`<strong>Current tag</strong>: ${tagName}`);
	}
}

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
	.actions a:hover { cursor: pointer; }
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
	.prev-fandom span {
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