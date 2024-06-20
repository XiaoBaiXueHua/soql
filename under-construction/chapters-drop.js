function showChapters() {
	const works = document.querySelectorAll(`li[id^="work_"], li[id^="bookmark_"]`);
	// bc i'm too lazy to figure out the exact regex to make this work wherever there are works and bookmarks listed, just make it check if there Are works being listed on the current page. and if there aren't, then don't do anything
	if (works.length > 0) {
		for (const work of works) {
			const chStr = work.querySelector("dd.chapters a"); // only get the multichapters
			if (chStr) {
				// const workId = work.id.match(/\d+/)[0]; // this doesn't work on bookmarks
				const workLink = work.querySelector(`h4.heading a:not([rel~="author"])`).href; // ensures we actually get the work link when also working w/bookmarks
				const workId = workLink.match(/\d+/)[0];
				// console.log(workId);
				fetchNav(workId).then(function (chs) { // returns array of list items
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
							ch.setAttribute("chapter-number", i+1);
							const link = ch.querySelector("a");
							//const date = ch.querySelector("span.datetime");
							//link.innerHTML = removeNumber(link.innerHTML);
							//const item = document.createElement("li");
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

		}
	}
}

function css() {
	const root = `
:root {
	--background-color: ${window.getComputedStyle(document.body).backgroundColor};
}` // this is a separate variable so that i don't have to be always checking to make sure i'm not overwriting the root when copy-pasting lol
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
  display: inline-table;
  padding-right: 0.5em;
  width: 2em;
  text-align: right;
}
.chapterDrop ol li .datetime {
  position: relative;
  top: 0;
  float: right;
}
.chapterDrop ol > details summary {
  position: sticky;
  top: 0;
  background-color: var(--background-color);
  text-shadow: -1px -1px var(--background-color), 1px -1px var(--background-color), -1px 1px var(--background-color), 1px 1px var(--background-color), 0 -1px var(--background-color), 0 1px var(--background-color), -1px 0 var(--background-color), 1px 0 var(--background-color);
  z-index: 1;
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
style.innerText = root + stylesheet;
document.querySelector("head").appendChild(style);
}
showChapters();