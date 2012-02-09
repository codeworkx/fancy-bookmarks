chrome.manifest = (function() {

    var manifestObject = false;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            manifestObject = JSON.parse(xhr.responseText);
        }
    };
    xhr.open("GET", chrome.extension.getURL('/manifest.json'), false);

    try {
        xhr.send();
    } catch(e) {
        console.log('Couldn\'t load manifest.json');
    }

    return manifestObject;

})();

function setPercentageWindowSize(parentId, id, percent, align) {
	if(!percent) return;
	
	var parent = document.getElementById(parentId);
	var element = document.getElementById(id);
	if (element) {
		if (parent) {
			winW = parent.offsetWidth;
			winH = parent.offsetHeight;
		}
		else if (window.innerWidth && window.innerHeight) {
			winW = window.innerWidth;
			winH = window.innerHeight;
		}
		
		newW = Math.round((winW / 100) * percent);
		newH = Math.round((winH / 100) * percent);
			
		element.style.width = newW + 'px';
		element.style.height = newH + 'px';
	
		if (align == 'center') {
			offsetW = Math.round((winW - newW) / 2);
			offsetH = Math.round((winH - newH) / 2);
			
			element.style.marginLeft = '-' + offsetW + 'px';
			element.style.marginTop = offsetH + 'px';
		}
	}
}

function setOpacity(id, opacity) {

	var element = document.getElementById(id);
	element.style.opacity = opacity;
}

function setVisibility(id, state) {

	var element = document.getElementById(id);
	
	if(element) {
	
		if(state == 'visible') {
			element.style.visibility = 'visible';
		} else {
			element.style.visibility = 'hidden';
		}
	}
}