function autosaveReply() { // this DOES already work if the comment box exists already
	const reply = document.querySelector(`[id^="comment_content_for_"]`);
	console.log(reply);
	const id = reply.id;
	const idNum = id.replace(/\D+/, "");
	const storObj = localStorage["inbox-replies"] ? JSON.parse(localStorage["inbox-replies"]) : {};

	console.log(storObj);
	if (storObj[idNum]) {
		reply.value = storObj[idNum];
	}
	reply.addEventListener("keyup", () => {
		storObj[idNum] = reply.value;
		localStorage.setItem("inbox-replies", JSON.stringify(storObj));
	});
}

function addEvents() {
	for (const repButton of document.querySelectorAll(`li[id^="feedback_comment"] ul.actions li > a`)) {
		//console.log(`reply button: `, repButton);
		repButton.addEventListener("click", () => {
			function autosave() {
				var reply = function () { return document.querySelector(`[id^="comment_content_for_"]`);}();
				console.log(reply);
				if (reply) {
					const id = reply.id;
					const idNum = id.replace(/\D+/, "");
					const storObj = localStorage["inbox-replies"] ? JSON.parse(localStorage["inbox-replies"]) : {};
		
					console.log(storObj);
					if (storObj[idNum]) {
						reply.value = storObj[idNum];
					}
					reply.addEventListener("keyup", () => {
						storObj[idNum] = reply.value;
						localStorage.setItem("inbox-replies", JSON.stringify(storObj));
					});
				} else {
					autosave(); // yeah baby let's try recursion!
				}
				return;
				
			}
			autosave();
		});
	}
}

addEvents();

//autosaveReply();