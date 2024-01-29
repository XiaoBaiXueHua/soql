//original by flamebyrd at https://random.fangirling.net/scripts/ao3_title_text
javascript:(function(w,d,f){var v="1.3.2";if(w.jQuery===undefined||w.jQuery.fn.jquery<v){var done=false;var s=d.createElement("script");s.src="//code.jquery.com/jquery-"+v+".min.js";s.onload=s.onreadystatechange=function(){if(!done&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){done=true;console.log("loaded jQuery");f(jQuery.noConflict())}};d.getElementsByTagName("head")[0].appendChild(s)}else{f(jQuery)}})(window,document,function(jQuery){(function($) {
	//the part that you put into the bookmarklet maker starts here
  $('.userstuff [title]').each(function() {

    $(this).append(' [' + $(this).attr('title') + ']');

  })
  //yeah it's like a two-line script
})(jQuery);

});

//rewritten to regular js. also like a two-line script bc the original's procedure n output is good imo
const userstuff = document.querySelectorAll(".userstuff [title]");
for (var title of userstuff) {
	title.append(` [${title.attr("title")}]`);
}