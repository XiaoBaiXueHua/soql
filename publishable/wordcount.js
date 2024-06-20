// ==UserScript==
// @name       AO3 Chapter Wordcount
// @namespace  http://random.fangirling.net/fun/ao3/
// @version    1.0.5
// @description  Displays an estimated chapter wordcount in addition to the work wordcount.
// @match      http*://*.archiveofourown.org/*
// @copyright  2018+, Flamebyrd
// @grant       none
// ==/UserScript==

const chaps = document.querySelectorAll(`div[id^="chapter-"]`); // gets the chapter divs. could have also just done ".chapter" but for some reason i'm suddenly paranoid abt someone deciding to use the chapter class w/in their work. so anyway
if (chaps.length > 0) { // so, like, don't bother if we're in a oneshot
    for (const ch of chaps) { // now works on multichapters!
        const word_count = ch.querySelector(`div.userstuff.module`).innerText.trim().split(/\s+/g).length.toLocaleString();
        const ch_head = ch.querySelector("h3.title");
        ch_head.insertAdjacentHTML("afterend", `<p class="wordcount">(${word_count} words)</p>`);
    }
    // now for styling
    const style = document.createElement("style");
    style.innerHTML = `.wordcount {font-size: 1.1em; text-align: center; margin-top: 5px; font-family: Georgia, serif;}`;
    document.querySelector("head").appendChild(style);

}
/*
//original version by flamebyrd
(function($) {
    jQuery(document).ready(function() {
        var work_wordcount = $('dd.words').text();
        if ($('dd.chapters').text() != '1/1' && $('#chapters > .chapter').length == 1 ) {
            var chapter_wordcount = $('.userstuff').text().trim().split(/\S+/g).length;
            chapter_wordcount.toLocaleString("en-US");
            $('h3.title').append('<p><span style="font-size:0.85em; color:#666666;"> (' + chapter_wordcount + ' words)</span></p>');
        }
    });
})(jQuery);*/