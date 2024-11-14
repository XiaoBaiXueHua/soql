// the dom element creation functions i wrote that i can't live without anymore
class dom {
	static pee(stray, parent, childParams) { // 'stray' as in 'string-or-array' though it takes elements too
		switch (typeof (stray)) {
			case "string": {
				parent.innerHTML += stray; // because we sometimes work with arrays of mixed strings and elements, must use +=
				break;
			};
			case "object": {
				try {
					parent.appendChild(stray); // try just appending it first
				} catch (e) {
					try { // otherwise, it's probably an array
						for (var it of stray) {
							try {
								if (typeof (it) == "string") {
									// parent.nodeName
									if (childParams) {
										it = dom.pChildren(it, (childParams.type ? childParams.type : parent.nodeName), childParams.klass, childParams.attr, childParams.childParams); // these should, hypothetically, turn the item into an element so that pee can append them correctly
									}
								}
								dom.pee(it, parent, childParams);
							} catch (e) {
								console.error("haha too much recursion i bet. man\n", e);
							}
						}
					} catch (e2) {
						console.error(`error 1:\n`, e, `error 2: \n`, e2);
					}
				}
				break;
			}
		}
	}

	//turns a string into an element
	static pp(str, type = "p", klass = "", attr = {}) {
		return dom.pChildren(str, type, klass, attr, false);
	}

	static pChildren(str, type = "span", klass = "", attr = {}, childParams = {}) { // the same as pp but this time we can have children of a different type. and also gives us spans by default
		const el = document.createElement(type);
		dom.pee(str, el, childParams);
		if (klass) { el.className = klass; }
		if (attr) {
			for (const [key, value] of toEntries(attr)) {
				el.setAttribute(key, value);
			}
		}
		return el; //returns an html element
	}

	// makes a namespace type el
	static xpp(str, type = "svg", attr = {}, klass = "") {
		const NS = function () {
			// list of namespaces http://www.html-5.com/tutorials/html-namespaces.html
			var nsLink = "http://www.w3.org"
			// console.log(type.toLowerCase());
			type = type.toLowerCase(); // for checking purposes

			// arrays of allowed elements bc idk how to do this otherwise since case/switch didn't work
			const svg = ["svg", "text", "textPath", "ellipse", "defs", "use"];
			const mathML = ["math", "mathml"];

			if (svg.includes(type)) {
				nsLink += "/2000/svg";
			} else if (mathML.includes(type)) {
				// version with math ml lol
				nsLink += "/1998/Math/MathML";
			}
			return nsLink;
		}();
		const el = document.createElementNS(NS, type);
		if (klass) { el.className = klass; }
		if (attr) {
			// const attrArr = Object.toEntries(attr);
			for (const [key, value] of toEntries(attr)) {
				el.setAttribute(key, value);
			}
		}

		dom.pee((str !== null) ? str : "", el);
		return el;
	}

	//appends arrays of ELEMENTS to a parent
	static appendix(array, par) {
		for (const el of array) {
			try {
				par.appendChild(el);
			} catch (e) {
				if (typeof (el) == "object") {
					dom.appendix(el, par);
				} else if (typeof (el) == "string") {
					par.innerHTML += el;
				} else {
					console.error("yeah. something happened with the appendix. idk look at the error:\n", e);
				}
			}
		}
	}
}

const freebies = { // list of filters that are likely to be applicable to anyone
	ratings: {
		["Not Rated"]: 9,
		["General Audiences"]: 10,
		["Teen & Up"]: 11,
		Mature: 12,
		Explicit: 13
	},
	warnings: {
		["Author Chose Not to Use Archive Warnings"]: 14,
		["No Archive Warnings Apply"]: 16,
		["Graphic Depictions of Violence"]: 17,
		["Major Character Death"]: 18,
		["Rape/Non-Con"]: 19,
		Underage: 20
	},
	categories: {
		General: 21,
		["M/F"]: 22,
		["M/M"]: 23,
		Other: 24,
		["F/F"]: 116,
		Multi: 2246
	},
	nuisances: {
		chatfics: 106225
	}
}

class filter_id {
	constructor(name) {
		this.tagName = name;
		this.id = function () {
			/* id fetcher function, by flamebyrd */
			if (document.querySelector("#favorite_tag_tag_id")) {
				console.log("favorite tag id method")
				return document.querySelector("#favorite_tag_tag_id").value;
			} else if (document.querySelector("a.rss")) {
				console.log("rss feed method");
				var href = document.querySelector("a.rss");
				href = href.getAttribute("href");
				href = href.match(/\d+/);
				return href;
			} else if (document.querySelector("#include_freeform_tags input:first-of-type")) {
				console.log("first freeform tag method");
				return document.querySelector("#include_freeform_tags input:first-of-type").value;
			} else if (document.querySelector("#subscription_subscribable_id")) {
				console.log("subscribable id method");
				return document.querySelector("#subscription_subscribable_id").value;
			} else {
				//if (!errorFlash) {alert("can't find tag id :C");};
				return null;
			};
		}();
	}
	// get(this) {
	// 	return [this.tagName, this.id];
	// }
}

// class savedFilter {
// 	constructor() {
// 		this.filter = [];
// 		this.users = [];
// 		this.works = [];
// 	}
// }

// class filterObj {
// 	constructor(fandom) {
// 		this.type = (fandom !== "global" ? "fandom" : "global"); // should be either "global" or "fandom"
// 		this.fandom = fandom;
// 		this.filters = {
// 			include: {},
// 			exclude: {}
// 		}
// 	}
// }

function emptyStorage(key) { //function to give you that particular localStorage (n set it to nothing if dne)
	if (!localStorage[key]) {
		localStorage.setItem(key, "");
	}
	//console.log(localStorage[key]);
	return localStorage[key];
}
function storJson(item) { //turns local storage item into a json
	let a;
	try {
		a = JSON.parse(item);
	} catch (e) {
		console.error(`obj that was supposed to become a json: `, item, e);
		a = [];
	}
	return a;
}
function autosave(key, value) {
	localStorage.setItem(key, value);
}

// the filterObj class 
class filterObj {
	constructor(fandom) {
		this.fullName = fandom;
		this.name = fandom.replace(filterObj.disambiguator, "");
		this.cssName = this.name.replace(/\W+/g, "-");
		this.filters = function () { // has sub-objects "include", "exclude", and "complex"
			// storJson(emptyStorage(`filter-${this.name}`))
			let obj;
			try {
				obj = JSON.parse(localStorage[this.name].filters);
			} catch (e) {
				console.error("it seems you haven't used the updated version of the script yet. now turning filters into a js object.");
				obj = filterObj.strToObj(localStorage[`filter-${this.name}`].replace(/s{2,}/g, " ") + " ");
			}
			return obj;
		}(); // this is the array of filters that actually gets used
		this.ids = storJson(emptyStorage(`ids-${this.cssName}`)); // this is just the array of ids and their names specific to this particular fandom
		this.enabled = localStorage[`enable-${this.cssName}`] ? storJson(localStorage[`enable-${this.cssName}`]) : true; // bc local storage stores things as strings, we can just check to make sure the local storage obj exists w/o worrying abt stuff. anyway if it doesn't exist default is true
		this.type = (fandom !== "global") ? "fandom" : fandom; // generalizes everything that isn't "global" to "fandom"
	}
	static disambiguator = /\s\((\w+(\s|&)*|\d+\s?)+\)/g; //removes disambiguators

	textbox() {
		const box = dom.pp("", "textarea", false, { id: `${this.type}Filters` });
	}

	// this turns the plain strings of the first version into objects. important for when people upgrade from prev to current
	static strToObj(filterStr) {
		// var filterStr = localStorage[`filter-${this.name}`].replace(/s{2,}/g, " ") + " ";
		const query = new Array();
		const rules = new Array();
		var lastColon = 0;
		var numParentheses = 0; // track how many parentheses deep we are currently
		for (var j = 0; j < filterStr.length; j++) {
			const char = filterStr[j];
			// if we're done with our parentheses and we're at a space...
			if ((numParentheses == 0 && char == " ") || j == filterStr.length - 1) { // if there are no parentheses && we're currently on a space, OR we've finished the string...
				var rule = filterStr.substring(lastColon + 1, j).trim();
				if (rule.startsWith("(")) {
					// if the rule starts w/a parentheses, then that means we're working w/a grouping and should thus chop off the parentheses and turn the groupings into an array
					let ruleArr; // array to hold the rules
					rule = rule.substring(1, rule.length - 1); // chops off parentheses
					if (rule.search("(") >= 0) {
						// if there are still parentheses left, then that means we have sub-groupings, so we have to iterate through the string.
						var numP2 = 0;
						var lastRule = 0;
						for (var l = 0; l < rule.length; l++) {
							const subChar = rule[l];
							if (subChar == "(") {
								numP2++;
							} else if (subChar == ")") {
								numP2--;
							} else if ((subChar == " " && numP2 == 0) || l == rule.length - 1) {
								console.log(`new rule string: ${rule.substring(lastRule, l)}`);
								lastRule = l;
							}
						}
					} else {
						// otherwise, we can just split at the " || "
						ruleArr = rule.split(/\s+\|\|\s+/g);
					}
				}
				rules.push(filterStr.substring(lastColon + 1, j).trim()); // push the substring to the rules
				lastColon = j;
			}
			if (char == ":" && numParentheses == 0) {
				query.push(filterStr.substring(lastColon, j).trim()); // if we're at a colon & have no parentheses, then pass the current subscring onto the queries
				lastColon = j;
			} else if (char == "(") {
				numParentheses++;
			} else if (char == ")") {
				numParentheses--;
			}
		}
		console.log(`query array: `, query, `\nrules array: `, rules);
		const incl = new Array(), excl = new Array(), otherQueries = new Array();
		if (query.length == rules.length) {
			for (var i = 0; i < query.length; i++) {
				query[i].startsWith("-") ? excl.push([query[i], rules[i]]) : incl.push([query[i], rules[i]]);
			}
		} else {
			var currRule = 0;
			// make arrays of the three types of queries: include, exclude, and complex
			for (var i = 0; i < query.length || i < rules.length; i++) { // because the rules would be longer than the queries in this case
				try {
					if (rules[currRule].search(":") >= 0) {
						// if it's a complex query
						otherQueries.push(rules[currRule]);
						currRule++;
					}
				} catch (e) {
					console.log("we have gone past the number of rules.");
				}
				if (i < query.length) {
					query[i].startsWith("-") ? excl.push([query[i], rules[currRule]]) : incl.push([query[i], rules[currRule]]);
				}
				currRule++;
			}
		}
		console.log(`include array: `, incl, `\nexcl array: `, excl, `\nand other queries array: `, otherQueries);
		return {
			include: incl,
			exclude: excl,
			complex: otherQueries
		};
	}

	filterText(decode = false) {
		// turns the filters object into the text that the ao3 advanced search can parse
		const ids = this.ids;
		const inc = this.filters.include, ex = this.filters.exclude, comp = this.filters.complex;
		let str = ""; // initialize the string
		for (var [key, value] of inc) {
			if (decode) {
				switch (key) {
					case "filter_ids": {
						for (const [name, number] of ids) {
							value = value.replaceAll(new RegExp(`\\b${number}\\b`, "g"), name);
						}
						break;
					}
				}
			}
			str += `${key}:${value} `;
		}
		for (var [key, value] of ex) {
			str += `${key}:${value} `;
		}
		for (const query of comp) {
			str += `${query} `;
		}
		return str.trim();
	}

	optimize() {
		const filter = localStorage[`filter-${this.name}`];
		const filts = filter.split(/\s(?=[-fcrul])/g); // split along spaces followed by -, f, c, or r
		const keepSame = new Array();
		const excls = new Array();
		let newFilter = "";
		for (const filter of filts) {
			if (filter.search(/^-filter_ids:/) >= 0) {
				excls.push(filter.replace("-filter_ids:", "")); // pops the repeated '-filter_ids:' off so that we can turn it all into one array later
			} else {
				keepSame.push(filter);
			}
		}
		for (const f of keepSame) { newFilter += `${f} `; }
		if (excls.length > 0) {
			newFilter += "-filter_ids:("; // open the parentheses
			for (var i = 0; i < excls.length; i++) {
				newFilter += excls[i]; // add the number
				if (i < excls.length - 1) { newFilter += " || "; }
			}
			newFilter += ")"; // now close the parentheses
		}
		// console.log(`newFilter for ${key}:\n`, newFilter);
		//console.log(`array of ids to filter out: `, excls, `\narray to keep the same: `, keepSame);
	}
}

/* various important global vars */
const header = document.querySelector("h2:has(a.tag)"), currentTag = header.querySelector("a.tag"), errorFlash = document.querySelector("div.flash.error"), noResults = header.innerHTML.match(/\n0\s/) ? true : false;

const savedFandoms = function () {
	if (!localStorage["saved fandoms"]) {
		return []; // if there's no saved fandoms, just return an empty array
	} else {
		try {
			return JSON.parse(localStorage["saved fandoms"]); // parse as json
		} catch (e) {
			return localStorage["saved fandoms"].split(/,/g); // backwards compatibility for before i figured out how to save jsons to local storage with JSON.stringify sadyahoos
		}
	}
}(); // returns an array

const isFandom = function () { // will return a boolean while also setting other things up
	const fandom_cutoff = 70; // 70% of fics belonging to a particular tag is the cutoff for it counting as specific to that fandom
	var raw = document.querySelector("#include_fandom_tags label"); // gets the fandom count from the dropdown on the side
	if (!raw) return false; // if there's nothing there, then we're probably on an error page and so abort
	raw = raw.innerText; // still need this for other things down the line
	var fandom = raw.replace(filterObj.disambiguator, "").trim(); // fandom name
	var fandomCount = raw.match(/\(\d+\)/).toString(); // better hope you're not in a fandom where the only disambiguator is a year
	fandomCount = parseInt(fandomCount.substring(1, fandomCount.length - 1)); // cuts off the parentheses and parses it as an integer

	var tagCount = parseInt(header.innerText.match(/(\d{1,3},?)+\sW/).toString().replace(",", "")); // fortunately, parseInt will get rid of the letters and repeat stuff for us
	if (!fandom || !fandomCount || !tagCount) return false; // if there's neither a fandom count nor a tag count, then we're not in a fandom
	var meetsCutoff = (fandomCount / tagCount * 100 >= fandom_cutoff);
	if (meetsCutoff && savedFandoms.indexOf(fandom) < 0) { //if it qualifies as being part of a fandom & is not yet in the array, add it and then save it to local storage
		savedFandoms.push(fandom);
		//localStorage[listKey] = JSON.stringify(savedFandoms);
		autosave("saved fandoms", JSON.stringify(savedFandoms));
	}
	return meetsCutoff;
}();