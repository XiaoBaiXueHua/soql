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
	const fandoms = autofilters.fandoms();
	// const cssFanName = autofilters.toCss(autofilters.fandomName);
	// actually maybe we should make this a small actions button that pulls up a floating <dialog> module ui. and also make this its own script
	/* banish a particular work from your search results */
	const workList = document.querySelectorAll("li[id^='work']");
	//var nyeh = (!global[3] && !search_submit); //if both the global n the fandom checkmarks are off AND we're not on a search page
	// var nyeh = autofilters.fandomName ? (!document.querySelector(`#globalFilters`) && !document.querySelector(`#fandomFilters`)) : !document.querySelector(`#globalFilters`); //have to check if the fandom box exists first before declaring it -_-
	//
	for (const work of workList) {
		//console.log(work);
		const tags = work.querySelectorAll(`a.tag`);
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
		const workInput = document.createElement(`input`);
		workInput.type = "checkbox";
		workInput.id = `banish-work-${work_id}`;
		workInput.value = work_id;
		const workLabel = document.createElement(`label`);
		workLabel.setAttribute(`for`, `banish-work-${work_id}`);
		workLabel.appendChild(workInput);
		workLabel.innerHTML += ` the work <em>${title}</em>`;
		banForm.appendChild(workLabel);

		const authDiv = document.createElement(`div`);
		authDiv.id = `banish-work-auths-${work_id}`;
		if (anonymous) {
			const input = document.createElement("input");
			input.id = `work-${work_id}-auth-anon`;
			input.type = "checkbox";
			input.value = "anonymous";
			const label = document.createElement(`label`);
			label.setAttribute(`for`, `work-${work_id}-auth-anon`);
			label.appendChild(input);
			label.innerHTML += ` All anonymous works`;
			authDiv.appendChild(label);
		} else {
			for (var i = 0; i < authors.length; i++) { // okay. so the classes aren't listed in the same order as the authors (that's alphabetized), so this is technically not the way to do it but for now sure
				const input = document.createElement("input");
				input.type = "checkbox"; // later make it more complex by detecting
				input.id = `work-${work_id}-auth-${user_ids[i]}`;
				const label = document.createElement(`label`);
				label.setAttribute(`for`, `work-${work_id}-auth-${user_ids[i]}`);
				input.value = user_ids[i];
				label.appendChild(input);
				label.innerHTML += ` the author ${authors[i]}`;
				authDiv.appendChild(label);
			}
		}
		banForm.appendChild(authDiv);

		const tagsDiv = document.createElement(`details`);
		tagsDiv.innerHTML = `<summary>Tags&hellip;</summary>`;
		const tagD = document.createElement(`div`); // div for real this time
		for (var i = 0; i < tags.length; i++) {
			// make the input
			const input = document.createElement(`input`);
			input.id = `work-${work_id}-tag-${i}`;
			input.type = `checkbox`; // no value bc we're gonna have to do a page fetch for This one if it's checked
			// make the label
			const label = document.createElement(`label`);
			label.setAttribute(`for`, `work-${work_id}-tag-${i}`);
			label.appendChild(input);
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

		const subButt = document.createElement(`input`);
		subButt.type = `submit`;
		subButt.value = `BEGONE!!!!!!`
		banForm.appendChild(subButt);
		banForm.onsubmit = () => {
			console.log(`hi. submission :3`);
			banDialogue.close();
			return false;
		}
		banDialogue.appendChild(banForm);

		work.querySelector("p.datetime").insertAdjacentElement("afterend", banButt); // inject the selection next to the datetime or something
		work.appendChild(banDialogue); // put that thang somewhere
	}


}