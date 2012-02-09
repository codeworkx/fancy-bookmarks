function main() {

    restoreOptions();
    inputSliders();
    
}

function inputSliders() {

    var elementRows = document.getElementById("inputRows");
    var elementColumns = document.getElementById("inputColumns");

    $(function() {
		$( "#inputRowsSlider" ).slider({ min: 1, max: 10, value: elementRows.value });
	});

	$( "#inputRowsSlider" ).bind( "slide", function(event, ui) {
        elementRows.value = ui.value;
    });

    $(function() {
		$( "#inputColumnsSlider" ).slider({ min: 1, max: 10, value: elementColumns.value });
	});

	$( "#inputColumnsSlider" ).bind( "slide", function(event, ui) {
        elementColumns.value = ui.value;
    });

}

function saveOptions() {
	var elementRows = document.getElementById("inputRows");
	var storageRows = elementRows.value;
	localStorage["rows"] = storageRows;
	
	var elementColumns = document.getElementById("inputColumns");
	var storageColumns = elementColumns.value;
	localStorage["columns"] = storageColumns;
	
	var elementBoxTarget = document.getElementById("inputBoxTarget");
	var storageBoxTarget = elementBoxTarget.value;
	localStorage["boxTarget"] = storageBoxTarget;
	
	var elementBackgroundColor = document.getElementById("inputBackgroundColor");
	var storageBackgroundColor = elementBackgroundColor.value;
	localStorage["backgroundColor"] = storageBackgroundColor;

	var elementBoxBackgroundColor = document.getElementById("inputBoxBackgroundColor");
	var storageBoxBackgroundColor = elementBoxBackgroundColor.value;
	localStorage["boxBackgroundColor"] = storageBoxBackgroundColor;
	
	var elementBoxBorderColor = document.getElementById("inputBoxBorderColor");	
	var storageBoxBorderColor = elementBoxBorderColor.value;
	localStorage["boxBorderColor"] = storageBoxBorderColor;
	
	var elementTextboxBackgroundColor = document.getElementById("inputTextboxBackgroundColor");
	var storageTextboxBackgroundColor = elementTextboxBackgroundColor.value;
	localStorage["textboxBackgroundColor"] = storageTextboxBackgroundColor;

	
	var elementTextboxFontColor = document.getElementById("inputTextboxFontColor");
	var storageTextboxFontColor = elementTextboxFontColor.value;
	localStorage["textboxFontColor"] = storageTextboxFontColor;
	
	// Update status to let user know options were saved.
	var status = document.getElementById("buttonSave");
	status.innerHTML = "Done";
	setTimeout(function() {
		status.innerHTML = "Save";
	}, 750);

	// reload all fancy bookmarks windows
    var views = chrome.extension.getViews();
    for (var i in views) {
        var location = views[i].location;
        if (location.pathname == '/fancybookmarks.html') {
            location.reload();
        }
    }
}

function restoreOptions() {
	var storageRows = localStorage["rows"];
	var elementRows = document.getElementById("inputRows");
	elementRows.value = storageRows;
	
	var storageColumns = localStorage["columns"];
	var elementColumns = document.getElementById("inputColumns");
	elementColumns.value = storageColumns;
	
	var storageBoxTarget = localStorage["boxTarget"];
	var elementBoxTarget = document.getElementById("inputBoxTarget");
	elementBoxTarget.value = storageBoxTarget;

	var storageBackgroundColor = localStorage["backgroundColor"];
	var elementBackgroundColor = document.getElementById("inputBackgroundColor");
	elementBackgroundColor.value = storageBackgroundColor;
	
	var storageBoxBackgroundColor = localStorage["boxBackgroundColor"];
	var elementBoxBackgroundColor = document.getElementById("inputBoxBackgroundColor");
	elementBoxBackgroundColor.value = storageBoxBackgroundColor;
	
	var storageBoxBorderColor = localStorage["boxBorderColor"];
	var elementBoxBorderColor = document.getElementById("inputBoxBorderColor");
	elementBoxBorderColor.value = storageBoxBorderColor;
	
	var storageTextboxBackgroundColor = localStorage["textboxBackgroundColor"];
	var elementTextboxBackgroundColor = document.getElementById("inputTextboxBackgroundColor");
	elementTextboxBackgroundColor.value = storageTextboxBackgroundColor;
	
	var storageTextboxFontColor = localStorage["textboxFontColor"];
	var elementTextboxFontColor = document.getElementById("inputTextboxFontColor");
	elementTextboxFontColor.value = storageTextboxFontColor;
	
	$('#inputBackgroundColor, #inputBoxBackgroundColor, #inputBoxBorderColor, #inputTextboxBackgroundColor, #inputTextboxFontColor').ColorPicker({
		onSubmit: function(hsb, hex, rgb, el) {
			$(el).val(hex);
			$(el).ColorPickerHide();
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		}
	})
	.bind('keyup', function(){
		$(this).ColorPickerSetColor(this.value);
	});

}

function exportData() {
    var elementExport = document.getElementById("inputExport");

    var preferencesData = new Object();
    preferencesData["rows"] = localStorage.getItem("rows");
	preferencesData["columns"] = localStorage.getItem("columns");
	preferencesData["boxTarget"] = localStorage.getItem("boxTarget");	
	preferencesData["backgroundColor"] = localStorage.getItem("backgroundColor");
	preferencesData["boxBackgroundColor"] = localStorage.getItem("boxBackgroundColor");
	preferencesData["boxBorderColor"] = localStorage.getItem("boxBorderColor");
	preferencesData["textboxBackgroundColor"] = localStorage.getItem("textboxBackgroundColor");
	preferencesData["textboxFontColor"] = localStorage.getItem("textboxFontColor");
	preferencesData["grid"] = localStorage.getItem("grid");
	preferencesData["dataBaseVersion"] = localStorage.getItem("dataBaseVersion");

    elementExport.value = JSON.stringify(preferencesData);

    // Update status to let user know options were saved.
	var status = document.getElementById("buttonExport");
	status.innerHTML = "Done";
	setTimeout(function() {
	    status.innerHTML = "Export";
	}, 750);
}

function importData(files) {

    var f = files[0]; 

    if (f) {
        var r = new FileReader();
        r.onload = function(e) { 
            var contents = e.target.result;
            if(contents) {

                var preferencesData = new Object();
                preferencesData = JSON.parse(contents);

                if(preferencesData["rows"]) {
                    localStorage["rows"] = preferencesData["rows"];
                }
                if(preferencesData["rows"]) {
	                localStorage["columns"] = preferencesData["columns"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["boxTarget"] = preferencesData["boxTarget"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["backgroundColor"] = preferencesData["backgroundColor"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["boxBackgroundColor"] = preferencesData["boxBackgroundColor"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["boxBorderColor"] = preferencesData["boxBorderColor"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["textboxBackgroundColor"] = preferencesData["textboxBackgroundColor"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["textboxFontColor"] = preferencesData["textboxFontColor"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["grid"] = preferencesData["grid"];
	            }
	            if(preferencesData["rows"]) {
	                localStorage["dataBaseVersion"] = preferencesData["dataBaseVersion"];
	            }

                alert('File imported');

	            // reload all fancy bookmarks windows
                var views = chrome.extension.getViews();
                for (var i in views) {
                    var location = views[i].location;
                    if (location.pathname == '/fancybookmarks.html') {
                        location.reload();
                    }
                }

                // reload the preferences page
                chrome.tabs.getCurrent(function (tab) {
                    chrome.tabs.update(tab.id, { url:"/preferences.html" });
                });

            }
        }
        r.readAsText(f);
    } else { 
        alert("Failed to load file");
    }
}