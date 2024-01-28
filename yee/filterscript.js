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

const filtButt = document.createElement("button");
filtButt.id = "get_id_butt";
filtButt.innerHTML = `<a id="id_butt" onclick="console.log(document.querySelector('#favorite_tag_tag_id').value);">Tag ID</a>`;

//const borderHover = window.getComputedStyle(document.querySelector(".actions a:hover")).borderTop;
//const bxShad = window.getComputedStyle(document.querySelector(".actions a:hover")).boxShadow;
//for now, rather than use js to get the colors (to match w/the skins ofc), go w/default. is tragic but it's what ao3 gets for not using :root and vars in their css
const css = `
*:not(a, button, #id_output, .current) {box-sizing: border-box;}
#id_butt {margin:0; padding: 0; background: none; border: none;}
#id_butt:hover, #id_butt:focus, #id_butt:active {background: none; box-shadow: none; outline: none;}
#get_id_butt {margin-right: 8px;}
#get_id_butt:hover, #get_id_butt:focus, #get_id_butt:active {
	border-top: 1px solid #999;
	border-left: 1px solid #999;
	box-shadow: inset 2px 2px 2px #bbb;
	outline: 1px dotted;
}
#id_output {display: block;}
#stickyFilters {
	margin-top: 5px;
}
#stickyFilters summary {
	padding: 3px 0;
	border-top: 1px solid white;
	border-bottom: 1px solid white;
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
@media only screen and (max-width: 48em) {
	#error_debug > div {
		width: 98%;
	}
}
`;
const style = document.createElement("style");
style.innerHTML = css;
document.querySelector("head").appendChild(style);

const navList = document.querySelector("#main ul.user.navigation").firstElementChild;
navList.prepend(filtButt);

//this is the function that gets the tag id n spits it out as an <input> element
function nya() {
	const idOutput = document.createElement("input");
	idOutput.id = "id_output";
	const id = document.querySelector("#favorite_tag_tag_id").value;
	//thinking of having it automatically add the "filter_ids:" thing up front, but since it also applies to user_ids bc of the subscription method, should probably make it sensitive to this sort of thing
	idOutput.value = `${id}`;
	//console.log(`window.path: ${window.location.pathname}`);
	navList.parentElement.append(idOutput);
};
//so it turns out that when you do event listeners, the function does not want the parentheses after it, just the name. that's fun. would've loved to know that.
filtButt.addEventListener("click", nya);

/* now to try to recreate the part of the script that differentiated fandom from global */ 
var TAG_OWNERSHIP_PERCENT = 70; //taken from the original; seems like a good metric tbh
var works = document.querySelector("#main.works-index");
var form = document.querySelector("form#work-filters");

var fandomName = function () {
	var fandom = document.querySelector("#include_fandom_tags label");
	if (!fandom) {return null;}; //if there's no fandom (like, for example, on the error page), just stop
	fandom = fandom.innerText.trim();
	//this extracts the number of works as long as it's in parentheses
	var workNumberExtractor = /\(\d+\)/;
	//has to be turned into a string for some reason
	var fandomCount = fandom.match(workNumberExtractor).toString();
	//this chops off the parentheses lol
	fandomCount = fandomCount.substring(1, fandomCount.length-1);
	//now it's back to a number
	fandomCount = parseInt(fandomCount);
	console.log(`fandomCount: ${fandomCount}`)
	//okay. so. it wants to remove any word or number between parentheses, accommodating for ampersands as well. this applies globally too so like. i hope no fandoms have parentheses in their names lol
	const parenRem = /\((\w+(\s|&)*|\d+\s?)+\)/g;
	fandom = fandom.replace(parenRem,"").trim();
	console.log(`fandom: ${fandom}`);

	//okay now to basically do all that but for non-fandom_ids 
	var tagCount = document.querySelector("h2:has(a.tag)").innerText.trim();
	console.log(`tagCount: ${tagCount}`);
	//this gets the number of works in that particular tag we're looking at rn. need that capital W bc "xxx Works in yz tag"
	workNumberExtractor = /\d+,?\d*\sW/;
	tagCount = tagCount.match(workNumberExtractor).toString();
	//stupid thing wants me to remove the comma too, so that's why the replace is tacked on at the end >_>
	tagCount = tagCount.substring(0, tagCount.length-2).replace(",","");
	//now it's back to a number
	tagCount = parseInt(tagCount);
	console.log(`tagCount: ${tagCount}`);
	//if for some reason, these numbers don't exist, just stop
	if (!fandom || !fandomCount || !tagCount) {return;};
	//if a fandom has more than a (currently set to 70%) share of a particular tag, then we're in that fandom
	return (fandomCount / tagCount * 100 > TAG_OWNERSHIP_PERCENT) ? fandom : null;
}();
//have to have the () at the end in order to, like, Actually get the fandom name

globalKey = "filter-global";
globalFilter = localStorage[globalKey];
fandomKey = `filter-${fandomName}`; //yeah keep "filter-null" i don't see why not
fandomFilter = localStorage[fandomKey];


/* okay now for the part where i try to recreate the autofilter submission boxes */
//find the "search w/in results" input box
const advSearch = document.querySelector("#work_search_query");

//now we hide the adv search
//const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete)");
//console.log(searchdt);
//searchdt.hidden = true;
//searchdd.hidden = true;

//if you fucked up the input for the saved filters, show all saved filters for double-checking; otherwise, proceed as normal
if (!searchdd) {
	const errorFlash = document.querySelector("div.flash.error")
	if (errorFlash) {
		const debugDiv = document.createElement("div");
		debugDiv.id = "error_debug";
		const ohno = document.createElement("p");
		ohno.innerHTML = "oh no! you did a fucky-wucky with the advanced search input :( double-check all your filters to make sure you didn't make any mistakes!";
		var filterArray = Object.entries(localStorage);
		for (const [key, value] of filterArray) {
				console.log(`key: ${key}: ${value}`);
				cssId = key.replaceAll(/\W+/g,"-");
			const div = document.createElement("div");
			div.id = `${cssId}-div`;
			const label = document.createElement("label");
			label.innerHTML = key.replace("filter-", "");
			label.setAttribute("for", cssId);
			const textarea = document.createElement("textarea");
			console.log(cssId);
			textarea.id = cssId;
			textarea.value = value;
			//not much point to adding a debug w/o the autosave event listener!!
			textarea.addEventListener("keyup", async () => await localStorage.setItem(key, textarea.value));

			div.appendChild(label);
			div.appendChild(textarea);
			debugDiv.appendChild(div);
		}
		document.querySelector("div.flash:not(.error)").appendChild(ohno);
		document.querySelector("div.flash:not(.error)").appendChild(debugDiv);
	}
}
else {
	//create the details drop for the saved filters; give them their relevant ids for later
	const det = document.createElement("details");
	det.id = "stickyFilters";
	console.log(det);
	const summary = document.createElement("summary");
	summary.innerHTML = "Saved Filters";
	const saveDiv = document.createElement("div");
	const globLab = document.createElement("label");
	globLab.innerHTML = "Global:";
	globLab.setAttribute("for","globalFilters");
	const globalBox = document.createElement("textarea");
	globalBox.id = "globalFilters";
	globalBox.value = globalFilter ? globalFilter : "";
	//put these elements together n then append them after the other adv search options
	saveDiv.append(globLab, globalBox);
	//check if this is a fandom-specific tag before making the fandom filters box
	if (fandomName) {
		const fanLab = document.createElement("label");
		fanLab.innerHTML = `Fandom <small>(${fandomName})</small>:`;
		fanLab.setAttribute("for","fandomFilters");
		const fandomBox = document.createElement("textarea");
		//give the fandom textarea an id dependent on the fandom so that perhaps later when doing the debugger syntax error screen thing, the event listeners for the autosave each have their own ids to listen to. anyway the regexp replaces all non-word chars with "-" for css compatibility
		var cssFanName = fandomName.replaceAll(/\W+/g,"-");
		console.log(`cssFanName: ${cssFanName}`);
		fandomBox.id = `filter-${cssFanName}`;
		fandomBox.value = fandomFilter ? fandomFilter : "";
		//fandomBox.value = "this is the fandom box";
		saveDiv.append(fanLab, fandomBox);
		//add the autosave function
		fandomBox.addEventListener("keyup", async () => {await localStorage.setItem(fandomKey, fandomBox.value)});
	}
	det.append(summary, saveDiv);
	searchdd.appendChild(det);
}

//console.log(searchdd);
//add the event listeners for the autosaving the filters
globalBox.addEventListener("keyup", async () => {await localStorage.setItem(globalKey,globalBox.value)});


//actually it'd be kind of nice to have a thing that'll let you pick a sorting order too, except this time you have the choice to invert it