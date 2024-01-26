// ==UserScript==
// @name        ao3 saved filters
// @description Adds fields for persistent global & fandom filters to works index pages on AO3
// @namespace   ao3
// @match     http*://archiveofourown.org/tags/*/works*
// @match     http*://archiveofourown.org/works?work_search*
// @match     http*://archiveofourown.org/works?commit=*&tag_id=*
// @grant       none
// @version     1.5
// ==/UserScript==
//as a note to self for the future, this is how you get the colors of a particular thing in vanilla js: window.getComputedStyle(document.querySelector("main")).backgroundColor;
(function ($) {
	// config
	var TAG_OWNERSHIP_PERCENT = 70; // the top fandom which owns works in the current tag must own at least this percent in order to be considered the search's active fandom
	var works = $('#main.works-index'),
		form = $('form#work-filters');
	if (!works[0] || !form[0]) return;
	var fandomName = (function () {
		//fetches the fandom name you're searching through
			var fandom = $('#include_fandom_tags label').first().text(); //this gets the text of the first label in the include_fandom_tags id
			var fandomCount = parseInt(fandom.substring(fandom.lastIndexOf('(') + 1, fandom.lastIndexOf(')'))); //fetches the number of works in that tag by taking the number inside the parentheses n parsing it as an integer
			var tagCount = works.find('.heading').first().text(); //oh, and then i think that this does the same thing but for non-fandom_ids, basically
			tagCount = tagCount.substring(0, tagCount.indexOf(' Works')); //chops off the word "works"
			tagCount = parseInt(tagCount.substring(tagCount.lastIndexOf(' ') + 1));
			fandom = fandom.substring(0, fandom.lastIndexOf('(')).trim();
			if (!fandom || !fandomCount || !tagCount) {
				return;
			}
			return (fandomCount / tagCount * 100 > TAG_OWNERSHIP_PERCENT) ? fandom : null;
		})(),
        //these name & the local storage things that will hold your filters
		tempKey = 'temp-filter',
		tempFilter = localStorage[tempKey],
        //key & value for global filter
		tempGlobalKey = 'temp-global-filter',
		tempGlobalFilter = localStorage[tempGlobalKey],
        //key & value for this particular fandom's filter
		tempFandomKey = 'temp-fandom-filter',
		tempFandomFilter = localStorage[tempFandomKey],
        //names the keys; their values will be set later
		globalKey = 'global-filter',
		fandomKey = fandomName ? 'filter-' + fandomName : '', 
        //makes the input box for the global filters
		globalBox = $('<textarea>')
        //evaluate if the keys in local storage are the same for the global filters
		.val(localStorage[globalKey] ? localStorage[globalKey] : ''),
        //makes the input box for the fandom filters
		fandomBox = fandomKey ? globalBox.clone()
        //checks what fandom you're in n then if the local storage is the same etc
		.val(localStorage[fandomKey] ? localStorage[fandomKey] : '') : $(),
        //fetch the real search w/in results box
		search = $('#work_search_query'),
        //find the <dd> the real search w/in results box is kept in
		dt = search.parents('dd')
		.first()
		.prev(dt),
        //the real search box is saved as a variable
		realSearch = $('<textarea>')
        //its name is fetched(?)
		.attr('name', search.attr('name'))
        //and its display is set to 0 so that we can make a ~fake~ search w/in results box for our temp filter
		.css('display', 'none')
        //and then we insert the fake search w/in results box(?)
		.insertAfter(search.removeAttr('name')),
        //make the collapser  for the added fields n style it
		collapser = $('<dt>')
		.addClass('saved-filters-collapser'),
		rightArrow = $('<img>')
		.attr('src', '/images/arrow-right.gif?1352358192'),
		downArrow = $('<img>')
		.attr('src', '/images/arrow-down.gif?1352358192'),
		container = $('<div>')
		.addClass('saved-filters'),
        //decodes the url for the previous search "FILTERS: " dropdown
		prevSearch = (function () {
			var ps, key = realSearch.attr('name') + '=';
            //get the current url
			if (decodeURIComponent(window.location)
            //if the current filters can be found in it
				.indexOf(key) > 0) {
				ps = decodeURIComponent(window.location);
				ps = ps.substring(ps.indexOf(key) + key.length);
				ps = ps.indexOf('&') != -1 ? ps.substring(0, ps.indexOf('&')) : ps;
			}
			return ps;
		})();
        //sets the css for the saved filters box
	$('<style>')
		.text('.saved-filters-collapser { cursor: pointer; } .saved-filters, saved-filters > div { margin-bottom: 0.6em; } .saved-filters textarea { min-height: 8em; font-family: monospace; scrollbar-width: thin!important; resize: none; box-sizing: border-box;} .saved-filters div label { padding-left: 3px; } .prev-search span { color: #000; font-family: monospace; font-size: 9pt;} .prev-search .temp { background: #d3fdac; } .prev-search .global { background: #bfebfd; } .prev-search .fandom { background: #d8cefb; } .js-enabled-checkbox {clip: auto; margin: 0.125em 0; margin-right: 0.3em; position: relative; min-height: 1.25em; width: auto;}')
		.appendTo($('head'));
    //makes the input boxes
	globalBox.addClass('global-filter')
		.add(fandomBox.addClass('fandom-filter'))
		.each(function () {
			var ta = $(this),
				cls = ta.attr('class'),
				title = cls.charAt(0)
				.toUpperCase() + cls.substring(1, cls.indexOf('-')) + ':';
			$('<div>')
				.addClass(`${cls} ao3-saved-filters-section`)
				.prepend(title)
				.append(ta.removeClass(), $('<label>')
					.text('Enabled')
					.prepend($('<input>')
						.attr({
							'type': 'checkbox'
						})
						.addClass('js-enabled-checkbox')
						.css({
							clip: 'auto',
							'margin-right': '0.3em',
							position: 'relative',
							"min-width": 10,
							width: '6px',
							height: '6px'
						})), $('<button>')
					.attr('type', 'button')
					.addClass('action js-save-filter')
					.text('Save'))
				.appendTo(container);
		});
    //checks if the filters are enabled n what they are
	container.find('.ao3-saved-filters-section')
		.each(function () {
			var $section = $(this),
				$checkbox = $section.find('.js-enabled-checkbox'),
				$saveButton = $section.find('.js-save-filter'),
				key = $saveButton.parents('.global-filter')[0] ? globalKey : fandomKey,
				checked = localStorage[key + '-on'] !== 'false';
			$checkbox.attr('checked', checked);
            //when you click the save button, save the new input to local storage
			$saveButton.click(function () {
				localStorage[key] = $saveButton.siblings('textarea')
					.val();
				localStorage[key + '-on'] = $checkbox.is(':checked') + '';
			});
		});
    //checks if there's a temp search to add; otherwise clear the local storage for the temp filter
	if (tempFilter && search.val()
		.indexOf(tempFilter) != -1) {
		search.val(tempFilter);
	} else {
		localStorage[tempFilter] = '';
		search.val('');
	}
    //makes the container for the saved filters n stuff
	container = $('<dd>')
		.append(container);
	collapser.prepend(rightArrow, ' Saved Filters')
		.click(function () {
			container.toggle();
			collapser.children('img')
				.replaceWith(container.is(':visible') ? downArrow : rightArrow);
		})
		.add(container.hide())
		.insertBefore(dt);
    //when you hit "search" (or first enter a tag), check if the things have been checkmarked and if the url has any matches
	form.submit(function () {
		var val = search.val() || '';
		container.find('.ao3-saved-filters-section')
			.each(function () {
				var $section = $(this);
				var $textarea = $section.find('textarea');
				var enabled = $section.find('.js-enabled-checkbox')
					.is(':checked');
				var key = $textarea.parents('.global-filter')[0] ? tempGlobalKey : tempFandomKey;
				if ($textarea.val() && enabled) {
					localStorage[key] = $textarea.val();
					if ((' ' + val + ' ')
						.indexOf(' ' + $textarea.val() + ' ') < 0) {
						val += ' ' + $textarea.val();
					}
				} else if (localStorage[key]) {
					localStorage[key] = '';
				}
			});
		localStorage[tempKey] = search.val();
		realSearch.val(val);
	});
	console.log(`tempFilter: ${tempFilter}`);
	console.log(`fandomKey: ${fandomKey}`);
	console.log(`tempFandomFilter: ${tempFandomFilter}`);
	console.log(`globalKey: ${globalKey}`);
	console.log(`tempGlobalFilter: ${tempGlobalFilter}`);
	console.log(`fandomName: ${fandomName}`);
	console.log(`prevSearch: ${prevSearch}`);
    //if there was previously a search (and since it's set to automatically filter, there Will be), make that prev search dropdown
	if (prevSearch) {
		prevSearch = '<details style="padding:10px;"><summary><big><strong>FILTERS:</strong></big> </summary><div style="padding-left: 45px;">';
		if (tempFilter) {
			prevSearch += '<p><strong>Search Within Results:</strong><br><span class="temp">' + tempFilter + '</span></p>';
		};
		if (tempGlobalFilter) {
			prevSearch += '<p><strong>Global Filters:</strong><br><span class="global">' + tempGlobalFilter + '<br></p>';
		};
		if (tempFandomFilter) {
			prevSearch += '<p><strong>' + fandomName + ' Filters:</strong><br><span class="fandom">' + tempFandomFilter + '</span></p>';
		};
		prevSearch += '</div></details>';
		works.find('.heading')
			.first()
			.after($('<div>')
				.addClass('prev-search')
				.append(prevSearch));
	} else if ((localStorage[globalKey] && localStorage[globalKey + '-on'] !== 'false') || (localStorage[fandomKey] && localStorage[fandomKey + '-on'] !== 'false')) {
        //otherwise automatically apply the filters
		form.submit();
	}
})(window.jQuery);