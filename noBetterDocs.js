var ref = document.referrer;

if (/betterdocs\.net/gi.test(ref) | /goo\.gl/gi.test(ref) | /bit\.ly/gi.test(ref) | /adf\.ly/gi.test(ref) | /sir\.bz/gi.test(ref) | /db\.tt/gi.test(ref) | /qr\.ae/gi.test(ref) | /bitly\.com/gi.test(ref) | /adcrun\.ch/gi.test(ref) | /tr\.im/gi.test(ref)) {
	window.location="betterdocs.html";
}

if (/./gi.test(ref) & !/^https?:\/\/qwerasd205.github.io/gi.test(ref)) {
    window.location="betterdocs.html";
}
