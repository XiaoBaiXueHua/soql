// ==UserScript==
// @name         Random Work
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.1
// @description  Redirects to a random work on an ao3 page
// @author       白雪花
// @match        *://*.archiveofourown.org/works?*
// @match        *://*.archiveofourown.org/users/*/works**
// @match        *://*.archiveofourown.org/users/*/bookmarks**
// @match        *://*.archiveofourown.org/collections/*/works**
// @match        *://*.archiveofourown.org/collections/*/bookmarks**
// @match        *://*.archiveofourown.org/tags/*/works**
// @match        *://*.archiveofourown.org/users/*/readings*show=to-read*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @downloadURL	 https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/random-work.js
// @updateURL	 https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/random-work.js
// @grant        none
// @history      fixed a bug that made it so that the random works were pulled only from the marked for later list. whoopsies.
// ==/UserScript==

const button = document.createElement("li"); // since it goes inside a ul.actions thing, it's just easier to make it a list item tbh
button.innerHTML = `<a href="#">Random Work</a>`;
button.addEventListener("click", randomWork);
document.querySelector(`#main ul.navigation.actions`).appendChild(button); // damn so apparently this element just exists on all the pages anyway regardless of whether you're logged in or not. 
// console.log(pageType);


let currPg = 1, pgCount = 1;
// first see if there are multiple pages in the paginator
try {
	pgCount = parseInt(document.querySelector(`ol.pagination li:nth-last-of-type(2)`).innerText); // if this succeeds, then we can move on
	// to subsequently try checking if we're currently on page 1
	try {
		currPg = parseInt(window.location.search.match(/\d+/)[0]);
	} catch (e) {
		console.log(`we are on page 1`);
	}
} catch (e) {
	console.log(`there are fewer than 21 works available to you rn.`);
}
let newPg = Math.ceil(Math.random() * pgCount); // gets a new random number btwn 1 and the max number of pages

// this might be redundant, since all it does is call on the loadRand function :/
function randomWork() {
	loadRand(newPg).then((opts) => {
		if (opts) {
			var newWork = opts[Math.floor(Math.random() * opts.length)].querySelector(`h4.heading a`); // picks a random work of the options given
			console.log(`new work:\n`, newWork);
			// const newLink = newWork.href;
			window.location = newWork.href; // just sends you there with no warning lol
		}
	})
}

async function loadRand(pgNum) {
	if (pgNum == currPg) {
		console.log(`oooo working with this current page`);
		return document.querySelectorAll(".blurb");
	} else {
		console.log(`to fetch: page ${pgNum}`);
	}
	const newURL = `${window.location.pathname}${window.location.search.replace(/page=\d+/, `page=${pgNum}`)}`; // relative paths babeyyyy
	console.log(`new url: ${newURL}`);
	const request = await fetch(newURL);
	if (request.ok) {
		const txt = await request.text();
		// need to do this so that we can query selector our blurbs
		const tmpDiv = document.createElement("div");
		tmpDiv.innerHTML = txt;
		const blurbs = document.querySelectorAll(".blurb");
		return blurbs;
	} else {
		alert(`Retry Later :(`);
		return false;
	}
}
