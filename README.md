# slice of quality life ao3 userscripts

hi i like ao3 and the various userscripts i currently use don't always play nicely or do everything i want and also tend to rely on jQuery. i mostly just want to rewrite my faves into vanilla js, partly for practice, but also on the vague desire to bundle them together into a browser extension someday so that more people can have my incredibly Powerful filtering skills.

also yes the name is a play on "slice of life" (trope) and "quality of life" (features).

## the floaty review box

this is the script that introduced me to the concept of userscripts and is by far my favorite ever. [originally written by tumblr user ravenel](https://ravenel.tumblr.com/post/156555172141/i-saw-this-post-by-astropixie-about-how-itd-be), [i also found a version that used vanilla js + saved one's progress](https://greasyfork.org/en/scripts/395902-ao3-floating-comment-box) (but looked ugly :(), so i, like, coded up a version that 
1. looked cute to my standards on both desktop **&&** mobile
2. saved my progress in case i needed to refresh or forgot the tab or it crashed or any number of other silly things i tend to do when reading fic
3. was convenient to summon even on my phone

it's still a little hacked together n has a lot of event listeners (which i'm not sure is ideal?) but hey at least it works for the moment. it still has some bugs (esp. on mobile), namely:
1. why does the floaty review box button look unstyled on mobile
2. how come none of the buttons work after pressing it the first time and then scrolling a bit :C

but what matters is that it SCROLLS WITH YOU and SAVES YOUR PROGRESS and has a CONVENIENT LITTLE BUTTON THAT SHOWS UP IN THE CORNER when you refresh the page.

## the automatic sticky filters

[the original script](https://greasyfork.org/en/scripts/3578-ao3-saved-filters) by tuff on greasyfork was made in like 2014 and utilizes the __search within results__ box for its filtration purposes. however, ever since ao3 added in native exclusion filters in like 2018, the skills required to use such a script properly (or as expected) have depreciated in the general ao3 userbase.

thus, i have combined it with [this tag id fetcher bookmarklet](https://random.fangirling.net/scripts/ao3_tag_id) by [flamebyrd](https://flamebyrd.dreamdwidth.org) to add in this tag id ui:
![tag id button with the submission form showing the include/exclude buttons](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/tagidui.png)
the filters will also autosave n stuff :D

anyway every time i showcase the script to a friend, i discover some new minor bug, and there will probably be more found moving forward, but here are some known ones:
1. when using the script for the very first time, its first-ever search will include the word "undefined" in it. it has smth to do with the way the code puts values into the search w/in results box, but i'm too lazy to suss it out atm since it's just that first time
2. if you refresh the page and then try to include/exclude the tag again, it'll still append the tag. however, if you click on it again WITHOUT refreshing, then it'll (correctly!) show "this tag is already being filtered!" it should show "this tag is already being filtered!" both times.
3. it's also not tested on logged-out users, which means that freeform tags (which rely entirely on the favorite_tag_tag_id method) will not be filtered properly. ideally, the form should then show "you need to be logged in to get this tag id :(" (unless it's for chatfics in which case i can say for a fact that it's `filter_ids:106225`.)

there's more i'd like to do with this script, ofc, which would probably be best realized through a full browser extension lol but even then, they are thusly:
1. since the tag id fetcher also works on users n works by getting their subscribable ids, also add in options on user and works pages to filter out those users/works specifically (without need for muting!)
2. smth smth "add in the ability to automatically determine sorting order" and "options for some of the lesser-known, non-filter_ids methods of querying the ao3 database like `expected_number_of_chapters` or `backdate` or `in_anon_collection`" sort of thing.