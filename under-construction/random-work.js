function LESIGH() {
	// const randButt = document.createElement("li");
	// randButt.innerHTML = `<a href="#">Random Work</a>`;

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
		if (newPg == currPg) {
			console.log(`oooo working with this current page`);
			return document.querySelectorAll(".blurb");
		} else {
			console.log(`to fetch: page ${pgNum}`);
		}
		const newURL = `${window.location.pathname}?page=${pgNum}&show=to-read`; // relative paths babeyyyy
		console.log(`new url: ${newURL}`);
		const request = await fetch(newURL);
		if (request.ok) {
			// console.log(await request.innerText);
			const txt = await request.text();
			// console.log(txt);
			const tmpDiv = document.createElement("div");
			tmpDiv.innerHTML = txt;
			const blurbs = document.querySelectorAll(".blurb");
			console.log(blurbs);
			return blurbs;
		} else {
			alert(`Retry Later :(`);
			return false;
		}
	}

	randomWork();
}

LESIGH();