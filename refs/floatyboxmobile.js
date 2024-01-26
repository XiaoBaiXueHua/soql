// ==UserScript==
// @name         floaty review box mod (mobile)
// @namespace    saxamaphone
// @version      0.1
// @description  Adds a floaty review box
// @author       You
// @match        https://archiveofourown.org/works/*
// @grant        none
// ==/UserScript==

// From http://stackoverflow.com/a/1909997/584004
(function (jQuery, undefined) {
    jQuery.fn.getCursorPosition = function() {
        var el = jQuery(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    };
})(jQuery);

// From http://stackoverflow.com/a/841121/584004
(function (jQuery, undefined) {
    jQuery.fn.selectRange = function(start, end) {
        if(end === undefined) {
            end = start;
        }
        return this.each(function() {
            if('selectionStart' in this) {
                this.selectionStart = start;
                this.selectionEnd = end;
            } else if(this.setSelectionRange) {
                this.setSelectionRange(start, end);
            } else if(this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
})(jQuery);

//these two things fetch the story id for the first/last page buttons

// From http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513, modified to allow [] in params
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search.replace(/\[/g, '%5B').replace(/\]/g, '%5D')) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function getStoryId() {
    var aMatch = window.location.pathname.match(/works\/(\d+)/);
    if (aMatch !== null)
        return aMatch[1];
    else
        return jQuery('#chapter_index li form').attr('action').match(/works\/(\d+)/)[1];
}

//this is what actually makes the review box

jQuery(window).ready(function() {
    // HTML to define layout of popup box
    // Include x button to close box
    var sHtml = '<span style="position: relative; border-radius:1000px; top: 0; right:-5px: float:right; z-index:999;" class="close actions" id="close_floaty"><a aria-label="cancel" style="padding:5px; margin: -0.5em 0;">×</a></span>';
            // Button to insert highlighted text and for a help lis
            // sHtml += '<ul class="actions" style="float: left; margin-top: 10px;"><li id="insert_floaty_text"><a>Insert</a></li><li id="pop_up_review_tips"><a>Review Tips</a></li></ul>';
            // Textarea
            sHtml += '<textarea style="box-sizing:border-box; font-size:0.85em;margin: 0; width: 100%; max-width:98vw; min-height: 12em; resize:none;" id="floaty_textarea"></textarea>';

            // Create popup box
            jQuery("<div/>", {
                id: "reviewTextArea",
                width: "98vw", // Change for dimensions
                height: 200, // Change for dimensions
                css: {
                    backgroundColor: "#ffffff",
                    opacity: 0.75,
                    border: "thin solid black",
                    display: "inline-block",
                    padding: 2,
                    //"flex-display": "row",
                    //"padding-right": 2,
                    position: "fixed",
                    bottom: "5vh",
                    //
                    right: "1vw",
                    "box-sizing": "border-box"
               },
                html: sHtml
            }).resizable().draggable().appendTo("body");

    // Hide the popup box by default (comment out line below if you want it to always appear by adding // before it)
            jQuery('#reviewTextArea').hide();

            // To close the box
            jQuery('#close_floaty').click(function () {
                jQuery('#reviewTextArea').hide();
            });

            // Anything you type in the box gets inserted into the real comment box below
            jQuery('#floaty_textarea').on('input', function () {
                jQuery('.comment_form').val(jQuery('#floaty_textarea').val());
            });

            // Add Float review box button to the top
            jQuery('ul.work').prepend('<li id="floaty_review_box"><a>Floaty Review Box</a></li>');

            // If the above button is clicked, display the review box
            jQuery('#floaty_review_box').click(function () {
                jQuery('#reviewTextArea').show();
            });

            // Insert highlighted/selected text into textarea when Insert button is clicked
            jQuery('#insert_floaty_text').click(function () {
                var sInitialText = jQuery('#floaty_textarea').val();
                var iPosition = jQuery('#floaty_textarea').getCursorPosition();

                var sHighlightedText = window.getSelection().toString();

                var sNewText = sInitialText.substr(0, iPosition) + '<i>"' + sHighlightedText + '"</i>\n' + sInitialText.substr(iPosition);
                jQuery('#floaty_textarea').val(sNewText);
                jQuery('#floaty_textarea').focus();
                jQuery('#floaty_textarea').selectRange(iPosition + sHighlightedText.length + 10);

                // Copy into real comment box
                jQuery('.comment_form').val(jQuery('#floaty_textarea').val());
            });


    //the rest makes the first + last page buttons

    // Before adding button for Last Chapter, make sure we're not on the last (or only) chapter already
            if (jQuery('.next').length) {
                // Add button for Last Chapter
                jQuery('ul.work').prepend('<li id="go_to_last_chap"><a>Last Chapter</a></li>');

                // If the above button is clicked, go to last chapter
                jQuery('#go_to_last_chap').click(function () {
                    window.location.href = '/works/' + getStoryId() + '/chapters/' + jQuery('#selected_id option').last().val();
                });
            }

            // Adding a First Chapter button
            if (jQuery('.previous').length) {
                // Add button for First Chapter
                jQuery('ul.work').prepend('<li id="go_to_first_chap"><a>First Chapter</a></li>');

                // If the above button is clicked, go to first chapter
                jQuery('#go_to_first_chap').click(function () {
                    window.location.href = '/works/' + getStoryId();
                });
            }
});
