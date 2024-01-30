// ==UserScript==
// @name         autoaccept ao3 tos
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  automatically accepts the tos for using ao3 when logged out.
// @author       白雪花
// @match        https?://archiveofourown.org*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @grant        none
// ==/UserScript==

if (!localStorage["accepted_tos"]) {
    localStorage.setItem("accepted_tos", "20180523");
};