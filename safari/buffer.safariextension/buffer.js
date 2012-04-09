if(window === window.top) {

	function handle_message(msgEvent) {
		var messageName = msgEvent.name;
		var messageData = msgEvent.message;

		if(messageName === 'activate buffer')
		{
			(function(){var c=document.getElementsByTagName('body')[0],d=document.createElement('input');d.type='hidden';d.value='safari';d.id='buffer_source';c.appendChild(d); a=document.getElementsByTagName('head')[0],b=document.createElement('script');b.type='text/javascript';b.src='http://static.bufferapp.com/js/bookmarklet.min.js';a.appendChild(b);})();
		}
	};

	safari.self.addEventListener("message", handle_message, false);
}