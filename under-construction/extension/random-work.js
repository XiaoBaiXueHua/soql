const worksPerPage = 20; // ao3 only shows 20 per page but idk maybe want to use this for other sites that have varying. ao3 is meant to be package software after all.
const currURL = new URL(document.URL);
const currPath = currURL.pathname, currSearch = currURL.search; // return strings

// sample currURL, currPath, and currSearch when looking at an unfiltered search: 
// current url: https://archiveofourown.org/tags/Venti*s*Xiao%20%7C%20Alatus%20(Genshin%20Impact)/works
// current path: /tags/Venti*s*Xiao%20%7C%20Alatus%20(Genshin%20Impact)/works
// current search: 


// sample currPath and currSearch when looking at search w/just otp:true on page 1:
// current url: https://archiveofourown.org/works?commit=Sort+and+Filter&work_search%5Bsort_column%5D=revised_at&work_search%5Bother_tag_names%5D=&work_search%5Bexcluded_tag_names%5D=&work_search%5Bcrossover%5D=&work_search%5Bcomplete%5D=&work_search%5Bwords_from%5D=&work_search%5Bwords_to%5D=&work_search%5Bdate_from%5D=&work_search%5Bdate_to%5D=&work_search%5Bquery%5D=otp%3Atrue&work_search%5Blanguage_id%5D=&tag_id=Venti*s*Xiao+%7C+Alatus+%28Genshin+Impact%29
// current path: /works
// current search: ?commit=Sort+and+Filter&work_search%5Bsort_column%5D=revised_at&work_search%5Bother_tag_names%5D=&work_search%5Bexcluded_tag_names%5D=&work_search%5Bcrossover%5D=&work_search%5Bcomplete%5D=&work_search%5Bwords_from%5D=&work_search%5Bwords_to%5D=&work_search%5Bdate_from%5D=&work_search%5Bdate_to%5D=&work_search%5Bquery%5D=otp%3Atrue&work_search%5Blanguage_id%5D=&tag_id=Venti*s*Xiao+%7C+Alatus+%28Genshin+Impact%29


// sample for page 7 raw:
// current url: https://archiveofourown.org/tags/Venti*s*Xiao%20%7C%20Alatus%20(Genshin%20Impact)/works?page=7 debugger eval code:3:11
// current path: /tags/Venti*s*Xiao%20%7C%20Alatus%20(Genshin%20Impact)/works
// current search: ?page=7

// sample for on page 7, otp:true:
// current url: https://archiveofourown.org/tags/Venti*s*Xiao%20%7C%20Alatus%20(Genshin%20Impact)/works?commit=Sort+and+Filter&page=7&work_search%5Bcomplete%5D=&work_search%5Bcrossover%5D=&work_search%5Bdate_from%5D=&work_search%5Bdate_to%5D=&work_search%5Bexcluded_tag_names%5D=&work_search%5Blanguage_id%5D=&work_search%5Bother_tag_names%5D=&work_search%5Bquery%5D=otp%3Atrue&work_search%5Bsort_column%5D=revised_at&work_search%5Bwords_from%5D=&work_search%5Bwords_to%5D= debugger eval code:3:11
// current path: /tags/Venti*s*Xiao%20%7C%20Alatus%20(Genshin%20Impact)/works
// current search: ?commit=Sort+and+Filter&page=7&work_search%5Bcomplete%5D=&work_search%5Bcrossover%5D=&work_search%5Bdate_from%5D=&work_search%5Bdate_to%5D=&work_search%5Bexcluded_tag_names%5D=&work_search%5Blanguage_id%5D=&work_search%5Bother_tag_names%5D=&work_search%5Bquery%5D=otp%3Atrue&work_search%5Bsort_column%5D=revised_at&work_search%5Bwords_from%5D=&work_search%5Bwords_to%5D=

const currPg = function () {
	var pgMatch = currSearch.match(/page=\d+/);
	if (pgMatch.length > 0) {
		return parseInt(pgMatch[0].replace(/\D/g, "")); // cut off the "page=" bit of the first match in the array
	} else {
		return 1; // if there aren't any matches, then we must be on the first page
	}
}()

const total = function () {
	let numPgs = 1;
	try {
		numPgs = parseInt(document.querySelector("ol.pagination li:nth-last-child(2)").innerText)
	} catch (e) {
		console.log("this page has no pagination.");
	} finally {
		return numPgs;
	}
}();

var newSearch = (total == 1) ? 1 : rand(total);
const oldQuery = currSearch.replace("?commit=Sort+and+Filter", "").replace(/&page=(\d)+/, "");

function rand(ub, lb=0) {
	return Math.round(Math.random() * ub) - lb;
}

function randWork(el) {
	// should return a random work on the page (called "el" here bc when fetching pages, they get chucked into a div upon return so that we can use querySelector in it)
	const works = el.querySelectorAll(`ol.work.index.group li.work`);
	if (!works) {
		alert("there were no works on that page. sorry.");
	} else {
		const work = works[rand(20)];
	}
}

async function fetchPage(url) {
	// should only take RELATIVE urls
	const response = await fetch(new Request(url));
	const txt = await response.text();
	const tmpDiv = document.createElement("div");
	tmpDiv.innerHTML = txt;
	return tmpDiv;
}