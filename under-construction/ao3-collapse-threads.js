// make the function for expanding/collapsing

function collapseThreads() {
	const threads = document.querySelectorAll(`ol.thread li.comment:has(+ li:not([role='article']))`);
	console.log(threads);
	for (const li of threads) {
		if (!li.querySelector(`.collapser`)) {
			const id = li.id; // will be necessary for the collapsing

			// make the button
			const beau = document.createElement(`button`);
			beau.innerHTML = `Collapse Thread`;
			beau.className = `collapser`;
			beau.setAttribute(`data-expanded`, true);

			// add the event listener
			beau.addEventListener(`click`, () => {
				const expanded = JSON.parse(beau.getAttribute(`data-expanded`));
				const waugh = document.querySelector(`#${id} + li`);
				waugh.hidden = expanded;
				beau.setAttribute(`data-expanded`, !expanded);
				beau.innerHTML = `${expanded ? "Expand" : "Collapse"} Thread`;
			})


			li.querySelector(`ul.actions`).insertAdjacentElement(`afterbegin`, beau);
		}
	}
}

collapseThreads();