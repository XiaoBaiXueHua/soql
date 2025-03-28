// ==UserScript==
// @name		Total Stats By Fandom
// @namespace	https://sincerelyandyourstruly.neocities.org
// @version		1.0
// @description	gives a fandom stat totals as a drop-down
// @author		小白雪花
// @match		https://archiveofourown.org/users/*/stats
// @match		https://archiveofourown.org/users/*/stats**
// @exclude		https://archiveofourown.org/users/*/stats*flat_view=true*
// @icon		https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/fandom-stats.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/fandom-stats.js
// @grant		none
// ==/UserScript==

const statsboxes = document.querySelectorAll(`li.fandom`);
console.log(statsboxes);
for (const f of statsboxes) {
	const fname = f.querySelector(`h5`);
	// console.log(`fandom: ${fname}\n`, f);
	const works = f.querySelectorAll(`li`);
	// console.log(works);
	var subs = 0, kudos = 0, bookmarks = 0, words = 0, hits = 0, comments = 0; // reset all of these
	// const dataArr = [bookmarks, comments, kudos, hits, subs]; // not words since those are separate
	for (const w of works) {
		// const title = w.querySelector(`a`);
		const wordSpan = w.querySelector(`dt span`);
		words += parseInt(wordSpan.innerText.replaceAll(/\D/g, ""));
		const dds = w.querySelectorAll(`dl.stats dd`);
		for (var i = 0; i < dds.length; i++) {
			let n = parseInt(dds[i].innerText.replaceAll(/\D/g, ""));
			switch (dds[i].className) {
				case "subscriptions": {
					subs += n;
					break;
				}
				case "hits": {
					hits += n;
					break;
				}
				case "kudos": {
					kudos += n;
					break;
				}
				case "comments": {
					comments += n;
					break;
				}
				case "bookmarks": {
					bookmarks += n;
					break;
				}
			}
		}
	}
	console.log(`totals for ${fname}:\nwords: ${words.toLocaleString()}\t\tsubscriptions: ${subs}\t\thits: ${hits}\nkudos: ${kudos}\t\tcomment threads: ${comments}\t\tbookmarks: ${bookmarks}`);
	const details = document.createElement(`details`);
	details.className = `total-stats`;
	const summary = document.createElement(`summary`);
	// fname += ` &mdash; <small>(${words.toLocaleString()} words)</small>`;
	// summary.innerHTML = fname.outerHTML;
	summary.appendChild(fname);
	const ul = document.createElement(`ul`);
	ul.innerHTML = `<li><strong>Words:</strong> ${words.toLocaleString()}</li><li><strong>Subscriptions:</strong> ${subs.toLocaleString()}</li><li><strong>Hits:</strong> ${hits.toLocaleString()}</li><li><strong>Kudos:</strong> ${kudos.toLocaleString()}</li><li><strong>Comment Threads:</strong> ${comments.toLocaleString()}</li><li><strong>Bookmarks:</strong> ${bookmarks.toLocaleString()}</li>`; // this is honestly just easier than trying to do a loop
	details.append(summary, ul);
	// fname.remove();
	f.insertAdjacentElement("afterbegin", details);
}

const stylesheet = `.total-stats[open] {
  margin-bottom: 0.5em;
}
.total-stats summary {
  margin-left: 0.5em;
}
.total-stats ul {
  font-size: 90%;
  display: grid;
  grid-template-columns: repeat(3, 3fr);
}
.total-stats li {
  display: flex;
  justify-content: flex-end;
  margin: 0;
  margin-right: 1.5em;
}
.total-stats li:nth-of-type(3n+1) {
  margin-left: 0.5em;
}
.total-stats li:nth-of-type(3n) {
  margin-right: 0.5em;
}
.total-stats li strong {
  justify-self: flex-start;
  margin-right: auto;
}
.total-stats + h5.heading {
  display: none;
}

@media screen and (max-width: 42em) {
  .total-stats ul {
    grid-template-columns: repeat(2, 2fr);
  }
  .total-stats li {
    margin: 0;
  }
  .total-stats li:nth-of-type(2n+1), .total-stats li:nth-of-type(2n) {
    margin: 0.25em 0.5em;
  }
}`;
const style = document.createElement(`style`);
style.setAttribute(`type`, `text/css`);
style.innerText = stylesheet;
document.head.append(style);