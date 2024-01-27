// ==UserScript==
// @name         floaty review box mod
// @namespace    saxamaphone
// @version      1.0
// @description  Adds a floaty review box. modified from [https://ravenel.tumblr.com/post/156555172141/i-saw-this-post-by-astropixie-about-how-itd-be]
// @author       白雪花
// @match        https://archiveofourown.org/works/*
// @exclude     *://archiveofourown.org/works/*/new
// @exclude     *://archiveofourown.org/works/*/edit
// @exclude     *://archiveofourown.org/works/new*
// @grant        none
// ==/UserScript==
'use strict';
//inspired by/modeled after https://ravenel.tumblr.com/post/156555172141/i-saw-this-post-by-astropixie-about-how-itd-be
//the localStorage parts are snipped from/modeled after https://greasyfork.org/en/scripts/395902-ao3-floating-comment-box

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
[onclick]:hover, #headerDiv > span, #floaty-root button:hover {
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
        bottom: 5vh;
	}
	#floaty-root textarea {
		max-height: 8em;
	}
	#floaty_review_box {
		position: fixed;
		top: 2vh;
		left: 2vw;
        z-index: 999;
        background-color: white;
        padding: 10px 5px;
        border: 1px solid black;
	}
}
`
const style = document.createElement("style");
style.innerText = floatyBoxStyle;
const header = document.querySelector("head");
header.appendChild(style);

const boxButton = document.createElement("li");
boxButton.id = "floaty_review_box";
boxButton.innerHTML = `<a onclick="document.getElementById('floaty_review_box').style.display='none';">Floaty Review Box</a>`;
//document.getElementById('floaty-root').hidden=false;
//this gets the navbar buttons up top
//the way jquery did it was by picking for a ul w/"work" class, since the only other thing w/"work" class is a td
const navList = document.getElementsByClassName("work")[0];
navList.prepend(boxButton);
//it turns out the whole thing's gotta be inside an event listener in order to work. god unbless.
navList.addEventListener("click", function floatybox() {
	var curURL = document.URL;
	//if the current url has a fragment, cut it off for the stored text indexing purposes
	if (curURL.includes("#")) {
		curURL = document.URL.slice(0, document.URL.indexOf("#"));
	}
	var newURL = curURL;
	//gets the real comment box
	const realBox = document.querySelector("textarea.comment_form");
	//creating the drag area outside of the general floatybox f'n so that i can add event listeners to it. i'm sure this will cause 0 performance issues whatsoever.
	const dragArea = document.createElement('div');
	dragArea.id = "drag-area";

	const box = document.createElement('div');
	const root = document.createElement('div');
	root.id = 'floaty-root';

	box.id = `floatyBox`;
	box.setAttribute("tabindex", 0);

	const headerDiv = document.createElement('div');
	headerDiv.id = "headerDiv";

	/* make the "FLOATY REVIEW BOX" label that you can click on to expand the box */
	const nambel = document.createElement('span');
	nambel.id = 'nambel';
	nambel.innerHTML = `Floaty Review Box`;
	nambel.addEventListener("click",
		function expandBox() {
			document.getElementById('otherButtons').hidden = false;
			document.getElementById('bootens').hidden = false;
			document.getElementById('commentBox').hidden = false;
		});
	nambel.setAttribute("for", "commentBox");
	headerDiv.appendChild(nambel);

	/* makes the closing x and shrinking dash */
	const buchner = document.createElement('div');
	buchner.id = "bootens";
	buchner.className = 'closeFloaty';
	const shrink = document.createElement('button');
	shrink.addEventListener("click", function shrinkBox() {
		document.getElementById('otherButtons').hidden = true;
		document.getElementById('bootens').hidden = true;
		document.getElementById('commentBox').hidden = true;
	});
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
	ins.addEventListener("click", async function insText() {
		const sel = window.getSelection().toString().trim();
		//makes sure there's smth actually selected before inserting the new line + italics
		//if want to change the newline from "/" to show newlines (which is there to save space n bc that's my preference when writing comments) to smth else, change `/` after the /g to `</em>\n<em>`
		var markup = sel ? `\n<em>${sel.replace(/\s{2,}/g, ` / `)}</em>` : "";
		console.log(markup);
		const tBox = document.getElementById("commentBox");
		//add the marked up selection to the textbox
		tBox.value += markup;
		await localStorage.setItem(newURL, tBox.value);
			var newCount = 10000 - document.getElementById("commentBox").value.length;
			document.getElementById("charCounter").innerHTML = `Characters left:&nbsp;${newCount}`;
	});
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
		realBox.value = commentBox.value;
		//updates character count
		var newCount = 10000 - document.getElementById("commentBox").value.length;
		document.getElementById("charCounter").innerHTML = `Characters left:&nbsp;${newCount}`;
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
		document.getElementById("floaty-root").hidden=true;
	});
});
