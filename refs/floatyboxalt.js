// ==UserScript==
// @name        AO3 Floating Comment Box
// @description Floating comment box for AO3
// @include     *://archiveofourown.org/*works/*
// @namespace   https://greasyfork.org/en/scripts/395902-ao3-floating-comment-box
// @version     0.9
// @run-at      document-end
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// ==/UserScript==


'use strict';

const primary = "#0275d8"
const success = "#5cb85c"
const danger = "#d9534f"

let curURL = document.URL
//if the current url has a fragment, cut it off for storage indexing purposes
if (curURL.includes("#")) {
	curURL = document.URL.slice(0, document.URL.indexOf("#"))
}
let newURL = curURL

//makes a constant that'll do the <style> element, i think
const addStyles = () => {
	const styles = document.createElement("style")
	styles.innerHTML = fullStyles() + "\n" + addMediaStyles()
	return styles
}


const fullStyles = () => {
	let full = ""
    //ohh this untangles the styles array into proper css
	for (let [key, value] of Object.entries(allStyles)) {
		let newStyle = key + " {"
		for (let [key2, val2] of Object.entries(value)) {
			newStyle += "\n" + key2 + ": " + val2 + ";"
		}
		newStyle += "\n}\n"
		full += newStyle
	}
	return full
}


const addMediaStyles = () => {
	let full = ""
	for (let [key, value] of Object.entries(mediaStyles)) {
		let newStyle = key + "{"
		for (let [key2, val2] of Object.entries(value)) {
			newStyle += "\n" + key2 + "{"
			for (let [key3, val3] of Object.entries(val2)) {
				newStyle += "\n" + key3 + ": " + val3 + ";"
			}
			newStyle += "\n}\n"
		}
		newStyle += "\n}\n"
		full += newStyle
	}
	return full
}

//yeah yeah styling array
const mediaStyles = {
	"@media (min-width: 1375px)": {
		".float-div": {
			"width": "80%",
			"max-width": "80%",
			"left": "10%"
		},
		".float-cmt-btn": {
			"font-size": "1em"
		},
		"#openCmtBtn": {
			"font-size": "1.15em",
			"padding": "2px 4px"
		}
	},
	"@media (min-width: 1575px)": {
		".float-div": {
			"width": "70%",
			"max-width": "70%",
			"left": "15%"
		},
		".float-cmt-btn": {
			"font-size": "1em"
		},
		"#openCmtBtn": {
			"font-size": "1.3em",
			"padding": "4px 8px"
		}
	},
	"@media (min-width: 1850px)": {
		".float-div": {
			"width": "60%",
			"max-width": "60%",
			"left": "20%"
		},
		".float-cmt-btn": {
			"font-size": "1.1em"
		},
		"#openCmtBtn": {
			"font-size": "1.5em",
			"padding": "5px 10px"
		}
	}
}

//good lord. more styling
const allStyles = {
	".float-div": {
		"display": "none",
		"position": "fixed",
		"z-index": "1",
		"bottom": ".5%",
		"width": "98%",
		"height": "30%",
		"background-color": "#ddd",
		"border-style": "double",
		"border-color": "grey",
		"padding": "5px",
		"resize": "both",
		"overflow": "auto",
		"border-radius": "25px",
		"border-width": "5px"
	},
	".btn-div": {
		"display": "flex",
		"justify-content": "space-around",
		"top": "0px",
		"width": "100%",
		"max-width": "100%",
		"height": "15%"
	},
	".char-count": {
		"font-size": ".8em"
	},
	".float-box": {
		"min-height": "70%",
		"max-width": "98%",
		"background-color": "white"
	},
	".float-cmt-btn": {
		"border": "none",
		"text-align": "center",
		"text-decoration": "none",
		"display": "inline-block",
		"font-size": ".8em",
		"padding": ".2% 3%",
		"top": "10%",
		"bottom": "10%",
		"height": "70%"
	},
	"#openCmtBtn": {
		"position": "fixed",
		"z-index": "1",
		"top": "0px",
		"left": "0px",
		"font-size": ".9em",
		"padding": "1px 2px",
		"border": "none",
		"text-align": "center",
		"text-decoration": "none",
		"display": "inline-block",
		"background": primary
	},
	"#addCmtBtn": {
		"background": primary
	},
	"#delCmtBtn": {
		"background": danger
	},
	"#insCmtBtn": {
		"background": primary
	},
	".font-select": {
		"float": "right",
		"top": "10%",
		"bottom": "10%",
		"width": "10%",
		"height": "80%"

	},
	".btn-font": {
		"color": "white"
	}

}

//makes the box
const createBox = () => {
	const textBox = document.createElement("textarea")
	textBox.className = "float-box"
    //adds an event listener so that every keystroke you make, your progress will be saved to the greasemonkey (in our later edits, the local storage) n the character count updated. neat!
	textBox.addEventListener("keyup", async () => {
        //"GM" stands for greasemonkey, since this is a userscript n all. umm i think in this case it's basically like the local storage
		await GM.setValue(newURL, textBox.value)
		const addBtn = document.querySelector("#addCmtBtn")
        //oh this counts the characters like on ao3 sweet
		const charCount = document.querySelector(".char-count")
		const newCount = 10000 - textBox.value.length
		charCount.textContent = `Characters left: ${newCount}`
		addBtn.style.background = primary
		addBtn.textContent = "Add to Comment Box"
	})
	return textBox
}

//this one makes the font size changer
const createChangeFontSize = () => {
	const selectMenu = document.createElement("select")
	selectMenu.className = "font-select"
	const optNums = [".5em", ".7em", ".85em", "1em", "1.25em", "1.5em"]
	for (let num of optNums) {
		const opt = document.createElement("option")
		opt.value = num
		opt.className = "font-option"
		opt.style.fontSize = num
		opt.textContent = "Font size"
		selectMenu.appendChild(opt)
	}
	selectMenu.addEventListener("click", () => {
        //find the text box n set its font size to the one chosen
		const textBox = document.querySelector(".float-box")
		textBox.style.fontSize = selectMenu.value
	})
	return selectMenu
}

//makes the div for the character counter
const charCount = () => {
	const newDiv = document.createElement("div")
	newDiv.className = "char-count"
	newDiv.textContent = "Characters left: 10000"
	return newDiv
}

//this is the button that summons n closes the floaty review box. y'know the one, the hideous one in the upper left corner.
const createButton = () => {
	const newButton = document.createElement("button")
	newButton.className = "btn-font"
	newButton.id = "openCmtBtn"
	newButton.textContent = "O"
	newButton.addEventListener("click", () => {
		const div = document.querySelector(".float-div")
		if (div.style.display === "block") {
			div.style.display = "none"
			newButton.textContent = "O"
			newButton.style.background = primary
		} else {
			div.style.display = "block"
			newButton.textContent = "X"
			newButton.style.background = danger
			const textBox = document.querySelector(".float-box")
			textBox.scrollTop = textBox.scrollHeight
		}

	})
	return newButton
}

const createMainDiv = () => {
    //need the floaty div
	const newDiv = document.createElement("div")
	newDiv.className = "float-div"
    //and then also the button div
	const btnDiv = document.createElement("div")
    //the button div needs its buttons ofc
	btnDiv.className = "btn-div"
    //the button to add your selection to the comment
	btnDiv.appendChild(insertButton())
    //the button to add your selection to the real comment box
	btnDiv.appendChild(addButton())
    //the button to just delete your whole comment so far
	btnDiv.appendChild(createDelete())
    //the button to choose whether you're viewing the full work or by chapters
	btnDiv.appendChild(chapterRadio())
    //the font changer button
	btnDiv.appendChild(createChangeFontSize())
    //add the buttons to the floaty div
	newDiv.appendChild(btnDiv)
    //add the textbox to the floaty div
	newDiv.appendChild(createBox())
    //add the character count to the floaty div
	newDiv.appendChild(charCount())
	return newDiv
}

//makes the button to clear your comment
const createDelete = () => {
	const newButton = document.createElement("button")
	newButton.textContent = "Delete"
	newButton.className = "float-cmt-btn btn-font"
	newButton.id = "delCmtBtn"
	newButton.addEventListener("click", async () => {
		if (confirm("Are you sure you want to delete your comment?")) {
            //if the local storage doesn't already have "no comment here", then clear the local storage n the textbox
			if ((await GM.getValue(newURL, "noCmtHere")) !== "noCmtHere") {
				await GM.deleteValue(newURL)
				document.querySelector(".float-box").value = ""
				document.querySelector("textarea[id^='comment_content_for']").value = ""
			}
		}
	})
	return newButton
}

//this makes the toggle for whether you wanna view by chapter or full work
const chapterRadio = () => {
	const radioDiv = document.createElement("div")
	radioDiv.className = "radio-div"
	const radioOne = document.createElement("input")
	const radioTwo = document.createElement("input")
	radioOne.type = "radio"
	radioTwo.type = "radio"
	radioOne.name = "chapters"
	radioTwo.name = "chapters"
	radioOne.className = "chapter-toggle"
	radioTwo.className = "chapter-toggle"
	radioOne.id = "entireCmt"
	radioTwo.id = "chapterCmt"
	const labelOne = document.createElement("label")
	const labelTwo = document.createElement("label")
	labelOne.setAttribute("for", "entireCmt")
	labelTwo.setAttribute("for", "chapterCmt")
	labelOne.textContent = "Full Work"
	labelTwo.textContent = "By Chapter"

	if (curURL.includes("chapters")) {
		radioOne.checked = false
		radioTwo.checked = true
	} else {
		radioDiv.style.display = "none"
		radioOne.disabled = true
		radioTwo.disabled = true
	}

	radioOne.addEventListener("click", () => {
		if (newURL.includes("chapters")) {
			newURL = curURL.slice(0, curURL.indexOf("/chapters"))
			addStoredText()
		}
	})
	radioTwo.addEventListener("click", () => {
		if (!newURL.includes("chapters")) {
			newURL = curURL
			addStoredText()
		}

	})
	radioDiv.appendChild(radioOne)
	radioDiv.appendChild(labelOne)
	radioDiv.appendChild(radioTwo)
	radioDiv.appendChild(labelTwo)
	return radioDiv
}

//button to add your shit to the real comment box on ao3
const addButton = () => {
	const newButton = document.createElement("button")
	newButton.textContent = "Add to Comment Box"
	newButton.className = "float-cmt-btn btn-font"
	newButton.id = "addCmtBtn"
	const realCmtBox = document.querySelector("textarea[id^='comment_content_for']")
	newButton.addEventListener("click", async () => {
		realCmtBox.value = document.querySelector(".float-box").value
		newButton.style.background = success
		newButton.textContent = "Added to Comment Box"
	})
	return newButton
}

//this gets your selection and then adds it to your comment
const insertButton = () => {
	const newButton = document.createElement("button")
	newButton.textContent = "Insert Selection"
	newButton.className = "float-cmt-btn btn-font"
	newButton.id = "insCmtBtn"
    //basically, when you click on this button
	newButton.addEventListener("click", async () => {
        //it'll trim n italicize your selection. later experiment to see if it can pick up on like italics n shit. it seems not rn but alas
		const selection = `<i>${window.getSelection().toString().trim()}</i>`
        //anyway, then it finds the floaty box, and on a new line, appends the selection
		const textBox = document.querySelector(".float-box")
		const newText = `${textBox.value}${selection}\n`
		textBox.value = newText
        //and then ofc it also saves it
		await GM.setValue(newURL, newText)
	})
	return newButton
}

//adds the stored text to the floatybox upon intialization
const addStoredText = async () => {
	const textBox = document.querySelector(".float-box")
    //if working with a full work, then snip its url
	if (curURL.includes("full")) {
		newURL = curURL.slice(0, curURL.indexOf("?"))
	}
    //the newURL is what your stored comment is indexed under, hence like yeah
	const storedText = await GM.getValue(newURL, "")
    console.log(`storedText: ${storedText}`);
	textBox.value = storedText
}


const init = () => {
	const body = document.body
	body.appendChild(createButton())
	body.appendChild(addStyles())
	body.appendChild(createMainDiv())
	addStoredText()
}

init()