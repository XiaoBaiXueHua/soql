# ao3 sticky filters

going 2 hope that i'm doing the images correctly in markdown

because this script (based off [this old script by tuff](https://greasyfork.org/en/scripts/3578-ao3-saved-filters) on greasyfork and rewritten with permission) leverages the "search within results" box to automatically submit a query with the saved filters, filtering tags requires a different input than just keywords if you want it to work the same as we tend to expect these days. idk how long you've been on ao3, but it's the same method that was used to filter out tags before 2018, by using the tag's ID number.

the tag ID fetcher was similarly rewritten from [this bookmarklet by flamebyrd](https://random.fangirling.net/scripts/ao3_tag_id) to remove jquery dependency with permission.

## otherwise, here's what to expect:

### 1. when perusing a tag, there will be a button at the top that says "tag id"

![tag id button, next to the usual buttons for works, bookmarks, rss feed, etc](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/autofilter1.png)

clicking it will result in this:

![small form that shows the tag's filter_ids number, and buttons to exclude/include a particular tag](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/autofilter2.png)

the tag's id number is there for reference purposes mostly, if you want to use it in more complex queries. also "exclude" is listed first bc i'm a hater.
if you click on the include/exclude buttons, it adds the tag you're currently in to your autofilters:

![same form now says "now including genshin impact" and "changed genshin impact to exclude" at the bottom](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/autofilter3.png)

### 2. you can view, edit, and enable/disable your filters in the usual filter sidebar:

![another dropdown added to the normal ao3 "More Options" filters, labelled "Saved Filters", with two textboxes for global and fandom-specific filters and a checkbox to enable either one](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/autofilter4.png)

as you can see, the script will more or less automatically discern when you're in a particular fandom and what that fandom is. this currently works perfectly fine with Most fandoms, esp. weeb ones bc ~~they're where i hang out~~ they tend not to be sprawling multi-media franchises with like 80 differently-named spin-offs, but depending on what tag you're looking at (stuff like "percy jackson & the olympians and related fandoms" comes to mind), it might not register you as being in a certain fandom. 

i'm currently working on this lol.

the fandom filters textarea will also disappear if not in a fandom-specific tag. this does mean that if your search turns up 0 results, the fandom filters box Will disappear, but i'll fix that later.

currently & by default, when you're in a fandom-specific tag and hit the "include/exclude tag" button, that tag will be added to the saved filters for that particular fandom, whereas if you're in a non-specific tag, clicking the "include/exclude tag" will add that tag to the global filters. 

there will probably be buttons to control this better later, but for now if you wanna add a non-specific tag to your filters for just one fandom, that's pretty much why the tag's id number is also shown: so that you can copy the id number and add "`filter_ids:{id number}`" to your particular fandom filters.

### 3. autosaving and autosubmitting

the filters will save when you hit the "include/exclude" buttons or type directly into the saved filters boxes; the enabled/disabled checkbox will be checked by default, but its status will be saved every time you check or uncheck it.

as stated earlier, the script works by automatically submitting a search query to ao3 with all your filters whenever you visit a tag. this means that whenever you click on a raw tag, you will end up sending *two* page requests to ao3 (one for the tag itself, and then another immediately after for the filtered page). to reduce the number of times one ends up in ao3 request-limiting jail, the script will also check to make sure you actually have filters saved **and** enabled before trying to auto-filter.

it also means that disabling one's filters before running around to add a bunch of tags is *highly* recommended to prevent rate-limiting, as, unless you already know its id number, *you still have to visit each tag's page* to add it to your filters.

once your results have been filtered, you'll get a neat little "**FILTERS:**" dropdown underneath the tag heading, which you can then click on to view your saved filters (and any extra temp queries put into the "seach within results" box):

![aforementioned filter drop-down, with different paragraphs of differently-highlighted text for advanced search, global, and fandom filters](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/autofilter6.png)

obviously, it doesn't currently tell you the Names of the things you're filtering, so if you care about that, you have to keep your own documentation of id numbers for now.

all this is saved in your browser's local storage, so it will not go away by uninstalling and reinstalling the extension/userscript, nor will it carry between devices. however, if for whatever reason, you make a syntax error in your searches or saved filters...

### 4. error page debugger

![ao3 syntax error search page, now with variously labelled text areas with their saved filters](https://github.com/XiaoBaiXueHua/soql/blob/main/docs/img/autofilter7.png)

you will be shown *All* of your various filters to double-check and edit for errors.

at the moment, you have to go *find* the tag again to see have your newly-debugged filters reapplied, but what matters for now is that this debugger exists at all.

## other filtration references

