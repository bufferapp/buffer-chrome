if(window === window.top) {
	
	$(document).ready(function(){
		$(document).bind('keydown', 'alt+b', function(){
			BufferBookmarklet();
		});
		var a=document.getElementsByTagName('head')[0],b=document.createElement('script');
		b.type='text/javascript';
		b.src='http://static.bufferapp.com/js/postmessage.js';
		a.appendChild(b);		
	});
 
	// handle Twitter.com integration
	if(window.location.href.search('twitter.com/') != -1) {
		TwitterBuffer();
	}

}