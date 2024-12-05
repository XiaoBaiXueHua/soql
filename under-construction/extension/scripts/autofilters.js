console.log(`hi!!!!!! this is the autofilters script from the EXTENSION`)

browser.tabs.executeScript({
	file: `/content_scripts/autofilter-listener.js"`
});