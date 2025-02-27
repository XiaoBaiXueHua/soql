// ==UserScript==
// @name         AO3 Chapter Drop-Downs
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.1
// @description  Shows a details drop-down underneath the stats of a work blurb on every page that shows works or bookmarks. and also adds a mark as read button to work indexes with marked for later items
// @author       白雪花
// @match        https://archiveofourown.org/**
// @exclude      https://archiveofourown.org/works/*/bookmarks
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/chapterdrop.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/chapterdrop.js
// @grant        none
// ==/UserScript==

function showChapters() {
	const works = document.querySelectorAll(`li[id^="work_"], li[id^="bookmark_"]`);
	// bc i'm too lazy to figure out the exact regex to make this work wherever there are works and bookmarks listed, just make it check if there Are works being listed on the current page. and if there aren't, then don't do anything
	console.debug(`works: `, works);
	// const readHistory = document.querySelector(`.reading`); // only need to run this once
	if (works.length > 0) {
		// console.log(`on reading page: ${readHistory}`);

		for (const work of works) {
			console.debug(`class list: `, work.classList);
			// console.debug(`includes "own": ${work.classList.includes("own")}`)
			const chStr = work.querySelector("dd.chapters a"); // only get the multichapters

			let marked = -1;
			try {
				marked = work.querySelector(`h4.viewed.heading`).innerText.search(/marked\sfor\slater/i); // 
			} catch (e) {
				// have to do it this way bc we're literally tagging along the chapter dropdown script atm bc i STILL CANNOT BE ASSED TO MAKE AN EXTENSION PROPER
			}
			let workLink = "", workId = "";
			try {
				workLink = work.querySelector(`h4.heading a:not([rel~="author"])`).href; // ensures we actually get the work link when also working w/bookmarks
				workId = workLink.match(/\d+/)[0];
			} catch (e) {
				// have to do it this way so that we can continue to work smoothly when there's, like, a mystery or deleted work in the bookmarks
			}

			if (chStr && workId) {
				// const workId = work.id.match(/\d+/)[0]; // this doesn't work on bookmarks
				console.log(`chStr (${chStr}) && workId: ${workId}`);
				fetchNav(workId).then(function (chs) { // returns array of list items
					// console.debug(`chs: `, chs);
					const numChapters = chs.length;
					if (numChapters > 0) {
						//console.log(chs);
						const chapterDrop = document.createElement("details");
						chapterDrop.className = "chapterDrop";
						const chaptersSummary = document.createElement("summary");
						chaptersSummary.innerHTML = "<strong>Chapters</strong>";
						chapterDrop.appendChild(chaptersSummary);
						const chapterList = document.createElement("ol");
						const subDrop = document.createElement("details");
						const subSummary = document.createElement("summary");
						subSummary.innerHTML = `${numChapters - 4} more chapters.`;
						subDrop.appendChild(subSummary);
						for (var i = 0; i < numChapters; i++) {
							const ch = chs[i];
							ch.setAttribute("chapter-number", i + 1);
							const link = ch.querySelector("a");
							link.innerHTML = removeNumber(link.innerHTML.trim());
							if (i > 1 && i < numChapters - 2) {
								// if the current chapter is more than 2 but not of the last two, then append it to the smaller details
								// console.log(`chapter: ${i+1}`);
								subDrop.appendChild(ch);
							} else {
								if (i == numChapters - 2 && numChapters > 4) {
									chapterList.appendChild(subDrop);
								}
								chapterList.appendChild(ch);
							}
						}
						chapterDrop.appendChild(chapterList);
						// work.appendChild(chapterDrop); // change this to make the details drop get appended After the stats specifically, so that it works w/the bookmarks page n stuff
						work.querySelector("dl.stats").insertAdjacentElement("afterend", chapterDrop); // appends it after the stats to make it work w/bookmarks
					}
				})
			}
			if (marked >= 0) {
				// console.log(`marked for later`);
				// const markAs = `/works/${workId}/mark_as_read`;
				const markAs = document.createElement(`li`); // makes the "Mark as Read" list item
				markAs.innerHTML = `<a href="/works/${workId}/mark_as_read">Mark as Read</a>`;

				work.querySelector(`h4.viewed + .actions`).insertAdjacentElement("afterbegin", markAs); // slips the new mark as read button into the actions list
			}
			// now do the thing for 
		}
		css(); // styles everything
	}
}

function removeNumber(str) {
	return str.replace(/\d+\.\s/, "");
} // since this only gets used in one place. could probably just remove this lol

async function fetchNav(id) {
	const reqIndex = await fetch(`/works/${id}/navigate`);
	if (reqIndex.ok) {
		const txt = await reqIndex.text();
		const tmpDiv = document.createElement("div"); // makes temp div
		tmpDiv.innerHTML = txt;
		try {
			const chs = tmpDiv.querySelectorAll("ol.chapter li");
			return chs;
		} catch (e) {
			console.error(`whadda hell.`);
		}
	}
}

function css() {
	// const bgColor = window.getComputedStyle(document.body).backgroundColor;
	// const ownColor = function () {
	// 	let c = bgColor;
	// 	try {
	// 		c = window.getComputedStyle(document.querySelector(".own.work.blurb")).backgroundColor;
	// 	} catch (e) { 
	// 		console.log("none of these works are yours.");
	// 	}
	// 	return c;
	// }()
	// 	const root = `
	// :root {
	// 	--background-color: ${bgColor};
	// 	--own-color: ${ownColor};
	// }` // this is a separate variable so that i don't have to be always checking to make sure i'm not overwriting the root when copy-pasting lol
	const stylesheet = `
.chapterDrop {
  display: block;
  width: 100%;
  margin: 0.5em auto;
}
.chapterDrop::before {
  content: "";
  display: block;
  clear: both;
  border-bottom: 1px solid;
  padding-top: 0.5em;
  margin-bottom: 0.5em;
}
.chapterDrop[open] {
  margin-bottom: 1em;
}
.chapterDrop ol li {
  display: list-item;
  list-style: none;
}
.chapterDrop ol li::before {
  content: attr(chapter-number) ". ";
  display: inline-block;
  padding-right: 0.5em;
  width: 2em;
  text-align: right;
  vertical-align: top;
}
.chapterDrop ol li details {
  display: inline-table;
  width: calc(100% - 2.5em);
}
.chapterDrop ol li h4.heading {
  display: inline;
}
.chapterDrop ol li .datetime {
  position: relative;
  top: 0;
  float: right;
}
.chapterDrop ol > details summary {
  position: sticky;
  top: 0;
  background-color: inherit;
  z-index: 1;
  transition-duration: 0.5s;
}
.chapterDrop ol > details summary::before {
  content: "Show ";
}
.chapterDrop ol > details[open] summary {
  padding-left: 25%;
  transition: 0.5s;
}
.chapterDrop ol > details[open] summary::before {
  content: "Hide ";
}`;
	const style = document.createElement("style");
	// style.innerText = root + stylesheet;
	style.innerText = stylesheet;
	document.querySelector("head").appendChild(style);
}
showChapters();