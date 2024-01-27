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
`;
const style = document.createElement("style");
style.innerHTML = css;
document.querySelector("head").appendChild(style);

const navList = document.querySelector("#main ul.user.navigation").firstElementChild;
console.log(navList);
navList.prepend(filtButt);

filtButt.addEventListener("click", function nya() {
	const idOutput = document.createElement("input");
	idOutput.id = "id_output";
	const id = document.querySelector("#favorite_tag_tag_id").value;
	idOutput.value = id;
	navList.parentElement.append(idOutput);
})