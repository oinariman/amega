// ==UserScript==  
// @name ameblogazouchan
// @description ameblo gazou wo anatani...
// @include http://ameblo.jp/*
// @include http://*.jugem.jp/*
// @version 0.0.2
// ==/UserScript==

/*** location ***/

function isAmeblo() { return /^http:\/\/ameblo\.jp\/.*$/.test(document.location.href); }
function isJugem() { return /^http:\/\/.+\.jugem\.jp\/.*$/.test(document.location.href); }

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

/*** fetch ***/

function fetchFromAmeblo() {
    var result = new Array();
    var xpathDec = (!/\/image/.test(document.location.href)) ? '[@class="detailOn"]' : '';
    var anchors = document.evaluate('//a' + xpathDec, document.body, null, 6, null);
    var imgs = document.evaluate('//a' + xpathDec + '/child::img', document.body, null, 6, null);
    for (var i = 0; i < imgs.snapshotLength; i++) {
        var url = imgs.snapshotItem(i).getAttribute('src');
		if (/^http:\/\/.*\/\d+(\_s|).jpg/.test(url)) {
			url = url.replace(/\_s\.jpg.*/, '.jpg');
		}
		else if (/^http:\/\/.*\/t\d+\_\d+\.jpg$/.test(url)) {
			url = url.replace(/t\d+\_/, 'o');
		}
        var aurl = anchors.snapshotItem(i).getAttribute('href');
        result.push({url: url, aurl: aurl});
    }
    return result;
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

var fetch = function() {
    // fetch
    var anchors;
    if (isAmeblo()) {
        anchors = fetchFromAmeblo();
    } else if (isJugem()) {
        anchors = fetchFromJugem();
    }

    // count
    var hitStr = anchors.length + ((anchors.length > 1) ? 'HITS' : 'HIT');
    for (var j = anchors.length; j > 0; j--) { hitStr += '!'; }
    
    // write
    var html = '';
    html += getHeader(hitStr) + '<p><span>' + hitStr + '</span>&nbsp;' + document.location.href + '</p>';
    for (var k = 0; k < anchors.length; k++) {
        html += '<a href="' + anchors[k].aurl + '"><img src="' + anchors[k].url + '"/></a>';
    }
    html += getFooter();
    
    // display
    GM_openInTab('data:text/html;charset=UTF-8,' + encodeURIComponent(html));
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
    GM_log('jugem');
    var trigA = document.createElement('a');
    trigA.innerHTML = 'ここを押す';
    trigA.href = 'javascript:void(0)';
    trigA.addEventListener('click', fetch, false);
    with (trigA.style) {
        color = '#ff006d'
    }
    
    var div = document.createElement("div")
    div.setAttribute('id', 'amega_button')
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

if (isAmeblo()) { appendTriggerToAmeblo(); }
else if (isJugem()) { appendTriggerToJugem(); }