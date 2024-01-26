// ==UserScript==
// @name         floaty review box mod
// @namespace    saxamaphone
// @version      0.1
// @description  Adds a floaty review box. modified from [https://ravenel.tumblr.com/post/156555172141/i-saw-this-post-by-astropixie-about-how-itd-be]
// @author       You
// @match        https://archiveofourown.org/works/*
// @grant        none
// ==/UserScript==
'use strict';
const boxButton = document.createElement("li");
boxButton.id = "floaty_review_box";
boxButton.innerHTML = `<a onclick="document.getElementById('floaty-root').hidden=false;">Floaty Review Box</a>`;

//this gets the navbar buttons up top
//the way jquery did it was by picking for a ul w/"work" class, since the only other thing w/"work" class is a td
const navList = document.getElementsByClassName("work")[0];
console.log(navList);
navList.prepend(boxButton);

//inspired by/modeled after https://ravenel.tumblr.com/post/156555172141/i-saw-this-post-by-astropixie-about-how-itd-be
//the localStorage parts are snipped from/modeled after https://greasyfork.org/en/scripts/395902-ao3-floating-comment-box


//console.log(`newURL: ${newURL}`);


//this is the styling for the floaty review box bc i can't stand in-line css lol
var floatyBoxStyle = `
#floaty-root {
	box-sizing: border-box;
	z-index: 999;
	position: fixed;
	bottom: 10vh;
	right: 2vw;
	width: 800px;
	max-width: 45vw;
	background-color: #ffffff;
	opacity: 0.85;
	border: 1px solid black;
	padding: 4px;
}
#floaty-root *:not(button) {
	box-sizing: border-box;
}

#floaty-root textarea {
	resize: none;
	margin: 4px 0;
	min-height: 15em;
}
[onclick]:hover {
	cursor: pointer;
}
#floatyBox {
	display: flex;
	flex-direction: column;
}
#headerDiv {
	max-width: 750px;
	margin-bottom: 2px;
}
#headerDiv span {
	font-size: 1rem;
	margin-left: 10px;
}
#headerDiv .closeFloaty {
	float: right;
	margin-left: 4px;
}
#otherButtons {
	margin-bottom: 2px;
}
#otherButtons span {
	padding: 0.65em 0 0;
	font-size: 0.9em;
	position: absolute;
	bottom: calc(17em + 8px);
}
#otherButtons button {
	margin-right: 1em;
}

@media only screen and (max-width: 48em) {
	#floaty-root {
		max-width: 90vw;
	}
	#floaty-root textarea {
		max-height: 8em;
	}
}
`
const style = document.createElement("style");
style.innerText = floatyBoxStyle;
const header = document.querySelector("head");
header.appendChild(style);

const scpt = document.createElement("script");
scpt.innerHTML = `//these are the functions that let you open/close the floaty review box for Space
function dismiss(obj) {
	document.getElementById(obj).hidden = true;
}
function revive(obj) {
	document.getElementById(obj).hidden = false;
}
function shrinkBox() {
	dismiss('otherButtons');
    dismiss('bootens');
    dismiss('commentBox');
};
function expandBox() {
	revive('otherButtons');
    revive('bootens');
    revive('commentBox');
};
var curURL = document.URL;
//if the current url has a fragment, cut it off for the stored text indexing purposes
if (curURL.includes("#")) {
	curURL = document.URL.slice(0, document.URL.indexOf("#"));
}
var newURL = curURL;
async function insText() {const sel = window.getSelection().toString().trim();var markup = sel ? ' "<em>'+sel.replace(\/\\s{2,}\/g,' / ')+'</em>"' : '';const tBox = document.getElementById('commentBox');tBox.value += markup;await localStorage.setItem(newURL, tBox.value);}
`;
header.appendChild(scpt);

console.log(`document ready state: ${document.readyState}`);
//if (document.readyState == "complete") {
//gets the real comment box
const realBox = document.querySelector("textarea.comment_form");

//creating the drag area outside of the general floatybox f'n so that i can add event listeners to it. i'm sure this will cause 0 performance issues whatsoever.
const dragArea = document.createElement('div');
dragArea.id = "drag-area"
//dragArea.draggable = true;
function floatybox() {


	function updtCount() {
		var newCount = 10000 - document.getElementById("commentBox").value.length;
		document.getElementById("charCounter").innerHTML = `Characters left:&nbsp;${newCount}`;
	}


	const box = document.createElement('div');
	const root = document.createElement('div');
	root.id = 'floaty-root';
	root.hidden = true;

	box.id = `floatyBox`;
	box.setAttribute("tabindex", 0);

	const headerDiv = document.createElement('div');
	headerDiv.id = "headerDiv";

	/* make the "FLOATY REVIEW BOX" label that you can click on to expand the box */
	const nambel = document.createElement('span');
	nambel.id = 'nambel';
	//nambel.className = 'label';
	nambel.innerHTML = `Floaty Review Box`;
	nambel.setAttribute("onclick", "expandBox()");
	nambel.setAttribute("for", "commentBox");
	headerDiv.appendChild(nambel);

	/* makes the closing x and shrinking dash */
	const buchner = document.createElement('div');
	buchner.id = "bootens";
	buchner.className = 'closeFloaty';
	const shrink = document.createElement('button');
	shrink.setAttribute("onclick", "shrinkBox()");
	shrink.innerHTML = `&ndash;`;
	buchner.appendChild(shrink);
	headerDiv.appendChild(buchner);

	//header is part of the draggable area
	dragArea.appendChild(headerDiv);

	/* makes the text counter + insert selection button */
	const otherButtons = document.createElement('div');
	otherButtons.id = "otherButtons";
	//this span is the one with the #charCounter and the actual number
	const counter = document.createElement('span');
	counter.id = "charCounter";
	counter.innerHTML = "Characters left:&nbsp;10000";
	const ins = document.createElement('button');
	ins.className = "closeFloaty";
	ins.setAttribute("onclick", "insText();");
	ins.innerHTML = "Insert Selection";
	otherButtons.appendChild(ins);
	otherButtons.appendChild(counter);
	//changed otherButtons div from the form to the draggable area
	dragArea.appendChild(otherButtons);

	/* makes the textarea box */
	const commentBox = document.createElement('textarea');
	commentBox.id = 'commentBox';
	//this is the localStorage part from the second script
	commentBox.addEventListener("keyup", async () => {
		//saves the comment in local storage
		await localStorage.setItem(newURL, commentBox.value);
		//then adds the comment to the real comment box below
		//console.log(realBox);
		realBox.value = commentBox.value;
		//updates character count
		updtCount();
	});
	var savedText = localStorage.getItem(newURL);
	if (savedText) {
		commentBox.value = savedText;
	}

	box.appendChild(dragArea);
	box.appendChild(commentBox);

	root.appendChild(box);
	document.getElementById("main").appendChild(root);

	//when you click on the real comment box, the floaty one goes away, since this one currently doesn't have an x lmao
	//as things are right now, if for w/e reason you're typing more stuff into the real comment box n then close the tab/refresh the page, that progress doesn't get saved c':
	realBox.addEventListener("click", async () => {
		await dismiss("floaty-root");
	});

}

//for documentation purposes, this is the script for the insert text function that gets squished into one line
/**
 * //insert selection into textbox. also more or less from the script that gave us the save-comment-so-far
 * async function insText() {
 *   const sel = window.getSelection().toString().trim();
 *   //makes sure there's smth actually selected before inserting the new line + italics
 *	//if want to change the newline from "/" to show newlines (which is there to save space n bc that's my preference when writing comments) to smth else, change `/` after the /g to `</em>\n<em>`
 *   var markup = sel ? `\n<em>${sel.replace(/\s{2,}/g,` / `)}</em>` : "";
 *   console.log(markup);
 *   const tBox = document.getElementById("commentBox");
 *   //add the marked up selection to the textbox
 *   tBox.value += markup;
 *   await localStorage.setItem(newURL, tBox.value);
 *   updtCount();
 * }
*/
//async function insText() {const sel = window.getSelection().toString().trim();var markup = sel ? `\n<em>${sel.replace(/\s{2,}/g,` / `)}</em>` : "";const tBox = document.getElementById("commentBox");tBox.value += markup;await localStorage.setItem(newURL, tBox.value);updtCount();}


floatybox();
//}
