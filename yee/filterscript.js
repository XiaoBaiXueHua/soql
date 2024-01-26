const filtButt = document.createElement("li");
filtButt.id = "get_id_butt";
filtButt.innerHTML = `<a onclick="getTag()">Tag ID</a>`;

const navList = document.querySelector("#main ul.user.navigation");
console.log(navList);
navList.prepend(filtButt);

function getTag() {
	console.log(document.querySelector("#favorite_tag_tag_id").value);
}