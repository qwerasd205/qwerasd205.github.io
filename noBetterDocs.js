var ref = document.referrer;

if (ref.match(/betterdocs\.net/gi) | ref.match(/goo\.gl/gi) | ref.match(/bit\.ly/gi) | ref.match(/adf\.ly/gi) | ref.match(/sir\.bz/gi) | ref.match(/db\.tt/gi) | ref.match(/qr\.ae/gi) | ref.match(/bitly\.com/gi) | ref.match(/adcrun\.ch/gi) | ref.match(/tr\.im/gi)) {
	window.location="betterdocs.html";
}

if (ref.match(/./gi) & !ref.match(/^https?:\/\/qwerasd205.github.io/gi)) {
    window.location="betterdocs.html";
}
