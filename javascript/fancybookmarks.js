var filesystem;

function main() {
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.BlobBuilder = window.BlobBuilder ||  window.WebKitBlobBuilder;

	initializeFileSystem(function() {
		initializeLocalStorage();
		
		// Background Color
		var storageBackgroundColor = localStorage["backgroundColor"];
		$('body').css('backgroundColor', storageBackgroundColor);

		// Draw the Grid
		var storageRows = localStorage["rows"];
		var storageColumns = localStorage["columns"];

		drawGrid(storageRows, storageColumns);
		movableBoxes(storageRows, storageColumns);

		 // Assign Context Menu
		$(".box").contextMenu({
			menu: 'linkedBoxMenu'
		},
			function(action, el, pos) {
			  var boxId = $(el).attr('id');
			if (action == 'refresh') {
					refreshScreenshot(boxId);
			} else if (action == 'edit') {
				openSettingsMenu(boxId);
			} else if (action == 'delete') {
					deleteBox(boxId);
			} else if (action == 'preferences') {
				openPreferences();
			}
		});
	});
}

function initializeLocalStorage() {

	// First start
	var version = localStorage["dataBaseVersion"];
	
	if(!version) {
		localStorage["rows"] = 4;
		localStorage["columns"] = 4;
		localStorage["boxTarget"] = 'backgroundtab';	
		localStorage["backgroundColor"] = 'FFFFFF';
		localStorage["boxBackgroundColor"] = '333333';
		localStorage["boxBorderColor"] = '000000';
		localStorage["textboxBackgroundColor"] = 'CCCCCC';
		localStorage["textboxFontColor"] = '333333';
		
		localStorage["grid"] = JSON.stringify(new Object());
	} else if(version == "1.1.0") {
		var gridData = JSON.parse(localStorage.getItem("grid"));
		for(var index in gridData) {
			var boxData = gridData[index];
			if(boxData) {
				(function(boxData) {
					getNewFilename(function(filename) {
						writeTextToFile(boxData.image, filename);
						boxData.image = filename;
					})
				})(boxData);
			}
		}
		localStorage["grid"] = JSON.stringify(gridData);
	}
    // FIXME
	// UPGRADE DATABASE IF OLD VERSION

   localStorage["dataBaseVersion"] = chrome.manifest.version;

	// Remove empty boxes from the Database
	var gridData = JSON.parse(localStorage.getItem("grid"));
	for(var index in gridData) {
		var boxData = gridData[index];
		if(boxData && !boxData.hyperlink) {
			gridData[index] = undefined;
		}
	}
	localStorage["grid"] = JSON.stringify(gridData);
	
	$(body).css('overflow', 'hidden');
}

function initializeFileSystem(callback) {
	if(filesystem) return;
	var storageSpace = 10 * 1024 * 1024;
	function onSuccess(fs) {
		filesystem = fs;
		callback();
	};
	window.requestFileSystem(window.PERSISTENT, storageSpace, onSuccess, fsErrorHandler);
}

function fsErrorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

function drawGrid(rows, columns) {
	var elementContainer = $('#container');

	var boxWidth;
	var boxHeight;

	// Calculate size of boxes
	boxWidth = Math.floor(window.innerWidth / columns - 32);
	boxHeight = Math.floor(boxWidth / 10 * 8); // aspect ratio

	if ((boxHeight * rows + 32 * rows) > window.innerHeight) {
		boxHeight = Math.floor(window.innerHeight / rows - 32);
		boxWidth = Math.floor(boxHeight / 8 * 10); // aspect ratio
	}
	
	// Force minimal size of boxes
	if (boxHeight < 80 || boxWidth < 100) {
		boxHeight = 80;
		boxWidth = 100;
	}

	// Get box settings
	var storageBackgroundColor = localStorage["backgroundColor"];
	var storageBoxBackgroundColor = localStorage["boxBackgroundColor"];
	var storageBoxBorderColor = localStorage["boxBorderColor"];
	var storageBoxTarget = localStorage["boxTarget"];
	var storageTextboxBackgroundColor = localStorage["textboxBackgroundColor"];
	var storageTextboxFontColor = localStorage["textboxFontColor"];

	$(body).css('backgroundColor', '#' + storageBackgroundColor);
	
	// Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));

	var l = 0;
	for (i = 1; i <= rows; ++i) {

		var boxContainer = $(document.createElement('div'));
		boxContainer.attr('id', 'boxContainer' + i);
		boxContainer.attr('class', 'boxContainer');
		boxContainer.css('width', (boxWidth * columns) + (32 * columns) + 'px');
		boxContainer.css('height', boxHeight + 32 + 'px');
		boxContainer.css('float', 'none');
		boxContainer.css('clear', 'both');
		boxContainer.css('margin', 'auto');
		boxContainer.css('display', 'inline-block');
				
		for (j = 0; j < columns; ++j) {
			var box = $(document.createElement('div'));
			box.attr('id', 'box' + l);
			box.attr('class', 'box');
			box.css('width', boxWidth + 'px');
			box.css('height', boxHeight + 'px');
			box.css('textAlign', 'center');
			box.css('float', 'left');
			box.css('backgroundColor', '#' + storageBoxBackgroundColor);
			box.css('borderColor', '#' + storageBoxBorderColor);
						
			var boxImageContainer = $(document.createElement('div'));
			boxImageContainer.attr('id', 'boxImageContainer' + l);
			boxImageContainer.attr('class', 'boxImageContainer');
			boxImageContainer.css('width', boxWidth + 'px');
			boxImageContainer.css('height', boxHeight - 16 + 'px');
			
			var boxTextContainer = $(document.createElement('div'));
			boxTextContainer.attr('id', 'boxTextContainer' + l);
			boxTextContainer.attr('class', 'boxTextContainer');
			boxTextContainer.css('backgroundColor', '#' + storageTextboxBackgroundColor);
			boxTextContainer.css('color', '#' + storageTextboxFontColor);
				
			// Box contents
			var boxData = gridData[l];
			
			// Check if there's content or not
			if(!boxData || !boxData.hyperlink) {
				box.css('opacity', 0.1);
				box.bind('mouseover', function(event) { setOpacity(event.currentTarget.id, 1.0); });
				box.bind('mouseout', function(event) { setOpacity(event.currentTarget.id, 0.1); });
				box.bind('click', onEmptyBoxClick);

				// Box Image
				var boxImage = $(document.createElement('img'));
				boxImage.attr('id', 'boxImage' + l);
				
				boxImageContainer.append(boxImage);
				
			} else {
				// Box Title
				var boxTitle = $(document.createTextNode(boxData.title.substr(0, Math.round(boxWidth / 8))));
			
				// Box Image
				var boxImage = $(document.createElement('img'));
				boxImage.attr('id', 'boxImage' + l);
				(function(img, index, url) {
					function setSrc(src) { img.attr('src', src); }
					getFileAsText(boxData.image, setSrc, function() { takeScreenshot(url, index, setSrc); });
				})(boxImage, l, boxData.hyperlink);
				boxImage.css('width', '100%');
				boxImage.css('height', '100%');
				boxImage.bind('click', onLinkedBoxClick);
				
				boxTextContainer.append(boxTitle);
				boxImageContainer.append(boxImage);
			}
			box.append(boxImageContainer);
			box.append(boxTextContainer);

			if (j == 0) {
				box.css('clear', 'both');
			}

			boxContainer.append(box);
			++l;
		}
		elementContainer.append(boxContainer);
		elementContainer.append(document.createElement('br'));
	}
}

function resizeGrid() {

	// Resize boxes if the browser window size changes
	var rows = localStorage["rows"];
	var columns = localStorage["columns"];

	var boxWidth;
	var boxHeight;

	// Calculate size of boxes
	boxWidth = Math.floor(window.innerWidth / columns - 32);
	boxHeight = Math.floor(boxWidth / 10 * 8); // aspect ratio

	if ((boxHeight * rows + 32 * rows) > window.innerHeight) {
		boxHeight = Math.floor(window.innerHeight / rows - 32);
		boxWidth = Math.floor(boxHeight / 8 * 10); // aspect ratio
	}
	
	// Force minimal size of boxes
	if (boxHeight < 80 || boxWidth < 100) {
		boxHeight = 80;
		boxWidth = 100;
	}

    $('.boxContainer').css('width', (boxWidth * columns) + (32 * columns) + 'px');
    $('.boxContainer').css('height', boxHeight + 30 + 'px');
    $('.box').css('width', boxWidth + 'px');
    $('.box').css('height', boxHeight + 'px');
    $('.box').css('lineHeight', boxHeight + 15 + 'px');
    $('.boxImageContainer').css('width', boxWidth + 'px');
    $('.boxImageContainer').css('height', boxHeight - 16 + 'px');

	// Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));
	
	for (j = 0; j < (rows * columns); j = j + 1) {
		var elementBoxTextContainer = $('#boxTextContainer' + j);

        if(elementBoxTextContainer && gridData[j] && gridData[j].title) {
            elementBoxTextContainer.html(gridData[j].title.substr(0, Math.round(boxWidth / 8)));
        }
	}
}

function onLinkedBoxClick(event) {
	var index = event.currentTarget.id.substr(8);
	var storageBoxTarget = localStorage["boxTarget"];
	var gridData = JSON.parse(localStorage.getItem("grid"));
	var boxData = gridData[index];
	openTab(index, boxData.hyperlink, storageBoxTarget);
	$(event.currentTarget).mouseup();
}

function onEmptyBoxClick(event) {
	openSettingsMenu(event.currentTarget.id);
	$(event.currentTarget).mouseup();
}

function redrawBox(boxId) {
	var index = boxId.substr(3);
	var storageBoxTarget = localStorage["boxTarget"];
	var elementBox = $('#box' + index);
	var elementBoxImageContainer = $('#boxImageContainer' + index);	
	var elementBoxImage = $('#boxImage' + index);
	var elementBoxTextContainer = $('#boxTextContainer' + index);

	// Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));

	// Box contents
	var boxData = gridData[index];
	elementBox.unbind('click');
	elementBoxImage.unbind('click');
	
   if(boxData && boxData.image) {
		(function(img) {
			function setSrc(src) { img.attr('src', src); }
			getFileAsText(boxData.image, setSrc);
		})(elementBoxImage);
		elementBoxImage.css('width', '100%');
		elementBoxImage.css('height','100%');
		elementBoxImage.bind('click', onLinkedBoxClick);
   } else if(elementBoxImage) {
	   elementBoxImage.remove();
		var boxImage = $(document.createElement('img'));
		boxImage.attr('id', 'boxImage' + index);
		elementBoxImage = boxImage;
		elementBoxImageContainer.append(boxImage);
	}

   if(boxData && boxData.title) {
      var boxWidth = elementBox.css('width').substr(0, elementBox.css('width').length - 2);
	   elementBoxTextContainer.html(boxData.title.substr(0, Math.round(boxWidth / 8)));
	} else {
      elementBoxTextContainer.html('');
	}

	if(boxData && boxData.hyperlink) {
	   elementBox.css('opacity', 1.0);
	   elementBox.unbind('mouseover');
	   elementBox.unbind('mouseout');
	} else {
	   elementBox.bind('mouseover', function(event) { setOpacity(event.currentTarget.id, 1.0); });
		elementBox.bind('mouseout', function(event) { setOpacity(event.currentTarget.id, 0.1); });
		elementBox.bind('click', onEmptyBoxClick);
	   elementBox.css('opacity', 0.1);
	}
}

function openSettingsMenu(boxId) {
	var elementSettingsHeadline = $('#settingsHeadline');
	var elementAddBoxTitle = $('#addBoxTitle');
	var elementAddBoxHyperlink = $('#addBoxHyperlink');

	setVisibility('overlay', 'visible');
	setVisibility('overlayContainer', 'visible');
	setVisibility('settingsContainer', 'visible');
	setVisibility('settingsAdd', 'visible');

   // Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));
	var index = boxId.substr(3);
   if(gridData[index]) {
		var title = gridData[index].title;
		var hyperlink = gridData[index].hyperlink;
		
		elementSettingsHeadline.html('Edit Bookmark');
		elementAddBoxTitle.val(title);
		elementAddBoxHyperlink.val(hyperlink);
	} else {
		elementSettingsHeadline.html('Add Bookmark');
 		elementAddBoxTitle.val('');       
		elementAddBoxHyperlink.val('http://www.');
	}

	var elementButtonSaveBoxSettings = $('#buttonSaveBoxSettings');
	elementButtonSaveBoxSettings.unbind('click');
	elementButtonSaveBoxSettings.bind('click', {box: boxId}, function(event) { saveBoxSettings(event.data.box); });
}

function closeSettingsMenu() {
	setVisibility('overlay', 'hidden');
	setVisibility('overlayContainer', 'hidden');
	setVisibility('settingsContainer', 'hidden');
	setVisibility('settingsAdd', 'hidden');
}

function saveBoxSettings(boxId) {
	var elementAddBoxTitle = document.getElementById('addBoxTitle');
	var elementAddBoxHyperlink = document.getElementById('addBoxHyperlink');

	var title = elementAddBoxTitle.value;
	var hyperlink = elementAddBoxHyperlink.value;
	
	// Added validation to allow Chrome Apps Bookmarking
    if(hyperlink.substr(0,7) != 'http://' && hyperlink.substr(0,8) != 'https://' && hyperlink.substr(0,19) != 'chrome-extension://') {
       hyperlink = 'http://' + hyperlink;
    }
   
	// Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));
	var index = boxId.substr(3);
	if(!gridData[index])
		gridData[index] = new Object();
		
	gridData[index].title = title;
	gridData[index].hyperlink = hyperlink;

	localStorage["grid"] = JSON.stringify(gridData);

	 // create screenshot of the webpage
	takeScreenshot(hyperlink, index, function(){redrawBox(boxId);});
	closeSettingsMenu();
}

function acceptSuggestion(hyperlink) {
	$('#addBoxHyperlink').val(hyperlink);
	hideSuggestions();
}

function hideSuggestions() {
	$('#hyperlinkSuggestions').html('');
}

function hyperlinkSuggestions(keyword) {
	var elementHyperlinkSuggestions = $('#hyperlinkSuggestions');
	elementHyperlinkSuggestions.html('');
	
	var table = $(document.createElement('table'));
	table.attr('id', 'suggestionsTable');
	table.css('margin-top', '1px');
	table.css('width', '302px');
	table.css('background-color', '#FFFFFF');
	table.css('color', '#000000');
	table.css('border', '1px solid #333333');

	chrome.history.search(
		{
			text: keyword,
			maxResults: 5
		},
		function(historyItems) {
			insertionSort(historyItems, function(a, b) {
				return a.visitCount < b.visitCount;
			});
		
			for(var i in historyItems) {
			
				var tr = $(document.createElement('tr'));
				var td = $(document.createElement('td'));
				
				var a = $(document.createElement('a'));
				a.attr('href', '#');
				a.attr('onclick', 'acceptSuggestion("' + historyItems[i].url + '");');
				
				if(historyItems[i].url.length >= 40) {
					var txt = $(document.createTextNode(historyItems[i].url.substr(0,40) + ' ...'  + ' (' + historyItems[i].visitCount + ')'));
				} else {
					var txt = $(document.createTextNode(historyItems[i].url + ' (' + historyItems[i].visitCount + ')'));
				}
				
				a.append(txt);
				td.append(a);
				tr.append(td);
				table.append(tr);
			}
		}
	);
	
	elementHyperlinkSuggestions.append(table);
}

function insertionSort(array, compareFunc) {
	for(var i = 1; i < array.length; ++i) {
		var val = array[i];
		var j = i - 1;
		var done = false;
		do {
			if(compareFunc(array[j], val)) {
				array[j+1] = array[j];
				--j;
				if(j < 0) {
					done = true;
				}
			} else {
				done = true;
			}
		} while(!done)
		array[j+1] = val;
	}
	
	return array;
}

function refreshScreenshot(boxId) {
    var gridData = JSON.parse(localStorage.getItem("grid"));
    var index = boxId.substr(3);
    takeScreenshot(gridData[index].hyperlink, index, function(){redrawBox(boxId);});
}

function deleteBox(boxId) {
	// Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));
	var index = boxId.substr(3);
	deleteFile(gridData[index].image);
   gridData[index] = undefined;
   localStorage["grid"] = JSON.stringify(gridData);
   redrawBox(boxId);
}

function openPreferences() {

	// check if there's already a preferences window opened and focus it, or create a new one.
	var open = false;
    var views = chrome.extension.getViews();
    for (var i in views) {
        var location = views[i].location;
        if (location.pathname == '/preferences.html') {
            location.reload();
            views[i].focus();
            open = true;
        }
    }
    if(open != true) {
	    chrome.tabs.create(
		    {url:"preferences.html", selected:true});
    }
}

function movableBoxes(rows, columns) {
	$(".box").draggable({
		distance: 5,
		helper: 'clone',
		revert: 'invalid',
		snap: '.box',
		snapMode: 'inner',
		stack: '.box',
		start: function(event, ui) {
			$(this).unbind('click', onEmptyBoxClick);
			$(this).unbind('click', onLinkedBoxClick);
		},
		stop: function(event, ui) {
			if(isBoxEmpty(this.id)) {
				$(this).bind('click', onEmptyBoxClick);
			} else {
				$(this).bind('click', onLinkedBoxClick);
			}
		}
	});
	
	$(".box").droppable({
		accept: '.box',
		greedy: true,
		drop: function( event, ui ) {
			swapBoxes(ui.draggable.attr('id'), $(this).attr('id'));
		},
	});
}

function swapBoxes(srcBox, destBox) {
	var srcIndex = srcBox.substr(3);
	var destIndex = destBox.substr(3);

   // Parse Grid Data from LocalStorage with JSON
	var gridData = JSON.parse(localStorage.getItem("grid"));

   var srcBoxData = gridData[srcIndex];
   var destBoxData = gridData[destIndex];

   // swap box data
   gridData[srcIndex] = destBoxData;
   gridData[destIndex] = srcBoxData;
    
   localStorage["grid"] = JSON.stringify(gridData);

   // redraw swapped boxes
	redrawBox(destBox);
	redrawBox(srcBox);
}

function isBoxEmpty(boxId) {
	var index = boxId.substr(3);
	var gridData = JSON.parse(localStorage.getItem("grid"));
	if(gridData[index]) {
		return false;
	} else {
		return true;
	}
}

function setStatus(text) {
	$('#status').html(text);
}

function openTab(boxId, url, target) {
	var tabId;
	var currentTab = chrome.tabs.getCurrent(
		function(tab) {	
			tabId = tab.id;
		});

	// open in new tab
	if(target == 'newtab') {
		chrome.tabs.create(
			{url:"" + url + "",selected:true});
	// open in a non focused tab
	} else if (target == 'backgroundtab') {
		chrome.tabs.create(
			{url:"" + url + "",selected:false});
	// open in current tab
	} else {
		chrome.tabs.getCurrent(
			function(tab) {	
				chrome.tabs.update(tab.id,
					{url:"" + url + ""});
			});
	}
}

function storeScreenshot(index, dataUrl, callback) {
	getNewFilename(function(filename) {
		var gridData = JSON.parse(localStorage.getItem("grid"));
		gridData[index].image = filename;
		localStorage["grid"] = JSON.stringify(gridData);
		writeTextToFile(dataUrl, filename, function() { callback(dataUrl); });
	});
}

function takeScreenshot(url, index, callback) {

	if(url) {
		// create a new window for capturing the screen
		chrome.windows.create(
			{url: url, top: screen.height, left: screen.width, height: 768, width: 1024, focused: false, type: "popup"}, 
			function(window) {
					var timerRunning = false;
					var resetTimer = false;
				 chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
					 if ( tabId == window.tabs[0].id && info.status == "complete" ) {
							if(timerRunning) {
									resetTimer = true;
							} else {
								 timerRunning = true;
								 $.doTimeout(1000, function timeout() {
									  if(resetTimer) {
											resetTimer = false;
											$.doTimeout(1000, timeout);
									  } else {
											chrome.tabs.get(tabId, function(tab) {
													if(tab.status == "loading") {
														 $.doTimeout(1000, timeout);
													} else {
													chrome.tabs.captureVisibleTab(window.id, 
														 function(dataUrl) {
															 // save the screenshot
															 storeScreenshot(index, dataUrl, callback);
															 chrome.windows.remove(window.id);
														 });
													chrome.tabs.onUpdated.removeListener(listener);
													}
											});
									  }
								});
						  }
					 }
				});
			}
		);
	}
}

function getFileAsText(filename, onSuccess, onError) {
	filesystem.root.getFile(filename, {create: false}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				if(onSuccess)
					onSuccess(this.result);
			};

			reader.readAsText(file);
		}, onError);
	}, onError);
}

function writeTextToFile(text, filename, onSuccess) {
	filesystem.root.getFile(filename, {create: true}, function(fileEntry) {
		fileEntry.createWriter(function(fileWriter) {
			fileWriter.onwriteend = function() {
				if(onSuccess)
					onSuccess();
			}
			
			fileWriter.onerror = function(e) {
				console.log('Write failed: ' + e.toString());
			};
			var bb = new window.BlobBuilder();
			bb.append(text);
			fileWriter.write(bb.getBlob("text/plain"));
		}, fsErrorHandler);

	}, fsErrorHandler);
}

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function getNewFilename(callback) {
	var filename = randomString(8);
	fileExists(filename, function(exists) {
		if(exists) {
			getNewFilename(callback);
		} else {
			callback(filename);
		}
	});
}

function fileExists(filename, callback) {
	var dirReader = filesystem.root.createReader();
	var entries = [];
	
	function toArray(list) {
		return Array.prototype.slice.call(list || [], 0);
	}
	
	function readEntries() {
		dirReader.readEntries(function(results) {
			if (results.length) {
				entries = entries.concat(toArray(results));
				readEntries();
			} else {
				entries.forEach(function(entry, i) {
					if(entry.name == filename) {
						callback(true);
						return;
					}
				});
				callback(false);
			}
		}, fsErrorHandler);
	}
	readEntries();
}

function deleteFile(filename) {
	filesystem.root.getFile(filename, {create: false}, function(fileEntry) {
		fileEntry.remove(null, fsErrorHandler);
	}, fsErrorHandler);
}

function renameFile(cwd, src, newName) {
	cwd.getFile(src, {}, function(fileEntry) {
		fileEntry.moveTo(cwd, newName);
	}, fsErrorHandler);
}

function swapFiles(filename1, filename2) {
	renameFile(filesystem.root, filename1, "temp");
	renameFile(filesystem.root, filename2, filename1);
	renameFile(filesystem.root, "temp", filename2);
}