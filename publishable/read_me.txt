***********************************************************
        SOME NOTES ON USING THE STICKY FILTERS
***********************************************************

okay, so because this script basically just plugs your 
saved filters into the "search within results" box, this
means you can use all the fancy-fancy query methods that
come with the apache lucene query syntax that ao3 uses. 

what this basically means is that in order to filter out 
tags as we usually expect them to be filtered these days,
you have to add in the tag's *filter_ids* to the saved 
search boxes. this has historically been a nasty Process
to get, which is why this script adds in the TAG ID button
to extract it for you, and then also provides you the 
option to automatically append it to your filters.

here is a list of filter_ids unable to be found via the 
tag id button by virtue of them not, like, being clickable
tags, though! provided by ao3 themselves in like 2013 lol:

-----------------------------------------------------------
RATINGS:
-----------------------------------------------------------
Not Rated:              filter_ids:9
General:                filter_ids:10
Teen:                   filter_ids:11
Mature:                 filter_ids:12
Explicit:               filter_ids:13

-----------------------------------------------------------
WARNINGS:
-----------------------------------------------------------
Chose Not To Warn:      filter_ids:14
No Warnings Apply:      filter_ids:16
Graphic Violence:       filter_ids:17
Major Character Death:  filter_ids:18
Rape/Non-Con:           filter_ids:19
Underage:               filter_ids:20

-----------------------------------------------------------
CATEGORIES:
-----------------------------------------------------------
General:                filter_ids:21
M/F:                    filter_ids:22
M/M:                    filter_ids:23
Other:                  filter_ids:24
F/F:                    filter_ids:116
Multi:                  filter_ids:2246

PLUS A BONUS FROM ME SPECIFICALLY:
Chatting & Messaging:   filter_ids:106225

===========================================================
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
===========================================================

tags aren't the only thing you can search and filter by,
though!! here's a list of the various inputs i've found by 
digging through ao3's source code and subsequently tested 
to confirm as working, sorted by their input types:

-----------------------------------------------------------
     INTEGERS:
-----------------------------------------------------------
// Work Data
word_count
major_version
minor_version
expected_number_of_chapters

// Work Stats
hits 
comments_count
kudos_count
bookmarks_count

// Tag IDs, except more specific this time
fandom_ids
character_ids
relationship_ids
freeform_ids
// Fandom, character, rlshp, and freeform ID numbers are 
// the same as the filter_ids so they're most useful when
// filtering out tags by their ID ranges. Like removing 
// crossovers from JJK, where the anime & manga are for 
// some reason considered a crossover when tagged together.
// (Filtering out crossovers for JJK, btw:)
// -fandom_ids:>49281637 -fandom_ids:<28410929 -fandom_ids:{28410929 TO 49281637}

// Other ID numbers 
user_ids
collection_ids
work_skin_id
id
// User IDs are displayed on user profiles.
// Collection IDs are found in the URL after going into 
// one and submitting a search query.
// There are only 3 public work skins, but you can find 
// their ids by just perusing the public workskins page.
// "id" refers to the Work's ID itself. Useful in case we
// ever have a Sexy Times With Wangxian Incident...... 2!!!

-----------------------------------------------------------
     BOOLEAN (TRUE/FALSE):
-----------------------------------------------------------
complete
crossover
otp 
backdate
restricted
in_anon_collection
nonfiction

-----------------------------------------------------------
     DATES:
-----------------------------------------------------------
created_at
updated_at
revised_at

-----------------------------------------------------------
STRINGS (TEXT):
-----------------------------------------------------------

// Will take any string (multi-word in UNCURLED quotation
// marks), including wildcards like * or ?
summary
notes 
endnotes
creators
series.title
imported_from_url
tag
// "creators" will filter about the same way as a user_ids 
// would, except this time you can specify a user's pseud
// rather than their whole account, I guess.
// "-tag:reader" is how you get rid of all reader-inserts 
// forever, btw. Or include them forever, if you prefer, by
// removing the "-" in front.

// Will take SPECIFIC strings
language_id        # 2-letter language code 
sort               # posted, updated, author, kudos, 
                   # hits, bookmarks, comments, title
				   # Putting ">" before the sorting param
				   # will reverse the sort order btw.
work_types         # Audio, Art, Video, Text | <-- these
                   # particular strings are case-sensitive.

===========================================================

all of these filters will have a colon btwn themselves and
whatever you're filtering (like sort:>posted or otp:true)
WITHOUT spaces.

you can do some really fine-grained filtration by mixing 
and matching all these input types using the right syntax,
so for more info on acceptable search query syntax:
https://lucene.apache.org/core/2_9_4/queryparsersyntax.html

my favorite examples for grouping queries are:

#        language_id:(en || zh)
// will return fics that are in either english or chinese
#        -(word_count:[0 TO 1000} !filter_ids:7844)
// this will filter out all fics under 1k words unless 
// they're art, since people do that sometimes.
#        -(filter_ids:(80484732 || 61125121) && otp:true)
// this will filter out kavetham or kazotomo, but only if 
// they're the only pairing tagged.

sorry for being genshin brained. or maybe not sorry. i do 
not actually remember at what point in my fandom life you 
followed me lol. but yeah good luck have fun!! :D