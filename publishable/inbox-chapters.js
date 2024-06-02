// ==UserScript==
// @name         AO3 Inbox Chapters
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  Shows the chapter number of a comment in one's AO3 inbox.
// @author       小白雪花
// @match        https://archiveofourown.org/users/*/inbox**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/inbox-chapters.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/inbox-chapters.js
// @grant        none
// ==/UserScript==

(function() {
    function getCommentChapters() {
	const inboxComments = document.querySelectorAll(`li[id^="feedback_comment"]`);
	for (const comment of inboxComments) {
		const byline = comment.querySelector("h4.heading.byline"); // declare this separately
		const ficLink = byline.querySelector(`a:last-of-type`);
		console.log(`ficLink.href: ${ficLink.href}`);
		const commentURL = new URL(ficLink.href);
		// console.log(`comment: `, comment);
		console.log(`comment url: ${commentURL.pathname}`);
		try {
			fetchBylines(commentURL.pathname).then(function (response) {
				//console.log(response);
				if (response) { // make sure we aren't just appending parentheses of empty strings lol
					ficLink.insertAdjacentHTML("afterend", `<span> (${response})</span>`);
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
		try {
			// first test if the comment was left on a multi-chapter fic
			const chSpan = tmpDiv.querySelector(`h4.heading.byline span.parent`).innerText;
			// console.log(`chSpan: ${chSpan}`);

			return chSpan.replace(/\bon\b/, "").trim(); // hard-code for en rn. sorry international fans.
		} catch (e) {
			console.log("this comment doesn't belong to a multichapter.");
			//console.log(tmpDiv.innerText);
			return "";
		}
	} else {
		throw new Error;
	}
}

getCommentChapters();
})();