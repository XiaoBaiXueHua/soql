// ==UserScript==
// @name         boilerplate
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  a series drop-down script to match the chapter drop-down script
// @author       白雪花
// @match        https?://archiveofourown.org/**/series
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/seriesdrop.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/seriesdrop.js
// @grant        none
// ==/UserScript==


// v similar to the chapterdrop script, but for users' series pages

var tmpDiv = document.createElement("div"); // everyone uses the same div for this. i am sure this will cause no problems whatsoever.

async function showWorks() {
	const series = document.querySelectorAll(`li[id^="series_"]`);
	console.debug(`series: `, series);
	// shouldn't need the "series.length" clause since this script should only be running on series pages
	for (const serie of series) {
		const seriesLink = serie.querySelector(`h4.heading a`).href;
		const reqWorks = await fetch(seriesLink);
		if (reqWorks.ok) {
			const txt = await reqWorks.text();
			// console.log(txt);
			// const tmpDiv = document.createElement("div");
			tmpDiv.innerHTML = txt;

			// make the drop-down to hold all the works listed
			const worksDrop = document.createElement(`details`);
			worksDrop.className = "chapterDrop";
			const worksDropSummary = document.createElement(`summary`);
			worksDropSummary.innerHTML = `<strong>Works</strong>`;
			worksDrop.appendChild(worksDropSummary);

			// make an ordered list to now list each of them
			const worksList = document.createElement("ol");
			// then do a thing to determine whether a sub-drop is necessary


			let works = [];
			try {
				works = tmpDiv.querySelectorAll(`li[id^="work_"]`);
				console.log(works);
			} catch (e) {
				console.error(`hey man.`);
			}
			for (var i = 0; i < works.length; i++) {
				const work = works[i];
				// we shouldn't have to show Everything... probably just the individual work title & summaries should be enough for each.
				const workLi = document.createElement("li"); // the parent list item 
				workLi.setAttribute("chapter-number", i + 1);


				// a details drop for each thing
				const workDetail = document.createElement(`details`);
				workDetail.className = `series-work`; // for styling
				const workSummaryLine = document.createElement(`summary`);
				const title = work.querySelector(`h4.heading`);
				const datetime = work.querySelector(`.header.module p.datetime`);

				workSummaryLine.append(title, datetime);

				workDetail.append(workSummaryLine, work.querySelector(`blockquote.userstuff.summary`));

				workLi.appendChild(workDetail);

				worksList.appendChild(workLi);
			}

			worksDrop.appendChild(worksList);

			serie.appendChild(worksDrop);
		}
	}
	css();
}

function css() {
	const css = `.chapterDrop {
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
	style.innerText = css;
	document.querySelector("head").appendChild(style); // should be mutually exclusive to the chapter drop-down
}

showWorks();