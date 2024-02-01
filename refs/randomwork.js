// ==UserScript==
// @name         AO3: Jump to a Random Work
// @namespace    https://greasyfork.org/en/users/906106-escctrl
// @version      0.2
// @description  adds a "Random Work" button (top right corner) when viewing works in a tag/filter or your Marked For Later list
// @author       escctrl
// @match        *://*.archiveofourown.org/tags/*/works*
// @match        *://*.archiveofourown.org/works?*
// @match        *://*.archiveofourown.org/users/*/readings*show=to-read*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js
// @grant        none
// @license      MIT
// ==/UserScript==

(function($) {
    'use strict';

    // add a button
    var button = document.createElement('li');
    button.innerHTML = '<a href="#">Random Work</a>';
    button.addEventListener("click", RandomWork);
    if (location.href.indexOf('show=to-read') > 0) document.querySelector('div#main.readings-index ul.navigation.actions').appendChild(button);
    else document.querySelector('div#main.works-index div.navigation.actions.module ul.user.navigation.actions').appendChild(button);

    // when the button was pressed, read the number of works, pick a random one, and redirect there
    function RandomWork() {

        // Find number of pages. content of second-to-last <li> tells us
        var pageCount = parseInt($('ol.pagination').first().find('li').last().prev().text() || 1);

        // pick random whole number of the available pages
        const pageRandom = Math.floor((Math.random() * pageCount) + 1);

        // figure out which page we're currently viewing
        var thisPage = location.search.match(/page=(\d)+/);
        thisPage = thisPage === null ? 1 : parseInt(thisPage[1]); // match only works if URL contained a page (i.e. if not on page 1)

        // check: are we currently on the randomly chosen page?
        if (thisPage !== pageRandom) LoadRandomPage(pageRandom); // if not - read that page to find a random work link
        else Redirect2Work($('ol.work.index.group li.work.blurb')); // if yes - skip page loads, read a random work link from this page
    }

    function LoadRandomPage(r) {
        // build the URL of the page to load
        var pageURL = location.search.indexOf('page=') > 0 ? location.href.replace(/page=(\d)+/, 'page='+r) // replace existing page number
            : location.href + (location.href.indexOf('?') > 0 ? '&' : '?') + 'page='+r; // add page number if not yet in URL search parameters

        // grab the list of works from the page
        $.get(pageURL, function(response) {
        }).done(function(response) {
            Redirect2Work($(response).find('ol.work.index.group li.work.blurb'));

        // if that sent us to jail, set the ao3jail marker
        }).fail(function(data, textStatus, xhr) {
            console.log("Random Work script has hit Retry later", data.status);
            return false;
        });
    }

    function Redirect2Work(worksList) {
        // pick a random work from within the list
        var pick = Math.floor((Math.random() * worksList.length) + 1);

        // read that random work's URL and title
        pick = $(worksList[pick-1]).find('h4 a').first();
        var path = $(pick).attr('href');
        var title = $(pick).text();

        // jump to that work but warn the user
        //alert('Redirecting you to a random work: '+title);
        window.location.assign(path);
    }

})(jQuery);