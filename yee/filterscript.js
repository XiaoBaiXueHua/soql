// ==UserScript==
// @name filterscript
// @namespace saxamaphone
// @description rewriting that thing
// @match     http*://archiveofourown.org/tags/*/works*
// @match     http*://archiveofourown.org/works?work_search*
// @match     http*://archiveofourown.org/works?commit=*&tag_id=*
// @version 1.0
// @grant        none
// @run-at	  document-end
// ==/UserScript==

/* saved filters current fandom checker */
var TAG_OWNERSHIP_PERCENT = 70; //taken from the original; will need to study how fandom names are standardized to improve sensitivity
var works = document.querySelector("#main.works-index");
var form = document.querySelector("form#work-filters");

//this is necessary for working w/true-false values in localstorage

var fandomName = function () {
	var fandom = document.querySelector("#include_fandom_tags label");
	if (!fandom) { return null; }; //if there's no fandom (like, for example, on the error page), just stop
	fandom = fandom.innerText.trim();
	//this extracts the number of works as long as it's in parentheses
	var workNumberExtractor = /\(\d+\)/;
	//has to be turned into a string for some reason
	var fandomCount = fandom.match(workNumberExtractor).toString();
	//this chops off the parentheses lol
	fandomCount = fandomCount.substring(1, fandomCount.length - 1);
	//now it's back to a number
	fandomCount = parseInt(fandomCount);
	//okay. so. it wants to remove any word or number between parentheses, accommodating for ampersands as well. this applies globally too so like. i hope no fandoms have parentheses in their names lol
	//anyway the reason that the disambiguator part of the fandom tag name is getting cut off is for jjk situations, where for w/e reason the anime n manga aren't considered related fandoms and will therefore get filtered out in crossover:false, but if you care enough abt that sort of fandom, you'll probably end up checking both tags. because the local storage is otherwise sensitive to the disambiguator, you'd have to plug in and update the same filters TWICE for both tag variants otherwise.
	const parenRem = /\((\w+(\s|&)*|\d+\s?)+\)/g;
	fandom = fandom.replace(parenRem, "").trim();
	//just realized we'll probably also want to remove "all media types", but that can be a project for another day
	//fandom = fandom.replace(/-\sall\smedia\stypes/i,"").trim();

	//okay now to basically do all that but for non-fandom_ids 
	var tagCount = document.querySelector("h2:has(a.tag)").innerText.trim();
	//this gets the number of works in that particular tag we're looking at rn. need that capital W bc "xxx Works in yz tag"
	workNumberExtractor = /\d+,?\d*\sW/;
	tagCount = tagCount.match(workNumberExtractor).toString();
	//stupid thing wants me to remove the comma too, so that's why the replace is tacked on at the end >_>
	tagCount = tagCount.substring(0, tagCount.length - 2).replace(",", "");
	//now it's back to a number
	tagCount = parseInt(tagCount);
	//if for some reason, these numbers don't exist, just stop
	if (!fandom || !fandomCount || !tagCount) { return; };
	//if a fandom has more than a (currently set to 70%) share of a particular tag, then we're in that fandom
	return (fandomCount / tagCount * 100 >= TAG_OWNERSHIP_PERCENT) ? fandom : null;
}();
//also need a css-friendly fandom name
const cssFanName = fandomName ? fandomName.replaceAll(/\W+/g, "-") : null; //the null is to let the error page debug work

var tagName = function () {
	var tag = document.querySelector("h2.heading a.tag").innerHTML;
	tag = tag.replace(/\((\w+\s?)+\)/, "").trim();
	return tag;
}();

/* make the filter id button */
const filtButt = document.createElement("li");
filtButt.id = "get_id_butt";
filtButt.innerHTML = `<a id="id_butt" onclick="console.log(document.querySelector('#favorite_tag_tag_id').value);">Tag ID</a>`;
const navList = document.querySelector("#main ul.user.navigation").firstElementChild;
navList.prepend(filtButt);

//const borderHover = window.getComputedStyle(document.querySelector(".actions a:hover")).borderTop;
//const bxShad = window.getComputedStyle(document.querySelector(".actions a:hover")).boxShadow;
//for now, rather than use js to get the colors (to match w/the skins ofc), go w/default. is tragic but it's what ao3 gets for not using :root and vars in their css
const optWidth = window.getComputedStyle(document.querySelector("#main ul.user.navigation.actions")).width;
const hoverShad = window.getComputedStyle(document.querySelector("form#work-filters fieldset")).boxShadow;
const hoverLine = window.getComputedStyle(document.querySelector(".actions input")).borderColor;
const css = `
#main *:not(a, #id_output, button, .current) {box-sizing: border-box;}
#get_id_butt {margin-right: 8px;}
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
#stickyFilters textarea, #error_debug textarea {
	resize: none;
	scrollbar-width: thin!important;
	font-family: monospace;
}
#stickyFilters textarea {
	min-height: 8em;
}
#stickyFilters label, #error_debug label {
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
#error_debug {
	display: flex;
	flex-wrap: wrap;
}
#error_debug > div {
	width: 30%;
	margin: 10px 1%;
}
#error_debug textarea {
	font-size: 9pt;	
}
#filter_opt {
	display: block; 
	float: right;
	max-width: 100%; 
	width: ${parseInt(optWidth)}px;
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
#tag_actions {
	width: 100%; 
	margin: 5px 0 0;
	display: flex;
	flex-wrap: wrap;
}
#tag_actions .appended-tag {
	font-size: 0.9em;
	display: block;
	margin-bottom: 0;
}
#tag_actions > div {
	width: 50%;
}
.filter-box-label {display: block;}
.prev-search p {padding-left:45px;}
.prev-search p strong {text-transform: capitalize;}
.prev-search summary {font-size: 1.15em;}
.prev-search span {font-family: monospace; font-size: 8pt;}
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
	#error_debug > div {
		width: 98%;
	}
}
`;
const style = document.createElement("style");
style.innerHTML = css;
document.querySelector("head").appendChild(style);

console.log(`tag name: ${tagName}`);
//have to have the () at the end in order to, like, Actually get the fandom name

//the local storage keys
globalKey = "filter-global";
globalFilter = localStorage[globalKey];
fandomKey = `filter-${fandomName}`;
fandomFilter = localStorage[fandomKey];

/* okay now for the part where i try to recreate the autofilter submission boxes */
//find the "search w/in results" input box
const advSearch = document.querySelector("#work_search_query");

//now we hide the adv search
const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete)");

//because global filters should always show, they get to be on a higher level
const globLab = document.createElement("label");
globLab.className = "filter-box-label";
globLab.innerHTML = "Global:";
globLab.setAttribute("for", "globalFilters");
const globalBox = document.createElement("textarea");
globalBox.id = "globalFilters";
globalBox.value = globalFilter ? globalFilter : "";
//autosave
globalBox.addEventListener("keyup", async () => { await localStorage.setItem(globalKey, globalBox.value) });
//enable/disable checkbox
function checkbox(label, thing) {
	thing ? thing : "enable";
	const cbox = document.createElement("input");
	cbox.setAttribute("type", "checkbox");
	cbox.id = `${thing}-${label}`;
	const lib = document.createElement("label");
	lib.setAttribute("for", `${thing}-${label}`);
	lib.innerHTML = thing;
	var span = document.createElement("span");
	span.append(cbox, lib);
	return span;
};
const globCheck = checkbox("global", "enable");
function saveCheck(name, box) {
	//check if the fandom filters have been saved as enabled
	var checkk = localStorage.getItem(`enable-${name}`);
	if (!checkk) {
		//by default is on
		box.firstChild.checked = true;
		localStorage.setItem(`enable-${name}`, box.firstChild.checked);
		box.addEventListener("click", function () {
			localStorage.setItem(`enable-${name}`, box.firstChild.checked);
		})
	} else {
		box.firstChild.checked = JSON.parse(checkk);
		localStorage.setItem(`enable-${name}`, box.firstChild.checked);
		box.addEventListener("click", function () {
			localStorage.setItem(`enable-${name}`, box.firstChild.checked);
		})
	}
}
saveCheck("global", globCheck);


//if you fucked up the input for the saved filters, show all saved filters for double-checking; otherwise, proceed as normal
if (!searchdt) {
	const errorFlash = document.querySelector("div.flash.error")
	if (errorFlash) {
		const debugDiv = document.createElement("div");
		debugDiv.id = "error_debug";
		const ohno = document.createElement("p");
		ohno.innerHTML = "Double-check your filters for mistakes.";
		var filterArray = Object.entries(localStorage);
		for (const [key, value] of filterArray) {
			console.log(`saved ${key}: ${value}`);
			//if the localStorage thing doesn't start with "filter-", then don't do anything w/it
			if (key.toString().startsWith("filter-")) {
				cssId = key.replaceAll(/\W+/g, "-");
				const div = document.createElement("div");
				div.id = `${cssId}-div`;
				const label = document.createElement("label");
				label.innerHTML = key.replace("filter-", "");
				label.setAttribute("for", cssId);
				const textarea = document.createElement("textarea");
				textarea.id = cssId;
				textarea.value = value;
				//not much point to adding a debug w/o the autosave event listener!!
				textarea.addEventListener("keyup", async () => await localStorage.setItem(key, textarea.value));

				div.appendChild(label);
				div.appendChild(textarea);
				debugDiv.appendChild(div);
			}
		}
		document.querySelector("div.flash:not(.error)").appendChild(ohno);
		document.querySelector("div.flash:not(.error)").appendChild(debugDiv);
	}
} else {
	//create fake search w/in results box
	const fakeSearch = document.createElement("input");
	fakeSearch.id = "fakeSearch";
	fakeSearch.value = localStorage["filter-advanced-search"]?localStorage["filter-advanced-search"]:"";
	fakeSearch.addEventListener("keyup", async () => {
		await localStorage.setItem("filter-advanced-search", fakeSearch.value);
	});
	fakeSearch.setAttribute("autocomplete", "off");
	//create the details drop for the saved filters; give them their relevant ids for later
	const det = document.createElement("details");
	det.id = "stickyFilters";
	const summary = document.createElement("summary");
	summary.innerHTML = "Saved Filters";
	const saveDiv = document.createElement("div");
	//append the global box + label
	saveDiv.append(globLab, globalBox, globCheck);
	//check if this is a fandom-specific tag before making the fandom filters box
	if (fandomName) {
		const line = document.createElement("hr");
		const fanLab = document.createElement("label");
		fanLab.innerHTML = `Fandom <small>(${fandomName})</small>:`;
		fanLab.setAttribute("for", "fandomFilters");
		fanLab.className = "filter-box-label";
		const fandomBox = document.createElement("textarea");
		//fandomBox.id = `filter-${cssFanName}`;
		fandomBox.id = "fandomFilters";
		fandomBox.value = fandomFilter ? fandomFilter : "";
		const fanCheck = checkbox(cssFanName, "enable");
		saveDiv.append(line, fanLab, fandomBox, fanCheck);
		//add the autosave function
		fandomBox.addEventListener("keyup", async () => { await localStorage.setItem(fandomKey, fandomBox.value) });
		saveCheck(cssFanName, fanCheck);
	}
	det.append(summary, saveDiv);
	advSearch.hidden = true;
	searchdt.insertAdjacentElement("beforebegin",det);
	searchdd.appendChild(fakeSearch);
	//searchdd.appendChild(det);
};

/* vars for whether the filters are enabled or not*/
const g_enable = JSON.parse(localStorage["enable-global"]);
const f_enable = fandomName ? JSON.parse(localStorage[`enable-${cssFanName}`]) : false;
const g_val = globalBox.value;
const f_val = fandomName ? document.getElementById("fandomFilters").value : false;

/* display tag id */

//this is the function that gets the tag id n spits it out as an <input> element
function nya() {
	//don't do anything if there's already a thing
	if (!document.querySelector("#filter_opt")) {
		//add in like an options dropdown for the filer id number
		const filterOpt = document.createElement("fieldset");
		filterOpt.id = "filter_opt";
		const fil = document.createElement("div");
		const idOutput = document.createElement("input");
		idOutput.id = "id_output";
		//multiple ways to get an id: fave tag id (logged-in only), -> rss feed -> freeform ids (only happens when logged out bc they don't have rss feeds) -> subscribable id (this gets user/story ids)
		var id = function () {
			if (document.querySelector("#favorite_tag_tag_id").value) {
				console.log("favorite tag id method")
				return document.querySelector("#favorite_tag_tag_id").value;
			} else if (document.querySelector("a.rss")) {
				console.log("rss feed method");
				var href = document.querySelector("a.rss");
				href = href.getAttribute("href");
				var regex = /\d+/;
				href = href.match(regex);
				return href;
			} else if (document.querySelector("input [name='work_search [freeform_ids][]']:first")) {
				return document.querySelector("input [name='work_search [freeform_ids][]']:first").value;
			} else if (document.querySelector("#subscription_subscribable_id")) {
				return document.querySelector("#subscription_subscribable_id").value;
			} else {
				alert("can't find tag id :C")
			}
		}();
		const label = document.createElement("label");
		label.innerHTML = "filter_ids:";
		label.setAttribute("for", "id_output");
		idOutput.value = `${id}`;

		const buttonAct = document.createElement("div");
		buttonAct.id = "tag_actions";
		const excl = document.createElement("div");
		const exclB = document.createElement("button");
		exclB.innerHTML = "Exclude Tag";
		excl.appendChild(exclB);
		const incl = document.createElement("div");
		const inclB = document.createElement("button");
		inclB.innerHTML = "Include Tag";
		incl.appendChild(inclB);

		//at this point we should have a var for the filter
		filter = `filter_ids:${id}`;
		function addFilt(v, t, par) {
			//first check if the value's been added already
			let doubleck = new RegExp(`\\D${id}\\D`, "g");
			filt = fandomName ? document.querySelector("#fandomFilters") : document.querySelector("#globalFilters");
			const para = document.createElement("p");
			para.className = "appended-tag";
			var type = t==excl?true:false;
			if (filt.value.match(doubleck)) {
				para.innerHTML = `${tagName} is already being filtered!`; //later make it so that picking the opposite button will automatically switch in the autofilters
			} else { 
				filt.value += ` ${type?"-":""}${v}`; 
				para.innerHTML = `Now filtering ${type?"out":"for"} ${tagName}.`
			}
			par.appendChild(para);
		};
		exclB.addEventListener("click", async () => {
			addFilt(filter, excl, buttonAct);
			//can't tell which one is gonna be changed here, so just do both
			await localStorage.setItem(fandomKey, document.querySelector("#fandomFilters").value);
			await localStorage.setItem(globalKey, document.querySelector("#globalFilters").value);
		});
		inclB.addEventListener("click", async () => {
			addFilt(filter, incl, buttonAct);
			await localStorage.setItem(fandomKey, document.querySelector("#fandomFilters").value);
			await localStorage.setItem(globalKey, document.querySelector("#globalFilters").value);
		});

		//append all the things yeah
		buttonAct.append(excl, incl);
		fil.append(label, idOutput);
		filterOpt.append(fil, buttonAct);
		//navList.parentElement.appendChild(filterOpt);
		navList.parentElement.parentElement.insertAdjacentElement("afterend",filterOpt);
	}
};
//so it turns out that when you do event listeners, the function does not want the parentheses after it, just the name. that's fun. would've loved to know that.
filtButt.addEventListener("click", nya);

/* form submit time */
function submission() {
	var globeSub = g_enable?g_val:"";
	var fanSub = "";
	//first check if this is a fandom-specific tag
	if (document.querySelector("#fandomFilters")) {
		//then check if it's even enabled
		if(f_enable) {
			fanSub = f_val;
		} 
	};
	var tempSub = localStorage["filter-advanced-search"];
	advSearch.value = `${globeSub} ${fanSub} ${tempSub}`;
	advSearch.value = advSearch.value.trim();
}
form.addEventListener("submit", submission)

/* autosubmit + previous filters drop */
var search_submit = window.location.search;
//autofilter when at raw tags
if (search_submit == "") {
	//at least one of these must be enabled before autosubmit runs
	if(g_enable || f_enable) {
		//since they're on by default, also check that they have values
		if(g_val || f_val) {
			submission();
			form.submit();
		}
	}
} else {
	function filterloop(key, parent) {
		console.log(`key: ${key}`);
		if (localStorage[`filter-${key}`]) {
			const prevP = document.createElement("p");
			//var cssKey = key.replaceAll(/\S+/g,"-");
			prevP.className = `prev-${key.replaceAll(/\W+/g,"-")}`;
			prevP.innerHTML = `<strong>${key.replaceAll(/-/g," ").trim()} Filters:</strong></br><span>${localStorage[`filter-${key}`]}</span>`;
			parent.appendChild(prevP);
		}
	}
	const header = document.querySelector("h2.heading");
	const details = document.createElement("details");
	details.className = "prev-search";
	const dropSummary = document.createElement("summary");
	dropSummary.innerHTML = "<strong>FILTERS:</strong>";
	details.appendChild(dropSummary);
	if (localStorage["filter-advanced-search"]) {
		filterloop("advanced-search", details);
	};
	if (g_enable) {
		filterloop("global", details);
	};
	if (f_enable) {
		filterloop(fandomName, details);
	};
	header.insertAdjacentElement("afterend", details);
	localStorage.setItem("filter-advanced-search", "");
};

//actually it'd be kind of nice to have a thing that'll let you pick a sorting order too, except this time you have the choice to invert it