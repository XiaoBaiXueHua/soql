//this should go into the filterscript after i figure out how to, like, get the page loaded to pillage for its data lol

//anyway, basically the procedure should go as follows:
// if the fandom doesn't pass the 70% cutoff point for determining its status as A Fandom Tag, first check if it's got some "& related fandoms" or "- all media types" in its name. and if not there, then also check the fandoms drop-down, and if like half of them have the variation of some same name [ex. the mandelorian], then it's Probably Inside a related fandom and you need to find the parent
//star wars is probably a good example for this, although i can imagine comics fans having a nightmare trying to maintain filters here in general, but a) comics fans shouldn't have rights and b) they're used to suffering like this w/all their different canons and just staking your hill out somewhere so it's fine they can just suffer for now. this is for easy shit like pjo and tolkien rn

//on the tag info page for The Parent Tag:
const relLinks = document.querySelector("div.sub a"); //gets all the subtags
var related = [];
for (a of relLinks) {
	related.push(a.innerText);
}
//then that array is kept in localStorage as future reference, so then it can check THAT for whether the current fandom falls under the fandom umbrella.
//like, if it fails all the other tests, then it'll look through the various saved arrays for a match, and if it finds one, then it's part of that one's parent tag, and the parent filters apply


//however, before we resort to the "get the other page and its links" method, let's first see if the second-biggest fandom in the fandom list passes the 70% threshhold test lol
var relFandoms = document.querySelector("#include_fandom_tags");
var first = relFandoms.querySelector("li").innerText;
var second = relFandoms.querySelector("li:nth-of-type(2)").innerText;
//then you'd have to get their work numbers (make sure it gets the number in paren at the END, since there are some disambiguators which are just years, esp for star wars)
//if THIS one passes the tag cutoff percent, then it's considered to be a fandom tag. though how you determine the name Is kind of tricky here. 


//this method is for like star wars where everyone is miserable and there's like 80 subtags of related fandoms
relFandoms = relFandoms.querySelectorAll("li");
var i;
for (li of relFandoms) {
	const name = li.innerText;
	if (name.match(fandom)) {
		i++;
	}
}
//then if there's like, more than half of them with a same name, then it counts


//if you're looking through "tolkien & related fandoms" then it is time to just cry idk how to parse that one