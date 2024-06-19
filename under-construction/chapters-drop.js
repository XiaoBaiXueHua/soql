function showChapters() {
	const works = document.querySelectorAll(`li[id^="work_"]`);
	for (const work of works) {
		const chStr = work.querySelector("dd.chapters a"); // only get the multichapters
		if (chStr) {
			const workId = work.id.match(/\d+/)[0];
			// console.log(workId);
			fetchNav(workId).then(function (chs) {
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
					subSummary.innerHTML = `Show ${numChapters - 4} more chapters.`;
					subDrop.appendChild(subSummary);
					for (var i = 0; i < numChapters; i++) {
						const ch = chs[i];
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
					work.appendChild(chapterDrop); // change this to make the details drop get appended After the stats specifically, so that it works w/the bookmarks page n stuff
				}
			})
		}
	}
}

function removeNumber(str) {
	return str.replace(/\d+\.\s/, "");
}

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

showChapters();

function css() {
	stylesheet = `
.chapterDrop {
  display: block;
  float: left;
  border-top: 1px solid;
  width: 100%;
  margin: 0.5em auto;
  & ol > details summary {
    position: sticky;
    top: 0;
  }
  ol {
    li {
      display: list-item;
      list-style-type:decimal;
      list-style-position:  inside;
      
      .datetime {
        position: relative;
        float: right;
      }
    }
  }
}`
}