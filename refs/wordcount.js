// ==UserScript==
// @name       AO3 Chapter Wordcount
// @namespace  http://random.fangirling.net/fun/ao3/
// @version    1.0.4
// @description  Displays an estimated chapter wordcount in addition to the work wordcount.
// @match      http*://*.archiveofourown.org/*
// @copyright  2018+, Flamebyrd
// @grant       none
// ==/UserScript==
(function($) {
    jQuery(document).ready(function() {
        var work_wordcount = $('dd.words').text();
        if ($('dd.chapters').text() != '1/1' && $('#chapters > .chapter').length == 1 ) {
            var chapter_wordcount = $('.userstuff').text().trim().split(/\S+/g).length;
            chapter_wordcount.toLocaleString("en-US");
            $('h3.title').append('<p><span style="font-size:0.85em; color:#666666;"> (' + chapter_wordcount + ' words)</span></p>');
        }
    });
})(jQuery);