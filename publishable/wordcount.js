// ==UserScript==
// @name       AO3 Chapter Wordcount
// @namespace  http://random.fangirling.net/fun/ao3/
// @version    1.0.4
// @description  Displays an estimated chapter wordcount in addition to the work wordcount.
// @match      http*://*.archiveofourown.org/*
// @copyright  2018+, Flamebyrd
// @grant       none
// ==/UserScript==

const ch_head = document.querySelector(".chapter.preface.group");
var word_count = document.querySelector("#workskin div.userstuff.module");
if (ch_head) {
    const color = window.getComputedStyle(document.querySelector("h3.title a")).color;
    const style = document.createElement("style");
    style.innerHTML = `.wordcount {font-size: 1.1em; color: ${color}; text-align: center; margin-top: 5px; font-family: Georgia, serif;}`;
    document.querySelector("head").appendChild(style);
    word_count = word_count.innerText.trim().split(/\S+/g).length.toLocaleString(); //won't work on cn n stuff but eh
    const title = document.querySelector("h3.title");
    title.insertAdjacentHTML("afterend", `<p class="wordcount">(${word_count} words)</p>`);
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