// ==UserScript==
// @name         AO3 Inbox Chapters
// @namespace    https://sincerelyandyourstruly.neocities.org
// @description  Shows the chapter number of a comment in one's AO3 inbox.
// @author       小白雪花
// @version      1.1
// @history      1.1 - added in an option to change the inbox timestamps from relative to absolute times in the inbox.
// @match        https://archiveofourown.org/users/*/inbox**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/inbox-chapters.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/inbox-chapters.js
// @grant        none
// ==/UserScript==

var changeTimestamp = {
	enabled: true,
	// timeAgo: 31 // number of days old in the inbox something should be before switching from the default relative time to the absolute timestamp
}

function getCommentChapters() {
	const inboxComments = document.querySelectorAll(`li[id^="feedback_comment"]`);
	for (const comment of inboxComments) {
		const byline = comment.querySelector("h4.heading.byline"); // declare this separately
		const ficLink = byline.querySelector(`a:last-of-type`);
		// console.log(`ficLink.href: ${ficLink.href}`);
		const commentURL = new URL(ficLink.href);
		// console.log(`comment: `, comment);
		// console.log(`comment url: ${commentURL.pathname}`);
		try {
			fetchBylines(commentURL.pathname).then(function (response) {
				//console.log(response);
				if (changeTimestamp) {
					const relativeTimestamp = byline.querySelector(`span.datetime`); // this thing's innerText will be changed at the end, so like. make the separate var for its text
					// var tsText = relativeTimestamp.innerText.trim(); 
					// console.log(`this comment was posted ${relativeTimestamp.innerText.trim()}.`);
					// if (tsText.match(/days?/i)) {
						// console.log(`comment posted ${tsText.substring(0, tsText.search(/\s/))} days ago.`);
						// const days = parseInt(tsText.substring(0, tsText.search(/\s/)));
						// if (days > changeTimestamp.timeAgo) {
							// relativeTimestamp.innerHTML = response.date;
							relativeTimestamp.setAttribute("timestamp", response.date);
						// }
					// }
				}
				if (response.chapter) { // make sure we aren't just appending parentheses of empty strings lol
					ficLink.insertAdjacentHTML("afterend", `<span> (${response.chapter})</span>`);
				}
			})
		} catch (e) {
			console.error("hi! something fucked up! though i suspect it's most likely that we got dumped in rate limiting jail.\n", e);
		}
	}

}

async function fetchBylines(url) {
	const response = await fetch(new Request(url));
	if (response.ok) {
		const txt = await response.text();
		const tmpDiv = document.createElement("div"); // makes a div to hold the response text in
		tmpDiv.innerHTML = txt;
		let chNum = "";
		const h = tmpDiv.querySelector(`h4.heading.byline`);
		try {
			const chSpan = h.querySelector(`span.parent`).innerText; // first test if the comment was left on a multi-chapter fic
			
			chNum = chSpan.replace(/\bon\b/, "").trim(); // hard-code for en rn. sorry international fans.
		} catch (e) {
			console.log("this comment doesn't belong to a multichapter.");
		}

		let absDate = ""; 
		if (changeTimestamp.enabled) {
			try {
				// absDate = h.querySelector(`span.posted.datetime`).innerHTML; // absolute date
				absDate = h.querySelector(`span.posted.datetime`).innerText.replace(/\s+/g, " ").trim();
			} catch (e) {
				console.warn(`i bet h was null for some reason. the work is probably hidden now or something.`, h);
			}
			// console.log(`the absolute date this comment was posted: ${absDate}`);
		}
		return { chapter: chNum, date: absDate }; // return an object with the chapter number and the date
	} else {
		throw new Error;
	}
}

// extra css for styling the datetime
const css = `.comment h4.byline .datetime {
  text-align: right;
}
.comment h4.byline .datetime::after {
  content: attr(timestamp);
  height: auto;
  display: block;
}`;
const style = document.createElement("style");
style.innerHTML = css;
document.head.append(style);

getCommentChapters();