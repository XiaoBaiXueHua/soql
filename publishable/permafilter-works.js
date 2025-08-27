// ==UserScript==
// @name         permafilter works
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  (and also on a by-author/anonymity/orphaned scale but mostly relevant for the works). requires the sticky filters script to already be installed, and for some reason picking tags off a work to banish w/o having to open the page yourself is a feature of This script instead of that one. 
// @author       白雪花
// @match        https://archiveofourown.org**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @match	http*://archiveofourown.org/tags/*/works*
// @match	http*://archiveofourown.org/works?work_search*
// @match	http*://archiveofourown.org/works?commit=*&tag_id=*
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/permafilter-works.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/soql/main/publishable/permafilter-works.js
// @grant        none
// ==/UserScript==

if (!window.soql) {
	console.error(`the permafilter works script requires you to install my autofilters script :/\nor, if you already have it installed, it needs to be UNDERNEATH the sticky filters script in your userscript manager.`);
} else {
	if (!window.soql.autofilters) {
		console.error(`the permafilter works script requires you to install my autofilters script :/\nor, if you already have it installed, it needs to be UNDERNEATH the sticky filters script in your userscript manager. \nanyway, aborting now`);
		return;
	}
	const fetchSpacing = 2500; // ms btwn fetches

	const autofilters = window.soql.autofilters; // bind this
	const fandoms = autofilters.relevant.fandoms;
	// actually maybe we should make this a small actions button that pulls up a floating <dialog> module ui. and also make this its own script
	/* banish a particular work from your search results */
	const workList = document.querySelectorAll("li[id^='work']");
	//
	for (const work of workList) {
		const tags = work.querySelectorAll(`ul.tags li`);
		const ts = work.querySelectorAll(`a.tag`);
		const work_id = work.id.replace("work_", ""); //get its id num from. well. its id.
		const title = work.querySelector(".heading a").innerText.trim(); // they don't even put a class on the title link...
		const klasses = work.classList; // need this to be an array for works w/multiple authors
		const user_ids = new Array();
		const authors = new Array();
		const aLinks = work.querySelectorAll(`a[rel="author"]`);
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

		const banButt = document.createElement(`button`);
		banButt.className = "banish";
		banButt.innerHTML = "<small>Filter&hellip;</small>";

		const banDialogue = document.createElement(`dialog`);
		banDialogue.id = `ban-work-${work_id}`;

		const closeScroller = document.createElement(`div`);
		closeScroller.className = `close-scroll`;

		const closeDialogue = document.createElement(`button`);
		closeDialogue.className = `close-ban`;
		closeDialogue.innerHTML = `&times;`;
		closeDialogue.addEventListener(`click`, () => { // put it here to keep the += str from killing it
			banDialogue.close();
		});
		closeScroller.appendChild(closeDialogue);
		banDialogue.appendChild(closeScroller);

		const h5 = document.createElement(`h5`); // doing it this way keeps us from killing the close dialogue event listener
		h5.innerHTML = `Banish&hellip;`;
		banDialogue.appendChild(h5); // keep the close button first
		

		const banForm = document.createElement(`form`);
		banButt.addEventListener(`click`, () => {
			banDialogue.showModal();
		});

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
				const label = makeCheckbox(`work-${work_id}-auth-${i}`, `auth-${i}`);
				label.innerHTML += ` the author ${authors[i]}`;
				label.className = `ban-auth`;
				authDiv.appendChild(label);
			}
		}
		banForm.appendChild(authDiv);

		// checkboxes for banishing the various tags of that work
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

		const select = document.createElement(`select`);
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

		const subButt = document.createElement(`input`);
		subButt.type = `submit`;
		subButt.value = `BEGONE!!!!!!`
		banForm.appendChild(subButt);
		banDialogue.appendChild(banForm);

		const infoDiv = document.createElement(`div`);
		infoDiv.class = `ban-info`;
		banDialogue.appendChild(infoDiv);
		banForm.onsubmit = () => {
			console.log(`hi. submission for work ${work_id} (${title}) :3`);
			var fetches = 0, successes = 0;
			const val = document.querySelector(`#ban-work-${work_id} select`).value; // gonna have to reselect it every time i guess
			const banishment = `filter-${window.soql.toCss(val)}`
			console.log(localStorage[banishment]); // gives us the filter string
			var addStr = "";
			var successStr = `<p>The following additions have been made to the ${val} filters:</p>`;
			const reqs = work.querySelectorAll(`label input:checked`) ? work.querySelectorAll(`label input:checked`).length : 0;

			if (work.querySelector(`#banish-work-${work_id}`).checked) {
				addStr += ` -id:${work_id}`; // banish the work by id
				successStr += `<strong>Work:</strong> ${title} (id: ${work_id})\n`;
				successes++;
			}

			const checkedAuths = work.querySelectorAll(`.ban-auth input:checked`);
			if (checkedAuths.length > 0) {
				if (!anonymous) {
					if (work.querySelectorAll(`.ban-auth`).length == 1) {
						// thank god we can just use the user_id from the classes
						addStr += ` -user_ids:${user_ids[0]}`;
						successStr += `<strong>User:</strong> ${authors[0]} (id: ${user_ids[0]})<br />`;
					} else if (checkedAuths.length == authors.length) {
						// rejoice! for we can just banish them all!! don't worry abt who they are for now.
						for (var i = 0; i < authors.length; u++) {
							addStr += ` -user_ids:${user_ids[i]}`;
							successStr += `User: ${authors[i]}<br />`;
							successes++;
						}
					} else {
						// loop through the values to get the index of the author in the aLinks 
						console.log(`aLinks: `, aLinks);
						for (var k = 0; k < checkedAuths.length; k++) {
							const ind = parseInt(checkedAuths[k].value.replace(/\D+/, ""));
							console.log(`ind: ${ind} | author ${authors[ind]} (href: ${aLinks[ind]}) is abt to be booted`);
							setTimeout(() => {
								const u = new URL(aLinks[ind].href); // get the url out of it
								pageFetch(u.pathname.replace(/\/pseuds\/.*/, "/profile")).then((txt) => { // fetch their profile page
									// first try to get the id via subscribable_id, but if that doesn't work, then it should be div.user.home.profile dl.meta dd:last-of-type
									let id = null;
									if (txt.querySelector(`#subscription_subscribable_id`)) {
										// subscribable id method (only for logged-in users)
										id = parseInt(txt.querySelector(`#subscription_subscribable_id`).value);
									} else {
										id = parseInt(txt.querySelector(`div.user.home.profile dl.meta dd:last-of-type`).value);
									}
									if (id) {
										addStr += ` -user_ids:${id}`;
										successStr += `<strong>User:</strong> ${authors[ind]} (id: ${id})\n`;
										successes++;
									}
								});
							}, fetches * fetchSpacing);
							fetches++;
						}

					}
				} else {
					// probably check to make sure that this isn't already in the filters but whatever that's for later
					addStr += ` in_anon_collection:false`;
					successStr += `<strong>in_anon_collection:</strong> false<br />`
					successes++;
				}
			}

			const frees = work.querySelectorAll(`dialog details input:checked`);
			if (frees.length > 0) {
				for (const t of frees) {
					// um. hmm. gonna have to um. extract the index of the tag in the a.tags first
					const ind = parseInt(t.id.replace(/work-\d+-tag-/, ""));
					// and then we do an async fetch timeout
					const href = ts[ind].href; // extract the href
					// first check to make sure we don't already have the tag name saved somewhere
					const savedId = autofilters.idKeyVals.includes(ts[ind].innerText.trim())
					if (savedId) {
						console.log(`oh thank god `)
						addStr += ` -filter_ids:${savedId[1]}`;
						successStr += `Tag: ${savedId[0]} (id: ${savedId[1]})<br />`;
						successes++;
					} else {
						// if we don't, THEN we go send a page fetch
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


								if (trueName !== null) { // well. obvs this has to exist first. otherwise it's not a wrangleable tag.
									console.log(`"${tn}" is part of ${fn} and has an id num. of ${id.toLocaleString()}`);

									autofilters.idKeyVals.push(trueName, id, fn); // add the tag storage if it's a wrangled tag. 
									successes++;
									addStr += ` -filter_ids:${id}`;
									successStr += `<strong>Tag:</strong> ${trueName} (id: ${id})<br />`;
								} else {
									infoDiv.insertAdjacentHTML(`afterbegin`, `<p class="flash">hi!! sorry, but "${tn}" is not a filterable tag at this moment.</p>`);
								}
								console.log(autofilters.idKeyVals.specific(fn)); // and also double-check to make sure it went through
							});
						}, fetches * fetchSpacing); // a second btwn fetches for now
						fetches++;
					}

				}
			}
			infoDiv.insertAdjacentHTML(`afterbegin`, `<p>Please wait so as not to overwhelm ao3 servers... (Estimated ETA: ${fetches * fetchSpacing / 1000}s)</p>`);

			let failures = setTimeout(() => {
				infoDiv.insertAdjacentHTML(`afterbegin`, `<p>wahhhh but you have some failures... either some of those tags were unwrangleable, or we probably sent too many fetch requests. :&lt;<br />try again in like ten minutes or smth.</p>`);
			}, (fetches + 10) * fetchSpacing);

			setTimeout(() => {
				console.log(`successful additions: ${successes}/${reqs}`);
				console.log(`adding: \n\t${addStr}`);
				// successStr = `<p>${successStr}</p>`; // wrap it in its own paragraph
				if (successes == reqs) {
					clearTimeout(failures);
				}
				infoDiv.insertAdjacentHTML(`afterbegin`, `<p>${successStr}</p>`);
				localStorage.setItem(banishment, `${val}${addStr}`);

			}, (fetches + 5) * fetchSpacing);

			return false;
		}

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

/* CSS */
const modalStyle = window.getComputedStyle(document.querySelector(`#modal`));
var css = `[id^="ban"] {
	background-color: ${modalStyle.backgroundColor};
	color: ${modalStyle.color};
	border-color: ${modalStyle.borderColor};
	outline: ${modalStyle.outline};
	box-shadow: ${modalStyle.boxShadow};
}

[id^=ban] details > div {
  display: grid;
  grid-template-columns: repeat(2, 2fr);
  gap: 0.25em;
  max-height: 33vh;
  overflow-y: auto;
}
[id^=ban] .fandom {
  font-family: serif;
  -webkit-text-decoration: dotted underline;
          text-decoration: dotted underline;
}
[id^=ban] .relationships {
  background-color: rgba(0, 0, 0, 0.25);
}
[id^=ban] .characters {
  background-color: rgba(0, 0, 0, 0.12);
}
[id^=ban] h5 {
  margin-top: 0;
  font-size: 1.2em;
}

.close-scroll {
  position: sticky;
  top: 0;
  min-height: 1.5lh;
  margin-bottom: -1.5lh;
}

.close-ban {
  position: absolute;
  top: 0lh;
  right: 0.5em;
}

@media only screen and (max-width: 42em) {
  [id^=ban] details > div {
    grid-template-columns: 1fr;
    max-height: 60vh;
  }
}/*# sourceMappingURL=permafilter-works.css.map */`;

const style = document.createElement("style");
style.innerText = css;
document.querySelector("head").appendChild(style);