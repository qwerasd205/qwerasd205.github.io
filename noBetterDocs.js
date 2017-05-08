var ref = document.referrer;

if (ref.match(/^https?:\/\/([^\/]+\.)?betterdocs\.net(\/|$)/i)) {
	window.location="betterdocs.html";
}

if (ref.match(/^https?:\/\/([^\/]+\.)?github\.com(\/|$)/i)) {
	console.log("Good.");
}
