// ==UserScript==
// @name         AO3: Full Navigation Bar
// @namespace    https://greasyfork.org/
// @version      1.0
// @description  Adds full navigation bar to AO3.
// @author       sopens
// @match        https://archiveofourown.org/works/*/chapters/*
// @grant        none
// ==/UserScript==

// selectedTag exists only when there are several chapters.
var selectedTag = document.getElementById("selected_id");
if (!selectedTag) return;

var ddValue = selectedTag.selectedIndex;
var ddSize = selectedTag.length;
var ddInnerHTML = selectedTag.innerHTML;

//the var seems to refer to the native navbar buttons. not sure why declared false at the start
var TOP_AND_BOTTOM = false;

// Make hrefs to first and last chapter.
var mainChapterURL = window.location.pathname.split('/').slice(0, 4).join("/") + "/";
var firstHref = mainChapterURL + selectedTag.children[0].value + "#workskin";
var lastHref = mainChapterURL + selectedTag.children[ddSize - 1].value + "#workskin";
var fullPageHref = window.location.pathname.split('/').slice(0, 3).join("/") + "/navigate";

showNavigatorBar();

// Main Functions -------------------------------------------------------------------------

function showNavigatorBar() {
  //fetches the top nav and bottom nav
  let topNavBar = document.getElementById("top");
  let btmNavBar = document.getElementById("bottom");

  //if there's something for both ['!' is logical NOT operator], give us the top n bottom bars
  if (topNavBar != null && btmNavBar != null) return;

  topNavBar = getTopNavBar();
  btmNavBar = getBtmNavBar();

  let navigationTags;

  //looking at the buttons we are going to make
  if (TOP_AND_BOTTOM) {
    navigationTags = [topNavBar, btmNavBar];
  } else {
    showButtonPanel();
    navigationTags = [btmNavBar];
  }

  //the following loop makes (orders?) the navbar buttons
  for (let i = 0; i < navigationTags.length; i++) {
    //consolidating functions
    let firstChapterBtm = createFirstChapterBtm();
    let firstChapterListItem = createListItem(firstChapterBtm, "first");

    let chapterDropdown = createChapterDropdown();
    let chapterDropdownListItem = createListItem(chapterDropdown, "dropdown");

    let lastChapterBtm = createLastChapterBtm();
    let lastChapterListItem = createListItem(lastChapterBtm, "last");

    let fullPageIndexBtm = createFullPageIndexBtm();
    let fullPageIndexListItem = createListItem(fullPageIndexBtm, "full-page-index");

    let navigatorBar = navigationTags[i];
    let entireWorkListItem = navigatorBar.getElementsByClassName("chapter entire")[0];
    let prevChapterListItem = navigatorBar.getElementsByClassName("chapter previous")[0];
    let nextChapterListItem = navigatorBar.getElementsByClassName("chapter next")[0];

    //if we're past chapter two, make button for first chapter after entire work button
    if (ddValue > 1) {
      entireWorkListItem.insertAdjacentElement("afterend", firstChapterListItem);
    }

    //if we're on the first chapter, then show chapter dropdown after the entire work button
    if (ddValue == 0) {
      entireWorkListItem.insertAdjacentElement("afterend", chapterDropdownListItem);
    } else {
      prevChapterListItem.insertAdjacentElement("afterend", chapterDropdownListItem);
    }

    //if the current chapter is before penultimate, make last chapter button
    if (ddValue < (ddSize - 2)) {
      nextChapterListItem.insertAdjacentElement("afterend", lastChapterListItem);
    }

    //if current chapter is penultimate or ultimate, put full page index button after the next page button...
    if (ddValue == (ddSize - 2)) {
      nextChapterListItem.insertAdjacentElement("afterend", fullPageIndexListItem);
    }

    //...else put it after the last page button
    if (ddValue < (ddSize - 1)) {
      lastChapterListItem.insertAdjacentElement("afterend", fullPageIndexListItem);
    }
  }
}

function showButtonPanel() {
    //every time we buttonPanel, we're talking abt html elements w/the id "button_panel"
  let buttonPanel = document.getElementById("button_panel");

  if (buttonPanel != null) return;

  //make <dt>Navigation Panel:</dt>
  let listHeader = document.createElement("dt");
  listHeader.appendChild(document.createTextNode("Navigation Panel:"));

  //the entire row of buttons will be held in one <dd> with each button being an individual <ul>
  let listContent = document.createElement("dd");
  let buttonList = document.createElement("ul");
  listContent.appendChild(buttonList);

  //puts the buttons after <dt>nav panel</dt> and gives it id #button_panel
  buttonPanel = document.getElementsByClassName("work meta group")[0];
  buttonPanel.id = "button_panel";
  buttonPanel.appendChild(listHeader);
  buttonPanel.appendChild(listContent);

  //styles the buttons
  let entireWorkBtm = createEntireWorkBtm();
  addStyle(entireWorkBtm);

  //creates the entire work button
  let entireWorkListItem = createListItem(entireWorkBtm, "entire");
  buttonList.appendChild(entireWorkListItem);

  //if past chapter two, style and append first chapter button
  if (ddValue > 1) {
    let firstChapterBtm = createFirstChapterBtm();
    addStyle(firstChapterBtm);

    let firstChapterListItem = createListItem(firstChapterBtm, "first");
    buttonList.appendChild(firstChapterListItem);
  }

  //if past chapter one, style n append prev chapter button
  if (ddValue > 0) {
    let prevChapterBtm = createPrevChapterBtm();
    addStyle(prevChapterBtm);

    let prevChapterListItem = createListItem(prevChapterBtm, "previous");
    buttonList.appendChild(prevChapterListItem);
  }

  //always create, style, and append chapter dropdown
  let chapterDropdown = createChapterDropdown();
  let chapterDropdownListItem = createListItem(chapterDropdown, "dropdown");

  buttonList.appendChild(chapterDropdownListItem);

  //if not last chapter, then make next chapter button
  if (ddValue < (ddSize - 1)) {
    let nextChapterBtm = createNextChapterBtm();
    addStyle(nextChapterBtm);

    let nextChapterListItem = createListItem(nextChapterBtm, "previous");
    buttonList.appendChild(nextChapterListItem);
  }

  //if not pen/ultimate chapter, make last chapter button
  if (ddValue < (ddSize - 2)) {
    let lastChapterBtm = createLastChapterBtm();
    addStyle(lastChapterBtm);

    let lastChapterListItem = createListItem(lastChapterBtm, "last");
    buttonList.appendChild(lastChapterListItem);
  }

  //always make full page index
  let fullPageIndexBtm = createFullPageIndexBtm();
  addStyle(fullPageIndexBtm);

  let fullPageIndexListItem = createListItem(fullPageIndexBtm, "full-page-index");
  buttonList.appendChild(fullPageIndexListItem);
}a

// Global Functions ------------------------------------------------------------------

//hides buttons in native top navbar
function getTopNavBar() {
  let navBar = document.getElementById("chapter_index").parentElement.parentElement;
  navBar.id = "top";

  //if not the buttons we just made, i.e. looking at the native buttons
  if (!TOP_AND_BOTTOM) {
    //hides native entire work button
    let entireWorkListItem = navBar.getElementsByClassName("chapter entire")[0];
    entireWorkListItem.remove();

    //hides native prev chapter button
    let prevChapterListItem = navBar.getElementsByClassName("chapter previous")[0];
    if (prevChapterListItem != null) prevChapterListItem.remove();

    //hides native next chapter button
    let nextChapterListItem = navBar.getElementsByClassName("chapter next")[0];
    if (nextChapterListItem != null) nextChapterListItem.remove();
  }

  //consolidates function that fetches a particular list item button in the native navbar
  let topListItems = navBar.getElementsByTagName("li");

  //get each button listed
  for (let i = 0; i < topListItems.length; i++) {
    let topLink = topListItems[i].getElementsByTagName("a")[0];

    //stop loop at chapter index button, and stop removing their buttons
    if (topLink.text.search("Chapter Index") != -1) {
      topListItems[i].remove();
      break;
    }
  }

  //give us the navbar
  return navBar;
}

//assigns [class] names buttons on bottom navbar...?
function getBtmNavBar() {
  let navBar = document.getElementById("feedback").getElementsByTagName("ul")[0];
  navBar.id = "bottom";

  let btmListItems = navBar.getElementsByTagName("li");

  //loop through the bottom navbuttons to fetch desired buttons
  for (let i = 0; i < btmListItems.length; i++) {
    let btmLink = btmListItems[i].getElementsByTagName("a")[0];

    if (btmLink == null) continue;
    
    //assigns top button .chapter.entire
    if (btmLink.text.search("Top") != -1) {
      btmListItems[i].className = "chapter entire";
      continue;
    }

    //assigns prev button .chapter.previous
    if (btmLink.text.search("Previous") != -1) {
      btmListItems[i].className = "chapter previous";
      continue;
    }

    //assigns next button .chapter.next
    if (btmLink.text.search("Next") != -1) {
      btmListItems[i].className = "chapter next";
      break;
    }
  }

  return navBar;
}

//function for creating the buttons
function createListItem(element, className) {
  let listItem = document.createElement("li");
  listItem.className = "chapter " + className;
  listItem.appendChild(document.createTextNode("\n\n"));
  listItem.appendChild(element);
  listItem.appendChild(document.createTextNode("\n\n"));

  return listItem;
}

//function for creating the chapter dropdown
function createChapterDropdown() {
  let dropdown = document.createElement("select");
  addStyle(dropdown);
  dropdown.id = "chapter_list";
  dropdown.innerHTML = ddInnerHTML;
  dropdown.style.padding = ".18em .75em";
  dropdown.onchange = function() {
    let selectedValue = this.options[this.selectedIndex].value;
    window.location.href = mainChapterURL + selectedValue + "#workskin";
  }

  return dropdown;
}

//function for creating entire work button
function createEntireWorkBtm() {
  let href = window.location.pathname.split('/').slice(0, 3).join("/") + "?view_full_work=true";

  return createBtm(href, "Entire Work");
}  

//function for creating first chapter button
function createFirstChapterBtm() {
  return createBtm(firstHref, "First Chapter");
}  

//function for creating prev chapter button
function createPrevChapterBtm() {
  let href = mainChapterURL + selectedTag.children[ddValue - 1].value + "#workskin";

  return createBtm(href, "← Previous Chapter");
}  

//function for creating next chapter button
function createNextChapterBtm() {
  let href = mainChapterURL + selectedTag.children[ddValue + 1].value + "#workskin";

  return createBtm(href, "Next Chapter →");
}  

//function for creating last chapter button
 function createLastChapterBtm() {
  return createBtm(lastHref, "Last Chapter");
}  

//function for creating full page index button
function createFullPageIndexBtm() {  
  return createBtm(fullPageHref, "Full-page Index");
}  

//makes the buttons into links
function createBtm(href, text) {
  let link = document.createElement("a");
  link.href = href;
  link.appendChild(document.createTextNode(text));

  return link;
}

//styles all the elements with css
function addStyle(element) {
  element.style.display = "inline-block";
  element.style.verticalAlign = "middle";
  element.style.backgroundColor = "#eee";
  element.style.color = "#444";
  element.style.width = "auto";
  element.style.fontSize = "100%";
  element.style.lineHeight = "1.286";
  element.style.padding = ".25em .75em";
  element.style.whiteSpace = "nowrap";
  element.style.overflow = "visible";
  element.style.position = "relative";
  element.style.cursor = "pointer";
  element.style.textDecoration = "none";
  element.style.backgroundImage = "linear-gradient(#fff 2%,#ddd 95%,#bbb 100%)";
  element.style.border = "1px solid #bbb";
  element.style.borderRadius = ".25em";
  element.style.boxShadow = "none";
  element.style.margin = "0px";
  element.style.font = "inherit";
}