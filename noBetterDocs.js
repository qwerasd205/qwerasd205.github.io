var ref = document.referrer;

if (ref.match(/betterdocs\.net/gi)) {
	window.location="betterdocs.html";
}

if (ref.match(/github\.com/gi)) {
	console.log("Good.");
}
