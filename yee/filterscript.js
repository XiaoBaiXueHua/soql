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
*:not(a, button) {box-sizing: border-box;}
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
	padding: 2px 0;
	margin-top: 5px;
	border-top: 1px solid white;
	border-bottom: 1px solid white;
}
#stickyFilters textarea {
	resize: none;
	scrollbar-width: thin!important;
	font-family: monospace;
	font-size: 9pt;
	max-height: 8em;
}
#stickyFilters label {
	font-weight: bold;
	font-size: 0.95em;
}
`;
const style = document.createElement("style");
style.innerHTML = css;
document.querySelector("head").appendChild(style);

const navList = document.querySelector("#main ul.user.navigation").firstElementChild;
console.log(navList);
navList.prepend(filtButt);

//this is the function that gets the tag id n spits it out as an <input> element
function nya() {
	const idOutput = document.createElement("input");
	idOutput.id = "id_output";
	const id = document.querySelector("#favorite_tag_tag_id").value;
	//thinking of having it automatically add the "filter_ids:" thing up front, but since it also applies to user_ids bc of the subscription method, should probably make it sensitive to this sort of thing
	idOutput.value = `${id}`;
	console.log(`window.path: ${window.location.pathname}`);
	navList.parentElement.append(idOutput);
};
//so it turns out that when you do event listeners, the function does not want the parentheses after it, just the name. that's fun. would've loved to know that.
filtButt.addEventListener("click", nya);

/* now to try to recreate the part of the script that differentiated fandom from global */ 
var TAG_OWNERSHIP_PERCENT = 70; //taken from the original; seems like a good metric tbh
var works = document.querySelector("#main.works-index");
var form = document.querySelector("form#work-filters");
//var fandomName = ;
function fandomName() {
	var fandom = document.querySelector("#include_fandom_tags label").innerText.trim();
	console.log(`fandom: ${fandom}`);
	const workNumberExtractor = /\(\d+\)/;
	const workNumber = fandom.match(workNumberExtractor);
	console.log(`workNumber: ${workNumber}`)
	//return fandom;
}
console.log("running the fandomName var now");
fandomName();
//console.log(document.querySelector("#include_fandom_tags label").innerText);




/* okay now for the part where i try to recreate the autofilter submission boxes */
//umm. find the "search w/in results" input box
const advSearch = document.querySelector("#work_search_query");
console.log("advSearch:");
console.log(advSearch);
//advSearch.hidden = true;

//now we hide the adv search
//const searchdt = document.querySelector("dt.search:not(.autocomplete)");
const searchdd = document.querySelector("dd.search:not(.autocomplete)");
//console.log(searchdt);
//searchdt.hidden = true;
//searchdd.hidden = true;




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
globalBox.value = "this is the global box";
const fanLab = document.createElement("label");
fanLab.innerHTML = "Fandom:";
fanLab.setAttribute("for","fandomFilters");
const fandomBox = document.createElement("textarea");
fandomBox.id = "fandomFilters";
fandomBox.value = "this is the fandom box";
//put these elements together n then append them after the other adv search options
saveDiv.append(globLab, globalBox, fanLab, fandomBox);
det.append(summary, saveDiv);
//const moreOpt = document.querySelector("dt.language");
searchdd.appendChild(det);
console.log(searchdd);

//actually it'd be kind of nice to have a thing that'll let you pick a sorting order too, except this time you have the choice to invert it