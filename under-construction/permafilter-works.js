// ==UserScript==
// @name         permafilter works
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  (and also on a by-author/anonymity/orphaned scale but mostly relevant for the works). requires the sticky filters script to already be installed
// @author       白雪花
// @match        https://archiveofourown.org**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @match	http*://archiveofourown.org/tags/*/works*
// @match	http*://archiveofourown.org/works?work_search*
// @match	http*://archiveofourown.org/works?commit=*&tag_id=*
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/permafilter-works.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/permafilter-works.permafilter-works
// @grant        none
// ==/UserScript==

if (!window.soql) {
	console.error(`the permafilter works script requires you to install my autofilters script :/`);
} else {
	if (!window.soql.autofilters) {
		console.error(`the permafilter works script requires you to install my autofilters script :/ aborting now`);
		return;
	}
	
	const autofilters = window.soql.autofilters; // bind this
	const fandoms = autofilters.relevant.fandoms;
	// actually maybe we should make this a small actions button that pulls up a floating <dialog> module ui. and also make this its own script
	/* banish a particular work from your search results */
	const workList = document.querySelectorAll("li[id^='work']");
	//
	for (const work of workList) {
		//console.log(work);
		const tags = work.querySelectorAll(`ul.tags li`);
		const ts = work.querySelectorAll(`a.tag`); 
		const work_id = work.id.replace("work_", ""); //get its id num from. well. its id.
		const title = work.querySelector(".heading a").innerText.trim(); // they don't even put a class on the title link...
		const klasses = work.classList; // need this to be an array for works w/multiple authors
		const user_ids = new Array();
		const authors = new Array();
		var aLinks = work.querySelectorAll(`a[rel="author"]`);
		for (const a of aLinks) {
			authors.push(a.innerText);
		}
		let anonymous = false;
		for (const klass of klasses) {
			if (klass.search(/^user-/) >= 0) {
				user_ids.push(klass.replace("user-", ""));
			}
		}
		if (user_ids.length < 1) {
			console.info("oh hey an anon work");
			anonymous = true;
		}
		// console.log(`work_id: ${work_id}, anonymous? ${anonymous}, authors: `, authors, user_ids);
		const banButt = document.createElement(`button`);
		banButt.className = "banish";
		banButt.innerHTML = "<small>Filter&hellip;</small>";
		const banDialogue = document.createElement(`dialog`);
		banDialogue.id = `ban-work-${work_id}`;
		banDialogue.innerHTML = `<h5>Banish&hellip;</h5>`;
		const banForm = document.createElement(`form`);
		banButt.addEventListener(`click`, () => {
			// banDialogue.open = true;
			banDialogue.showModal();
		})

		const workLabel = makeCheckbox(`banish-work-${work_id}`, work_id);
		workLabel.innerHTML += ` the work <em>${title}</em>`;
		banForm.appendChild(workLabel);

		const authDiv = document.createElement(`div`);
		authDiv.id = `banish-work-auths-${work_id}`;
		if (anonymous) {
			const label = makeCheckbox(`work-${work_id}-auth-anon`, `anonymous`);
			label.className = `ban-auth`;
			label.innerHTML += ` All anonymous works`;
			authDiv.appendChild(label);
		} else {
			for (var i = 0; i < authors.length; i++) { // okay. so the classes aren't listed in the same order as the authors (that's alphabetized), so this is technically not the way to do it but for now sure
				const label = makeCheckbox(`work-${work_id}-auth-${user_ids[i]}`, user_ids[i]);
				label.innerHTML += ` the author ${authors[i]}`;
				label.className = `ban-auth`;
				authDiv.appendChild(label);
			}
		}
		banForm.appendChild(authDiv);

		const tagsDiv = document.createElement(`details`);
		tagsDiv.innerHTML = `<summary>Tags&hellip;</summary>`;
		const tagD = document.createElement(`div`); // div for real this time
		// uhhh probably loop through the tag fandoms too. alas.
		var j = 0; // tracks how many total tags we've had so far, incl the fandoms
		for (const f of work.querySelectorAll(`h5.fandoms.heading a.tag`)) {
			// and now we do the same song and dance
			const label = makeCheckbox(`work-${work_id}-tag-${j}`, "");
			label.className = "fandom";
			label.innerHTML += ` ${f.innerText}`;
			tagD.appendChild(label);
			j++;
		}
		for (var i = 0; i < tags.length; i++) {
			const label = makeCheckbox(`work-${work_id}-tag-${i + j}`, ``); // no value bc we're gonna have to do a page fetch for This one if it's checked
			label.className = tags[i].className; // give it the same class name
			label.innerHTML += ` ${tags[i].innerText}`;
			// add it to the tags div
			tagD.appendChild(label);
		}
		tagsDiv.appendChild(tagD);
		banForm.appendChild(tagsDiv);

		// console.log(autofilters.fandoms());
		const select = document.createElement(`select`);
		// select.innerHTML = `<option value="global">Global</option>`;
		const globOpt = document.createElement(`option`);
		globOpt.value = "global";
		globOpt.innerHTML = `Global`;
		if (!autofilters.fandomName) {
			select.appendChild(globOpt); // append the global option
			// then run through all of the fandoms
			for (const f of fandoms) {
				const opt = document.createElement(`option`);
				opt.innerHTML = f;
				opt.value = f;
				select.appendChild(opt);
			}
		} else {
			select.innerHTML = `<option value=${autofilters.fandomName}>${autofilters.fandomName}</option>`;
			select.appendChild(globOpt);
		}


		const p = document.createElement(`p`);
		p.innerHTML = `&hellip;from the ${select.outerHTML} filters.`;
		banForm.appendChild(p);

		// function selectVal() { return select.value; } // makes it always update
		// const selectVal = () => { return select.value; }

		const subButt = document.createElement(`input`);
		subButt.type = `submit`;
		subButt.value = `BEGONE!!!!!!`
		banForm.appendChild(subButt);
		banForm.onsubmit = () => {
			console.log(`hi. submission for work ${work_id} (${title}) :3`);
			// console.log(select);
			const val = document.querySelector(`#ban-work-${work_id} select`).value; // gonna have to reselect it every time i guess
			const banishment = `filter-${window.soql.toCss(val)}`
			console.log(localStorage[banishment]); // gives us the filter string
			var addStr = "";
			// hmm. actually might have to make this sort of a thing a class so that we can just use getters.
			if (work.querySelector(`#banish-work-${work_id}`).checked) {
				addStr += ` -id:${work_id}`; // banish the work by id
			}
			if (work.querySelectorAll(`.ban-auth input:checked`).length > 0) {
				if (!anonymous) {
					// loop through it... later lol
				} else {
					addStr += ` in_anon_collection:false`;
				}
			}
			var fetches = 0;
			const frees = work.querySelectorAll(`dialog details input:checked`);
			// let 
			if (frees.length > 0) {
				// const rx = new RegExp(`work-${work_id}-tag-`);
				for (const t of frees) {
					// um. hmm. gonna have to um. extract the index of the tag in the a.tags first
					const ind = parseInt(t.id.replace(/work-\d+-tag-/, "")); 
					// and then we do an async fetch timeout
					const href = ts[ind].href; // extract the href
					// console.log(`want to ban: ${t.innerText.trim()}\t | currently page fetching to ban: ${ts[ind].innerText}`);
					// console.log(`sending request to ${href}`);
					setTimeout(() => {
						getPage(href).then((txt) => {
							console.log(txt); // console the tag name
							const tn = ts[ind].innerText.trim(); // tag name
							const fn = autofilters.getFandom(txt, tn); // fetched tag's fandom name
							const id = autofilters.getID(txt); // fetched tag's id #

							const trueName = function () {
								let t = txt.querySelector(`h2 a.tag`);
								if (t) {
									// if we have this, then check to see if its value is the same as the fn we got
									if (fn !== t.innerText.trim()) {
										// if they're not the same, then prioritize the canonical name
										return t.innerText.trim();
									}
								}
								return fn; // otherwise leave it
							}();
							console.log(`"${tn}" is part of ${fn} and has an id num. of ${id.toLocaleString()}`);
							if (id) {
								autofilters.idKeyVals.push(trueName, id, fn); // add the tag storage if it's a wrangled tag. 
							} else {
								console.warn(`hi!! sorry, but "${tn}" is not a filterable tag at this moment.`)
							}
							console.log(autofilters.idKeyVals.specific(fn)); // and also double-check to make sure it went through
						});
					}, fetches * 1000); // a second btwn fetches for now
					fetches++;
					break;
				}
			}
			console.log(`Please wait so as not to overwhelm ao3 servers...`)
			console.log(`adding: \n\t${addStr}`);
			// localStorage.setItem(banishment, `${val}${addStr}`);
			// banDialogue.close();
			return false;
		}
		banDialogue.appendChild(banForm);

		work.querySelector("p.datetime").insertAdjacentElement("afterend", banButt); // inject the selection next to the datetime or something
		work.appendChild(banDialogue); // put that thang somewhere
	}


}

function makeCheckbox(id, value) {
	const input = document.createElement(`input`);
	input.type = "checkbox";
	input.id = id;
	input.value = value;

	const label = document.createElement(`label`);
	label.setAttribute(`for`, id);
	label.appendChild(input);
	return label; // do the inner html yourself :/
}

async function getPage(url) {
	const request = await fetch(new Request(url));
	const div = document.createElement(`div`);
	if (request.ok) {
		const response = await request.text();
		// console.log(response);
		div.innerHTML = response;
	} else {
		console.warn(`hey what happened`, request);
	}
	return div;
}