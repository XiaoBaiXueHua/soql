# slice of quality life ao3 userscripts

hi i like ao3 and the various userscripts i currently use don't always play nicely or do everything i want and also tend to rely on jQuery. i mostly just want to rewrite my faves into vanilla js, partly for practice, but also on the vague desire to bundle them together into a browser extension someday so that more people can have my incredibly Powerful filtering skills.

## the floaty review box

this is the script that introduced me to the concept of userscripts and is by far my favorite ever. [originally written by tumblr user ravenel](https://ravenel.tumblr.com/post/156555172141/i-saw-this-post-by-astropixie-about-how-itd-be), [i also found a version that used vanilla js + saved one's progress](https://greasyfork.org/en/scripts/395902-ao3-floating-comment-box) (but looked ugly :(), so i, like, coded up a version that 
1. looked cute to my standards on both desktop **&&** mobile
2. saved my progress in case i needed to refresh
3. was convenient to summon even on my phone

it's still a little hacked together n has a lot of event listeners (which i'm not sure is ideal?) but hey at least it works for the moment. it still has some bugs (esp. on mobile), namely:
1. why does the floaty review box button look unstyled on mobile
2. how come none of the buttons work after pressing it the first time and then scrolling a bit :C

but what matters is that it SCROLLS WITH YOU and SAVES YOUR PROGRESS and has a CONVENIENT LITTLE BUTTON THAT SHOWS UP IN THE CORNER when you refresh the page.