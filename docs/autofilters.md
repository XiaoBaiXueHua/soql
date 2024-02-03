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

ao3 uses apache lucene to parse their search queries, [so please refer to their documentation](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html) for basic information about including, excluding, or grouping queries.

### unobtainable id numbers

some tags do not have ids which can be fetched with the tag id button, because they do not have a raw tag to click on. fortunately, ao3 provided these numbers in [an admin post back in like 2013](https://archiveofourown.org/admin_posts/349).

#### RATINGS

| TAG               | ID NUMBER       |
|-------------------|-----------------|
| Not Rated         | `filter_ids:9`  |
| General Audiences | `filter_ids:10` |
| Teen & Up         | `filter_ids:11` |
| Mature            | `filter_ids:12` |
| Explicit          | `filter_ids:13` |

#### WARNINGS

| TAG | ID NUMBER |
|---|---|
| Author Chose Not To Use Archive Warnings | `filter_ids:14` |
| No Archive Warnings Apply | `filter_ids:16` |
| Graphic Depictions of Violence | `filter_ids:17` |
| Major Character Death | `filter_ids:18` |
| Rape/Non-Con | `filter_ids:19` |
| Underage | `filter_ids:20` |

#### CATEGORIES

| TAG | ID NUMBER |
|---|---|
| General | `filter_ids:21` |
| M/F | `filter_ids:22` |
| M/M | `filter_ids:23` |
| Other | `filter_ids:24` |
| F/F | `filter_ids:116` |
| Multi | `filter_ids:2246` |

### other parameters

tags aren't the only thing you can search by, though!! here's a list of various inputs i've found by digging through ao3's source code and subsequently tested to confirm as working.

please bear in mind that *except* for the **booleans**, these will all accept ranges!

#### INTEGERS 

(aka plain numbers)

##### Work Data / Stats

| PARAMETER | DESCRIPTION |
|---|---|
| `word_count` | work's word count |
| `major_version` | closest approximation to "current number of chapters" available, although testing suggests that it also counts drafted and deleted chapters. |
| `minor_version` | increases every time a creator hits the "Edit" button, it seems. honestly kind of useless. |
| `expected_number_of_chapters` | work's final chapter count. for oneshots, this is 1. may or may not be complete. |
| `hits` | number of hits to the work |
| `comment_count` | number of comments |
| `kudos_count` | number of kudos |
| `bookmarks_count` | number of bookmarks |

##### Other Types of Tag IDs

| TAG TYPE |
|---|
| `fandom_ids` |
| `character_ids` |
| `relationship_ids` |
| `freeform_ids` |

because these numbers will be the same as the one the tag id fetcher labels `filter_ids`, these filter types are most useful when trying to include or exclude swathes of Particular tag types.

for example, for WHATEVER reason, jujutsu kaisen has its anime and its manga listed as separate, unrelated fandoms in ao3's database. because many jjk fans will tag their works with both the anime **and** the manga for its fandom, this means when you try to filter out crossovers using the usual additional options, most jjk fics will be filtered out. 

this obviously sucks ass, but you can filter out all other fandoms with one easy input!
`-fandom_ids:>49281637 -fandom_ids:<28410929 -fandom_ids:{28410929 TO 49281637}`

##### Other ID Numbers

| ID TYPE | NOTES |
|---|---|
| `user_ids` | user IDs are displayed on user profiles. can be used to filter out all instances of a user, including their pseuds. |
| `collection_ids` | the only way to get a collection ID is at end of a url after going into the desired collection and submitting a query. |
| `work_skin_id` | there are only three public workskins ([seen here](https://archiveofourown.org/skins?skin_type=WorkSkin)). their ID numbers are in their urls. also note the lack of an 's' at the end. |
| `id` | refers to the ID number of a particular work. this is the number directly after the /works/ part of a work's url. useful in case we ever have a sequel to The Sexy Times With Wangxian Incident. |

#### DATES

| TYPE | DESCRIPTION |
|---|---|
| `created_at` | publishing date of a work |
| `updated_at` | the last time a work was updated |
| `revised_at` | date when a work was last edited, but not necessarily fully updated. when `minor_version` goes up. |

#### STRINGS (TEXT)

just remember that if you want to have a specific sequence of words in your search, you have to put it in ***UNCURLED*** quotes ("like this")

##### any string

these will take any string, including wildcards like `*` or `?` mentioned in the apache lucene query parser linked above.

| PARAMETER | NOTES |
|---|---|
| `summary` | text within the work's summary |
| `notes` | text within all of the work's author's notes |
| `endnotes` | text ONLY INSIDE the work's END notes. |
| `creators` | filters similarly to `user_ids` except this time you can specify a pseud. |
| `series.title` | series title. mind the period, as an underscore won't work here. |
| `imported_from_url` | lets you find works which were imported from a particular url or domain. |
| `tag` | do ***NOT*** make the mistake that this will work identically to using a tag's `filter_ids` number. using `filter_ids` will also catch a tag's synonyms, whereas `tag` will only search the text of tags. useful for filtering reader-inserts with `tag:reader`. |

##### specific strings

| FILTER | ACCEPTED PARAMETERS | NOTES |
|---|---|---|
| `language_id` | any ISO language code | [list of accepted iso language codes here](https://en.wikipedia.org/w/index.php?title=List_of_ISO_639_language_codes&useskin=vector) |
| `sort` | `posted`, `updated`, `author`, `title`, `kudos`, `hits`, `bookmarks`, `comments` | putting a `>` before the sorting parameter will reverse the sort order. |
| `work_types` | `Audio`, `Art`, `Video`, `Text` | these particular strings are case-sensitive. |

#### BOOLEAN (TRUE/FALSE)

| FILTER | NOTES |
|---|---|
| `complete` | completion status. |
| `crossover` | will filter out all fandoms which haven't been marked as related by wranglers. |
| `otp` | when set to `true`, will return all works with Exactly One relationship tagged. |
| `backdate` | `true` will return all works which have had their `updated_at` date changed to before their creation date. |
| `restricted` | archive-locked works. |
| `in_anon_collection` | works in a collection which has been marked as anonymous. |
| `nonfiction` | `true` will return works with tags like `essay`, `reviews`, `reference`, `nonfiction`, etc. |

### examples

it's important to note that there should NEVER be a space between the colon and the thing you're trying to filter. but anyway, as my final parting gift, here are some examples of more complex query groupings.

| EXAMPLE | EXPECTED RESULTS |
|---|---|
| `language_id:(en \|\| zh)` | returns fics that are either in english or chinese. |
| `-(word_count:[0 TO 1000} !filter_ids:7844)` | returns fics that are over 1k words UNLESS they are fanart. |
| `-(filter_ids:103132 AND complete:false AND word_count:[* TO 10000]) -(filter_ids:103132 AND complete:true AND word_count:[* TO 50000])` | will filter out a fic tagged slow burn IF and ONLY IF it is EITHER 1. incomplete AND less than 10k words, ***OR*** 2. complete AND less than 50k words |