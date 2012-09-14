var rows = Array();
var enFlag = chrome.extension.getURL("en.gif");
var huFlag = chrome.extension.getURL("hu.gif");

function lt(l) {
	var prefix = "Javascript:lt('";
	var link = l;//.substring(prefix.length, l.length-2);
	var iframe = $(document.createElement('iframe'));
	iframe.attr('src', 'http://www.feliratok.info/'+link);
	iframe.attr('style', 'display: none');
	$('body').append(iframe);
	//chrome.extension.sendRequest({'action' : 'fetchFilename', 'link' : link}, onFilename);
}

function changeShowNameIfNeeded(show) {
	map = {
		"Sherlock" : "Sherlock (2010)",
		"Luther" : "Luther (2010) (UK)",
		"Castle (2009)" : "Castle",
		"Chaos" : "Chaos (2011)",
	};
	if( map[show] != undefined ) {
		show = map[show];
	}

	return show.replace("&amp;", "%26");
}

/*function onFilename(data) {
	var $doc = $(data.doc);
	var link = data.link;
	var filename = $doc.find("fajlnev").html();
	var iframe = $(document.createElement('iframe'));
	iframe.attr('src', link+'&fnev='+filename+'&status=send');
	$('body').append(iframe);
}*/

function onResponse(data) {
	var searchString = data.search;
	var $data = $(data.data);
	$data.find("table.result").each(function() {
		var $table = $(this);
		// ez a jó táblázat
		var $container = rows[searchString].next().find("td > div");
		$container.html('');
		$('tr#vilagit', $table).each(function() {
			var $row = $(this);
			var link = $row.find(':nth-child(2) a');
			var dllink = $row.find(':last-child a');
			var title = link.html();

			var language = $row.find('td.lang small').html();
			if( language == "Angol" ) {
				$container.append('<img src="'+enFlag+'" align="absmiddle"/> ');
			} else if( language == "Magyar" ) {
				$container.append('<img src="'+huFlag+'" align="absmiddle"/> ');
			}

			var $link = $(document.createElement("a"));
			$link.attr('style', 'cursor: pointer');
			$link.html(title);
			$link.click(function() {
				lt(dllink.attr('href'));
			});
			$container.append($link).append("<br />");
		});
		if( $container.html() == '' ) {
			// nincs felirat :(
			$container.parent().parent().remove();
		}
	});
}

$("table.mylist tr").each(function() {
	var $row = $(this);
	if( $row.hasClass("Episode_PastOne") || $row.hasClass("Episode_PastTwo") ) {
		var show = $("td.showname a", $row).html();
		show = changeShowNameIfNeeded(show);
		var se = $("td.longnumber", $row).html();
		if(se[0] == '0') {
			// vágjuk le az első nullát
			se = se.substring(1);
		}
		var searchString = show + " - " + se;
		rows[searchString] = $row;
		$row.after('<tr><td colspan="7"><div style="padding: 5px; background-color: #D1E0F0"><img src="'+chrome.extension.getURL("loader.gif")+'"/></div></td></tr>');
		chrome.extension.sendRequest({'action' : 'fetchSubtitles', 'search' : searchString}, onResponse);
		$row.click(function() {
			if($row.next().find("td > div").length != 0) {
				// már létezik a box.
				$row.next().remove();
			}
			$row.after('<tr><td colspan="7"><div style="padding: 5px; background-color: #D1E0F0"><img src="'+chrome.extension.getURL("loader.gif")+'"/></div></td></tr>');
			chrome.extension.sendRequest({'action' : 'fetchSubtitles', 'search' : searchString}, onResponse);
		});
	} else if( $row.hasClass("Episode_One") || $row.hasClass("Episode_Two") || $row.hasClass("Episode_Hover") ) {
		var show = $("td.showname", $row).html();
		show = changeShowNameIfNeeded(show);
		var se = $("td.longnumber", $row).html();
		if(se[0] == '0') {
			// vágjuk le az első nullát
			se = se.substring(1);
		}
		var searchString = show + " - " + se;
		rows[searchString] = $row;
		$row.click(function() {
			if($row.next().find("td > div").length != 0) {
				// már létezik a box.
				$row.next().remove();
			}
			$row.after('<tr><td colspan="7"><div style="padding: 5px; background-color: #D1E0F0"><img src="'+chrome.extension.getURL("loader.gif")+'"/></div></td></tr>');
			chrome.extension.sendRequest({'action' : 'fetchSubtitles', 'search' : searchString}, onResponse);
		});
	} else if( $row.hasClass("header") ) {
		var season = $("th.season", $row).html();
		if( season != null ) {
			var show = $row.next("tr").find("td.showname").html();
			show = changeShowNameIfNeeded(show);
			var searchString = show + " (" + season + ")";
			rows[searchString] = $row;
			$row.click(function() {
				if($row.next().find("td > div").length != 0) {
					// már létezik a box.
					$row.next().remove();
				}
				$row.after('<tr><td colspan="7"><div style="padding: 5px; background-color: #D1E0F0"><img src="'+chrome.extension.getURL("loader.gif")+'"/></div></td></tr>');
				chrome.extension.sendRequest({'action' : 'fetchSubtitles', 'search' : searchString}, onResponse);
			});
		}
	}
});
