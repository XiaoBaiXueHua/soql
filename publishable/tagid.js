//bookmarklet by flamebyrd: https://random.fangirling.net/scripts/ao3_tag_id
javascript:(function() { 
    function callback() { 
        (function ($) { 
            /* START the part of the script you'd actually, like, plug into the bookmarklet maker (https://mrcoles.com/bookmarklet/) */
            var jQuery = $; 
            if ($('#favorite_tag_tag_id').length) { 
                console.log(`#favorite_tag_tag_id method:`);
                tag_id = $('#favorite_tag_tag_id').val();
                console.log(`tag_id: ${tag_id}`); 
            } else if ($('a.rss').length) { 
                regex = /\/tags\/(\d*)\/feed\.atom/g; 
                console.log(`regex: ${regex}`);
                match = regex.exec($('a.rss').attr('href')); 
                console.log(`match: ${match}`);
                tag_id = match[1]; 
                console.log(`tag_id:${tag_id}`);
            } else if ($('input[name="work_search[freeform_ids][]"]:first').length) { 
                console.log('input[name="work_search[freeform_ids][]"]:first method');
                tag_id = $('input[name="work_search[freeform_ids][]"]:first').val(); 
                console.log(`tag_id:${tag_id}`);
            } else if ($('#subscription_subscribable_id').length) { 
                console.log(`#subscription_subscribable_id method:`);
                tag_id = $('#subscription_subscribable_id').val(); 
                console.log(`tag_id: ${tag_id}`);
            } 
            alert(tag_id); 
            /* END the bit you'd plug into the bookmarklet maker */
        })
        (jQuery.noConflict(true)); 
    } 
    var s = document.createElement("script"); 
    s.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"; 
    if (s.addEventListener) { 
        s.addEventListener("load", callback, false) 
    } else if (s.readyState) { 
        s.onreadystatechange = callback 
    } 
    document.body.appendChild(s); 
}) ()