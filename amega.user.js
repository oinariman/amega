// ==UserScript==  
// @name ameblogazouchan
// @description ameblo gazou wo anatani...
// @include http://ameblo.jp/*
// @include http://*.jugem.jp/*
// @include http://blog.oricon.co.jp/*
// @include http://bbs.avi.jp/bbs.php*
// @include http://blog.watanabepro.co.jp/*
// @version 0.0.6
// ==/UserScript==

/*** location ***/

function isAmeblo() { return /^http:\/\/ameblo\.jp\/.*/.test(document.location.href); }
function isJugem() { return /^http:\/\/.+\.jugem\.jp\/.*/.test(document.location.href); }
function isBlog() { return /^http:\/\/blog\.oricon\.co\.jp\/.*/.test(document.location.href); }
function isAviBbs() { return /^http:\/\/bbs\.avi\.jp\/bbs\.php.*/.test(document.location.href); }
function isNabeblo() { return /^http:\/\/blog\.watanabepro\.co\.jp\/.*/.test(document.location.href); }
function isJpg() { return /\.jpg$/.test(document.location.href); }

/*** html ***/

function getHeader(title) {
    var html = "";
    html += "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"\n";
    html += "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n";
    html += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ja\" lang=\"ja\">\n";
    html += "  <head>\n";
    html += "    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n";
    html += "    <title>" + title + "</title>\n";
    html += "    <style type=\"text/css\">\n";
    html += "    <!--\n";
    html += "      p { font-size: 0.7em; }\n";
    html += "      p span { font-size: 2.5em; color: #FF006D; }\n";
    html += "      a:link img { border: solid 3px #1E2422; }\n";
    html += "      a:visited img { border: solid 3px #FF006D; }\n";
    html += "      a:hover img { border: solid 3px #88BEB1; }\n";
    html += "      a:active img { border: solid 3px #88BEB1; }\n";
    html += "    -->\n";
    html += "    </style>\n";
    html += "  </head>\n";
    html += "  <body>\n";
    return html;
}
    
function getFooter() {
    var html = "";
    html += "  </body>\n";
    html += "</html>";
    return html;
}

function getBody(hitStr, anchors) {
    var html = '<p><span>' + hitStr + '</span>&nbsp;' + document.location.href + '</p><p>';
    for (var k = 0; k < anchors.length; k++) {
        html += '<a href="' + anchors[k].aurl + '"><img src="' + anchors[k].url + '"/></a>';
    }
    return html + '</p>';
}

/*** fetch ***/

function fetchFromAmeblo() {
    if (/\/image/.test(document.location.href)) {
        return fetchFromUmanohone();
    } else {
        var result = new Array();
        var imgs = document.evaluate('//div[@class="contents"]//img', document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < imgs.snapshotLength; i++) {
            var url = imgs.snapshotItem(i).getAttribute('src');
            if (/\.jpg/.test(url)) {
                if (/^http:\/\/.*\/\d+(\_s|).jpg/.test(url)) {
                    url = url.replace(/\_s\.jpg.*/, '.jpg');
                }
                else if (/^http:\/\/.*\/t\d+\_\d+\.jpg$/.test(url)) {
                    url = url.replace(/t\d+\_/, 'o');
                }
                var aurl;
                // imgの親がaで、htmlへ参照してればその通りにする。
                // そうでなければうんじゃらけ
                var parent = imgs.snapshotItem(i).parentNode;
                if (parent.nodeName.toLowerCase() == 'a' && /\.html/.test(parent.href)) {
                    aurl = parent.href;
                } else {
                    aurl = url;
                }
                result.push({url: url, aurl: aurl});
            }
        }
        return result;
    }
}

function fetchFromJugem() {
    var result = new Array();
    var imgs = document.evaluate('//a/child::img[@class="pict"]', document.body, null, 6, null);
    for (var i = 0; i < imgs.snapshotLength; i++) {
        var url = imgs.snapshotItem(i).getAttribute('src');
		if (/^http:\/\/.*\_t\.jpg/.test(url)) {
			url = url.replace(/\_t\.jpg$/, '.jpg');
		}
        result.push({url: url, aurl: url});
    }
    return result;
}

function fetchFromAviBbs() {
    var result = new Array();
    var imgs = document.evaluate('//td[@class="contributionimages"]//img', document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < imgs.snapshotLength; i++) {
        var url = imgs.snapshotItem(i).getAttribute('src');
		if (/^http:\/\/.*\/photo\/.*\.jpg$/.test(url)) {
			url = url.replace(/\.jpg$/, '-pc.jpg');
            result.push({url: url, aurl: url});
		}
    }
    return result;
}


function fetchFromNabeblo() {
    var result = new Array();
    var imgs = document.evaluate('//div[@class="entry"]//img', document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < imgs.snapshotLength; i++) {
        var src = imgs.snapshotItem(i).getAttribute('src');
		src.match(/src=(http:\/\/.*\.jpg).*$/);
        url = RegExp.$1;
        GM_log(RegExp.$1);
        if (url.length > 0) {
            result.push({url: url, aurl: url});
		}
    }
    return result;
}

function fetchFromUmanohone() {
    var result = new Array();
    var imgs = document.evaluate('//img[contains(@src,".jpg")]', document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < imgs.snapshotLength; i++) {
        var url = imgs.snapshotItem(i).getAttribute('src');
        result.push({url:url, aurl:url});
    }
    return result;
}

var fetch = function() {
    // fetch
    var anchors;
    if (isAmeblo()) {
        anchors = fetchFromAmeblo();
    } else if (isJugem()) {
        anchors = fetchFromJugem();
    } else if (isAviBbs()) {
        anchors = fetchFromAviBbs();
    } else if (isNabeblo()) {
        anchors = fetchFromNabeblo();
    } else {
        anchors = fetchFromUmanohone();
    }

    // count
    var hitStr = anchors.length + ((anchors.length > 1) ? 'HITS' : 'HIT');
    for (var j = anchors.length; j > 0; j--) { hitStr += '!'; }
    
    // write
    var html = '';
    if (!isNabeblo()) { html += getHeader(hitStr); }
    html += getBody(hitStr, anchors);
    if (!isNabeblo()) { html += getFooter(); }
    
    // display
    if (isNabeblo()) {
        document.body.innerHTML = html;
    } else {
        GM_openInTab('data:text/html;charset=UTF-8,' + encodeURIComponent(html));
    }
    return true;
};

/*** trigger ***/

function appendTriggerToAmeblo() {
    var lastLi = document.evaluate('//li[@id="barLogoTop"]/descendant::ul/descendant::li[@class="last"]', document.body, null, 6, null);
    lastLi.snapshotItem(0).setAttribute('class', 'notlast');

    var trigA = document.createElement('a');
    trigA.innerHTML = '画像';
    trigA.href = 'javascript:void(0)';
    trigA.addEventListener('click', fetch, false);
    var trigItem = document.createElement('li');
    trigItem.appendChild(trigA);
    trigItem.setAttribute('class', 'last');

    var barul = document.evaluate('//li[@id="barLogoTop"]/descendant::ul', document.body, null, 6, null);
    barul.snapshotItem(0).appendChild(trigItem);
}

function appendTriggerToJugem() {
    var trigA = document.createElement('a');
    trigA.innerHTML = 'ここを押す';
    trigA.href = 'javascript:void(0)';
    trigA.addEventListener('click', fetch, false);
    with (trigA.style) {
        color = '#ff006d'
    }
    
    var div = document.createElement("div")
    with (div.style) {
        fontSize   = '12px'
        position   = 'fixed'
        top        = '40px'
        right      = '3px'
        background = '#ccc'
        color      = '#fff'
        zIndex = '9999'
    }
    div.appendChild(trigA);

    document.body.appendChild(div)
}

/*** main ***/

if (!isJpg()) {
    if (isAmeblo()) { appendTriggerToAmeblo(); }
    else if (isJugem() || isAviBbs() || isNabeblo() || isBlog()) { appendTriggerToJugem(); }
}
