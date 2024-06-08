function reorder() {
	const inputs = document.querySelectorAll("#reorderFandoms input");
	const numInputs = inputs.length;
	const fandoms = document.querySelectorAll("#reorderFandoms label");
	const style = document.createElement("style");
	
	for (var i = 0; i < numInputs; i++) {
	  const order = inputs[i].value ? inputs[i].value : numInputs;
	  console.log(`${fandoms[i].innerText}, child ${i+1} order #${order}`);
	  style.innerText += `ul.statistics li.fandom:nth-of-type(${i+1}) {order: ${order}; }`;
	}
	document.querySelector("head").appendChild(style);
  }
  
  function reorderFandoms() {
	if (!document.querySelector("#reorderFandoms")) { // prevent it from running more than once during tests
	  const statsList = document.querySelector("ul.statistics");
	console.log(statsList);
	const fanItems = statsList.querySelectorAll("li.fandom");
	const numFans = fanItems.length;
   // const fandoms = new Array();
	const ui = document.createElement("details");
	ui.id = "reorderFandoms";
	for (var i = 0; i < numFans; i++) {
	  // initialize the fandoms array
  //    fandoms.push(item.querySelector("h5.heading").innerText.trim());
	  const fan = fanItems[i].querySelector("h5.heading").innerText.trim();
	  const optgroup = document.createElement("div");
	  const label = document.createElement("label");
	  label.setAttribute("for", `fandom-${i}`);
	  label.innerHTML = fan;
	  
	  const input = document.createElement("input");
	  input.setAttribute("type", "number");
	  input.id = `fandom-${i}`;
	  optgroup.append(label, input);
	  ui.append(optgroup);
	}
  //  console.log(fandoms);
	console.log(ui);
	document.querySelector("#stat_chart").insertAdjacentElement("beforebegin", ui);
	} else {
	  reorder();
	}
  }
  
  reorderFandoms();