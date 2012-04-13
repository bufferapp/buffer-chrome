var OverlayIframe = function(data, config, doneCallback) {
    
    var buildSrc = function() {
        var src = config.overlay.endpoint;
        if(data.local) src = config.overlay.localendpoint;
        
        // Add button attributes
        var first = true, count = 0;
        for(var i=0, l=config.attributes.length; i < l; i++) {
            var a = config.attributes[i];
            if( ! data[a.name] ) continue;
            if( first ) { src += '?'; first = false; }
            count += 1;
            if( count > 1 ) src += '&';
            src += a.name + '=' + a.encode(data[a.name])
        }
        
        return src;
    };
    
    var temp = document.createElement('iframe');
    
    temp.allowtransparency = 'true';
	temp.scrolling = 'no';
	temp.id = 'buffer_overlay';
	temp.name = 'buffer_overlay';
	temp.style.cssText = config.overlay.getCSS();
	
	temp.src = buildSrc();
	
	console.log(temp.src);
	
	document.body.appendChild(temp);
    
    // Bind close listener
	bufferpm.bind("buffermessage", function(data) {
		document.body.removeChild(temp);
		bufferpm.unbind("buffermessage");
		setTimeout(function () {
		    doneCallback(data);
	    }, 0);
	});
    
};

